jest.mock('../src/services/authService', () => ({
  authenticate: jest.fn(),
}));
jest.mock('../src/services/emprunt.service', () => ({
  prendreMateriel: jest.fn(),
  retournerMateriel: jest.fn(),
  listerRetards: jest.fn(),
  listerMouvements: jest.fn(),
}));

const request = require('supertest');
const authService = require('../src/services/authService');
const empruntService = require('../src/services/emprunt.service');
const app = require('../src/app');

beforeEach(() => jest.clearAllMocks());

test('refuse les requêtes sans authentification', async () => {
  const response = await request(app).get('/api/emprunts/retards');

  expect(response.status).toBe(401);
  expect(empruntService.listerRetards).not.toHaveBeenCalled();
});

test('refuse aux utilisateurs non gestionnaires l’accès aux emprunts', async () => {
  authService.authenticate.mockResolvedValue({
    id: 'utilisateur-1',
    role: 'UTILISATEUR',
  });

  const response = await request(app)
    .get('/api/emprunts/retards')
    .set('Authorization', 'Bearer token-test');

  expect(response.status).toBe(403);
  expect(empruntService.listerRetards).not.toHaveBeenCalled();
});

test('autorise un gestionnaire à consulter les retards de son magasin', async () => {
  const gestionnaire = {
    id: 'gestionnaire-1',
    role: 'GESTIONNAIRE',
    magasin: 'magasin-1',
  };
  authService.authenticate.mockResolvedValue(gestionnaire);
  empruntService.listerRetards.mockResolvedValue([{ _id: 'emprunt-1' }]);

  const response = await request(app)
    .get('/api/emprunts/retards')
    .set('Authorization', 'Bearer token-test');

  expect(response.status).toBe(200);
  expect(response.body.count).toBe(1);
  expect(empruntService.listerRetards).toHaveBeenCalledWith(gestionnaire);
});

test('valide l’état constaté au retour', async () => {
  authService.authenticate.mockResolvedValue({ role: 'GESTIONNAIRE', magasin: 'magasin-1' });

  const response = await request(app)
    .post('/api/emprunts/emprunt-1/retour')
    .set('Authorization', 'Bearer token-test')
    .send({ etatRetour: 'INCONNU' });

  expect(response.status).toBe(400);
  expect(empruntService.retournerMateriel).not.toHaveBeenCalled();
});
