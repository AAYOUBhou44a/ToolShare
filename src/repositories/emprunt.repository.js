const { Emprunt, Materiel, Mouvement, Reservation } = require('../models');

const findReservationById = (id) => Reservation.findById(id).populate('materiel');

const claimMateriel = (id) =>
  Materiel.findOneAndUpdate(
    { _id: id, disponible: true },
    { $set: { disponible: false } },
    { new: true }
  );

const releaseMateriel = (id, disponible) =>
  Materiel.updateOne({ _id: id }, { $set: { disponible } });

const transitionReservation = (id, from, to) =>
  Reservation.findOneAndUpdate(
    { _id: id, statut: from },
    { $set: { statut: to } },
    { new: true }
  );

const createEmprunt = (data) => Emprunt.create(data);
const deleteEmprunt = (id) => Emprunt.deleteOne({ _id: id });
const createMouvement = (data) => Mouvement.create(data);

const findEmpruntById = (id) =>
  Emprunt.findById(id).populate({
    path: 'reservation',
    populate: { path: 'materiel' },
  });

const markReturned = (id, dateRetour, etatRetour) =>
  Emprunt.findOneAndUpdate(
    { _id: id, dateRetour: null },
    { $set: { dateRetour, etatRetour } },
    { new: true }
  );

const findOverdue = async (magasinId, maintenant) => {
  const emprunts = await Emprunt.find({ dateRetour: null }).populate({
    path: 'reservation',
    match: { statut: 'EN_COURS', dateFin: { $lt: maintenant } },
    populate: { path: 'materiel' },
  });

  return emprunts.filter(
    (emprunt) =>
      emprunt.reservation &&
      String(emprunt.reservation.materiel.magasin) === String(magasinId)
  );
};

const findMouvementsByMagasin = async (magasinId) => {
  const materiels = await Materiel.find({ magasin: magasinId }).select('_id');

  return Mouvement.find({ materiel: { $in: materiels.map(({ _id }) => _id) } })
    .sort({ date: -1 })
    .populate('materiel')
    .populate('utilisateur');
};

module.exports = {
  findReservationById,
  claimMateriel,
  releaseMateriel,
  transitionReservation,
  createEmprunt,
  deleteEmprunt,
  createMouvement,
  findEmpruntById,
  markReturned,
  findOverdue,
  findMouvementsByMagasin,
};
