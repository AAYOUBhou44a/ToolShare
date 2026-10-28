jest.mock('../services/authService', () => ({
  authenticate: jest.fn(),
}));

jest.mock('../services/reservationService', () => ({
  verifierDisponibilite: jest.fn(),
  creer: jest.fn(),
  lister: jest.fn(),
  obtenir: jest.fn(),
  annuler: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const authService = require('../services/authService');
const reservationService = require('../services/reservationService');

const utilisateur = {
  id: '66f000000000000000000099',
  role: 'UTILISATEUR',
};
const magasin = '66f000000000000000000001';
const materiel = '66f000000000000000000002';

const authentifier = (role = 'UTILISATEUR') => {
  authService.authenticate.mockResolvedValue({ ...utilisateur, role });
};

const avecToken = (requete) =>
  requete.set('Authorization', 'Bearer reservation-token');

describe('Routes de réservation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authentifier();
  });

  test("creates a reservation with the authenticated user's identity", async () => {
    const dateDebut = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    reservationService.creer.mockResolvedValue({ id: 'reservation-1' });

    const response = await avecToken(request(app).post('/api/reservations'))
      .send({ magasin, materiel, dateDebut, dureeHeures: 2 });

    expect(response.status).toBe(201);
    expect(reservationService.creer).toHaveBeenCalledWith(
      expect.objectContaining({
        magasin,
        materiel,
        dateDebut: new Date(dateDebut),
        dureeHeures: 2,
      }),
      expect.objectContaining({ id: utilisateur.id })
    );
  });

  test('rejects invalid reservation input and prevents managers from booking', async () => {
    const invalid = await avecToken(
      request(app).post('/api/reservations')
    ).send({ magasin, materiel, dateDebut: 'not-a-date', dureeHeures: 0 });
    expect(invalid.status).toBe(400);

    authentifier('GESTIONNAIRE');
    const forbidden = await avecToken(
      request(app).post('/api/reservations')
    ).send({
      magasin,
      materiel,
      dateDebut: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      dureeHeures: 1,
    });
    expect(forbidden.status).toBe(403);
    expect(reservationService.creer).not.toHaveBeenCalled();
  });

  test('validates availability query and returns the service result', async () => {
    reservationService.verifierDisponibilite.mockResolvedValue({
      disponible: true,
      raison: 'Disponible',
    });
    const dateDebut = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const response = await avecToken(
      request(app).get('/api/reservations/disponibilite')
    ).query({ magasin, materiel, dateDebut, dureeHeures: '1.5' });

    expect(response.status).toBe(200);
    expect(response.body.data.disponible).toBe(true);
    expect(reservationService.verifierDisponibilite).toHaveBeenCalledWith(
      expect.objectContaining({
        dateDebut: new Date(dateDebut),
        dureeHeures: 1.5,
      })
    );
  });

  test('lists reservations with parsed filters and delegates ownership scoping', async () => {
    reservationService.lister.mockResolvedValue([{ id: 'reservation-1' }]);
    const response = await avecToken(
      request(app).get('/api/reservations')
    ).query({ statut: 'CONFIRMEE' });

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(reservationService.lister).toHaveBeenCalledWith(
      expect.objectContaining({ id: utilisateur.id }),
      { statut: 'CONFIRMEE' }
    );
  });

  test('delegates cancellation for authenticated users only', async () => {
    reservationService.annuler.mockResolvedValue({
      id: 'reservation-1',
      statut: 'ANNULEE',
    });
    const response = await avecToken(
      request(app).patch('/api/reservations/66f000000000000000000003/annuler')
    );

    expect(response.status).toBe(200);
    expect(reservationService.annuler).toHaveBeenCalledWith(
      '66f000000000000000000003',
      expect.objectContaining({ id: utilisateur.id })
    );
  });
});
