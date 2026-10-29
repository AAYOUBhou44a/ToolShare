jest.mock('../repositories/magasinRepository', () => ({
  findById: jest.fn(),
}));

jest.mock('../repositories/reservationRepository', () => ({
  findMaterielById: jest.fn(),
  incrementVersion: jest.fn(),
  findOverlapping: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByIdAndCancel: jest.fn(),
  findMaterielIdsByMagasin: jest.fn(),
}));

const mongoose = require('mongoose');
const magasinRepository = require('../repositories/magasinRepository');
const reservationRepository = require('../repositories/reservationRepository');
const reservationService = require('./reservationService');

const magasinId = '66f000000000000000000001';
const materielId = '66f000000000000000000002';
const utilisateur = { id: '66f000000000000000000003', role: 'UTILISATEUR' };
const dateDebut = new Date(Date.now() + 24 * 60 * 60 * 1000);
const details = {
  magasin: magasinId,
  materiel: materielId,
  dateDebut,
  dureeHeures: 1.5,
};

describe('Règles métier des réservations', () => {
  let session;

  beforeEach(() => {
    jest.clearAllMocks();
    session = {
      withTransaction: jest.fn(async (callback) => callback()),
      endSession: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
    magasinRepository.findById.mockResolvedValue({ id: magasinId, actif: true });
    reservationRepository.findMaterielById.mockResolvedValue({
      _id: materielId,
      magasin: magasinId,
      actif: true,
      disponible: true,
    });
    reservationRepository.incrementVersion.mockResolvedValue(true);
    reservationRepository.findOverlapping.mockResolvedValue(null);
    reservationRepository.create.mockResolvedValue({ id: 'reservation-1' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('calculates the end date and checks interval overlap availability', async () => {
    const result = await reservationService.verifierDisponibilite(details);

    expect(result.disponible).toBe(true);
    expect(reservationRepository.findOverlapping).toHaveBeenCalledWith(
      materielId,
      dateDebut,
      new Date(dateDebut.getTime() + 90 * 60 * 1000)
    );
  });

  test('passes exact time boundaries without rounding the requested interval', async () => {
    await reservationService.verifierDisponibilite(details);
    const [, debutDemande, finDemande] =
      reservationRepository.findOverlapping.mock.calls[0];

    expect(debutDemande).toEqual(dateDebut);
    expect(finDemande).toEqual(
      new Date(dateDebut.getTime() + 90 * 60 * 1000)
    );
  });

  test('creates reservation atomically after acquiring the equipment write guard', async () => {
    const created = await reservationService.creer(details, utilisateur);

    expect(created.id).toBe('reservation-1');
    expect(session.withTransaction).toHaveBeenCalledTimes(1);
    expect(reservationRepository.incrementVersion).toHaveBeenCalledWith(
      materielId,
      magasinId,
      session
    );
    expect(reservationRepository.findOverlapping).toHaveBeenCalledWith(
      materielId,
      dateDebut,
      new Date(dateDebut.getTime() + 90 * 60 * 1000),
      session
    );
    expect(reservationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        utilisateur: utilisateur.id,
        materiel: materielId,
        statut: 'CONFIRMEE',
      }),
      session
    );
    expect(session.endSession).toHaveBeenCalledTimes(1);
  });

  test('rejects overlapping reservations and always ends the transaction session', async () => {
    reservationRepository.findOverlapping.mockResolvedValueOnce({ id: 'busy' });

    await expect(
      reservationService.creer(details, utilisateur)
    ).rejects.toMatchObject({ status: 409 });

    expect(reservationRepository.create).not.toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalledTimes(1);
  });

  test('rejects past starts and non-positive durations', async () => {
    await expect(
      reservationService.creer(
        { ...details, dateDebut: new Date(Date.now() - 1000) },
        utilisateur
      )
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      reservationService.creer({ ...details, dureeHeures: 0 }, utilisateur)
    ).rejects.toMatchObject({ status: 400 });
  });

  test('restricts users to their own reservations and managers to their store', async () => {
    reservationRepository.findAll.mockResolvedValue([]);
    await reservationService.lister(utilisateur, { statut: 'CONFIRMEE' });
    expect(reservationRepository.findAll).toHaveBeenLastCalledWith({
      statut: 'CONFIRMEE',
      utilisateur: utilisateur.id,
    });

    reservationRepository.findMaterielIdsByMagasin.mockResolvedValue([
      materielId,
    ]);
    await reservationService.lister(
      { id: 'manager-1', role: 'GESTIONNAIRE', magasin: magasinId },
      { materiel: materielId }
    );
    expect(reservationRepository.findAll).toHaveBeenLastCalledWith({
      materiel: { $in: [materielId], $eq: materielId },
    });
  });

  test('cancels only an owned confirmed reservation that has not started', async () => {
    reservationRepository.findById.mockResolvedValue({
      utilisateur: utilisateur.id,
      statut: 'CONFIRMEE',
      dateDebut: new Date(Date.now() + 60 * 60 * 1000),
    });
    reservationRepository.findByIdAndCancel.mockResolvedValue({
      id: 'reservation-1',
      statut: 'ANNULEE',
    });

    const cancelled = await reservationService.annuler(
      '66f000000000000000000004',
      utilisateur
    );

    expect(cancelled.statut).toBe('ANNULEE');
    expect(reservationRepository.findByIdAndCancel).toHaveBeenCalledWith(
      '66f000000000000000000004',
      utilisateur.id,
      expect.any(Date)
    );
  });
});
