const mockFindOne = jest.fn();
const mockUpdateOne = jest.fn();

jest.mock('../models', () => ({
  Materiel: { updateOne: mockUpdateOne },
  Reservation: { findOne: mockFindOne },
}));

const reservationRepository = require('./reservationRepository');

describe('Dépôt des réservations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses strict overlap comparisons and ignores cancelled or completed reservations', () => {
    const dateDebut = new Date('2026-11-01T10:00:00.000Z');
    const dateFin = new Date('2026-11-01T11:00:00.000Z');
    mockFindOne.mockReturnValue({});

    reservationRepository.findOverlapping(
      'materiel-id',
      dateDebut,
      dateFin
    );

    expect(mockFindOne).toHaveBeenCalledWith({
      materiel: 'materiel-id',
      statut: { $in: ['CONFIRMEE', 'EN_COURS'] },
      dateDebut: { $lt: dateFin },
      dateFin: { $gt: dateDebut },
    });
  });

  test('increments the equipment document inside the active transaction', async () => {
    const session = { id: 'mongo-session' };
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    const verrouAcquis = await reservationRepository.incrementVersion(
      'materiel-id',
      'magasin-id',
      session
    );

    expect(verrouAcquis).toBe(true);
    expect(mockUpdateOne).toHaveBeenCalledWith(
      {
        _id: 'materiel-id',
        magasin: 'magasin-id',
        actif: true,
        disponible: true,
      },
      { $inc: { reservationVersion: 1 } },
      { session, timestamps: false }
    );
  });
});
