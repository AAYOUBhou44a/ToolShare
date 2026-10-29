const { Materiel, Reservation } = require('../models');

const statutsOccupants = ['CONFIRMEE', 'EN_COURS'];

const findMaterielById = (id, session) => {
  const query = Materiel.findById(id);
  return session ? query.session(session) : query;
};

const incrementVersion = async (materielId, magasinId, session) => {
  const result = await Materiel.updateOne(
    {
      _id: materielId,
      magasin: magasinId,
      actif: true,
      disponible: true,
    },
    { $inc: { reservationVersion: 1 } },
    { session, timestamps: false }
  );
  return result.modifiedCount === 1;
};

const findOverlapping = (materielId, dateDebut, dateFin, session) => {
  const query = Reservation.findOne({
    materiel: materielId,
    statut: { $in: statutsOccupants },
    dateDebut: { $lt: dateFin },
    dateFin: { $gt: dateDebut },
  });
  return session ? query.session(session) : query;
};

const create = async (data, session) => {
  const [reservation] = await Reservation.create([data], { session });
  return reservation;
};

const findAll = (filter) =>
  Reservation.find(filter)
    .sort({ dateDebut: -1, _id: -1 })
    .populate('utilisateur', 'nom email')
    .populate('materiel', 'reference nom magasin');

const findById = (id) =>
  Reservation.findById(id)
    .populate('utilisateur', 'nom email')
    .populate('materiel', 'reference nom magasin');

const findByIdAndCancel = (id, utilisateurId, now) =>
  Reservation.findOneAndUpdate(
    {
      _id: id,
      utilisateur: utilisateurId,
      statut: 'CONFIRMEE',
      dateDebut: { $gt: now },
    },
    { $set: { statut: 'ANNULEE' } },
    { new: true, runValidators: true }
  );

const findMaterielIdsByMagasin = async (magasinId) => {
  const materiels = await Materiel.find({ magasin: magasinId }).select('_id');
  return materiels.map(({ _id }) => _id);
};

module.exports = {
  findMaterielById,
  incrementVersion,
  findOverlapping,
  create,
  findAll,
  findById,
  findByIdAndCancel,
  findMaterielIdsByMagasin,
};
