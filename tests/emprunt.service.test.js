jest.mock('../src/repositories/emprunt.repository', () => ({
  findReservationById: jest.fn(),
  claimMateriel: jest.fn(),
  releaseMateriel: jest.fn(),
  transitionReservation: jest.fn(),
  createEmprunt: jest.fn(),
  deleteEmprunt: jest.fn(),
  createMouvement: jest.fn(),
  findEmpruntById: jest.fn(),
  markReturned: jest.fn(),
  findOverdue: jest.fn(),
  findMouvementsByMagasin: jest.fn(),
}));

const repository = require('../src/repositories/emprunt.repository');
const service = require('../src/services/emprunt.service');

const magasinId = 'magasin-1';
const materiel = { _id: 'materiel-1', magasin: magasinId };
const reservation = {
  _id: 'reservation-1',
  utilisateur: 'utilisateur-1',
  materiel,
  statut: 'CONFIRMEE',
};
const gestionnaire = { role: 'GESTIONNAIRE', magasin: magasinId };

beforeEach(() => jest.clearAllMocks());

test('remet un matériel et journalise sa sortie', async () => {
  repository.findReservationById.mockResolvedValue(reservation);
  repository.claimMateriel.mockResolvedValue(materiel);
  repository.transitionReservation.mockResolvedValue({ statut: 'EN_COURS' });
  repository.createEmprunt.mockResolvedValue({ _id: 'emprunt-1' });

  await expect(
    service.prendreMateriel(reservation._id, gestionnaire)
  ).resolves.toEqual({ _id: 'emprunt-1' });

  expect(repository.createEmprunt).toHaveBeenCalledWith(
    expect.objectContaining({ reservation: reservation._id, dateSortie: expect.any(Date) })
  );
  expect(repository.createMouvement).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'SORTIE', materiel: materiel._id })
  );
});

test('refuse la sortie si le gestionnaire appartient à un autre magasin', async () => {
  repository.findReservationById.mockResolvedValue(reservation);

  await expect(
    service.prendreMateriel(reservation._id, { magasin: 'magasin-2' })
  ).rejects.toMatchObject({ status: 403 });

  expect(repository.claimMateriel).not.toHaveBeenCalled();
});

test('refuse la sortie si le matériel est déjà indisponible', async () => {
  repository.findReservationById.mockResolvedValue(reservation);
  repository.claimMateriel.mockResolvedValue(null);

  await expect(
    service.prendreMateriel(reservation._id, gestionnaire)
  ).rejects.toMatchObject({ status: 409 });
  expect(repository.createEmprunt).not.toHaveBeenCalled();
});

test.each([
  ['BON', true],
  ['ENDOMMAGE', false],
])('enregistre un retour %s et applique la disponibilité', async (etatRetour, disponible) => {
  const emprunt = {
    _id: 'emprunt-1',
    dateRetour: null,
    reservation: { ...reservation, statut: 'EN_COURS' },
  };
  repository.findEmpruntById.mockResolvedValue(emprunt);
  repository.markReturned.mockResolvedValue({ _id: emprunt._id });
  repository.transitionReservation.mockResolvedValue({ statut: 'TERMINEE' });

  await service.retournerMateriel(emprunt._id, gestionnaire, etatRetour);

  expect(repository.markReturned).toHaveBeenCalledWith(
    emprunt._id,
    expect.any(Date),
    etatRetour
  );
  expect(repository.releaseMateriel).toHaveBeenCalledWith(materiel._id, disponible);
  expect(repository.createMouvement).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'RETOUR', materiel: materiel._id })
  );
});

test('limite les emprunts en retard au magasin du gestionnaire', async () => {
  repository.findOverdue.mockResolvedValue([]);

  await service.listerRetards(gestionnaire);

  expect(repository.findOverdue).toHaveBeenCalledWith(magasinId, expect.any(Date));
});
