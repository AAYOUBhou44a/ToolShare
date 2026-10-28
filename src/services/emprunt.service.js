const empruntRepository = require('../repositories/emprunt.repository');
const HttpError = require('../utils/HttpError');

const getMagasinId = (materiel) => materiel.magasin?._id || materiel.magasin;

const verifierAffectation = (utilisateur, materiel) => {
  const magasinUtilisateur = utilisateur.magasin?._id || utilisateur.magasin;
  if (!magasinUtilisateur || String(magasinUtilisateur) !== String(getMagasinId(materiel))) {
    throw new HttpError(403, 'Ce matériel ne dépend pas de votre magasin.');
  }
};

const prendreMateriel = async (reservationId, gestionnaire) => {
  const reservation = await empruntRepository.findReservationById(reservationId);
  if (!reservation) throw new HttpError(404, 'Réservation introuvable.');

  verifierAffectation(gestionnaire, reservation.materiel);
  if (reservation.statut !== 'CONFIRMEE') {
    throw new HttpError(409, 'Seule une réservation confirmée peut être remise.');
  }

  const materiel = await empruntRepository.claimMateriel(reservation.materiel._id);
  if (!materiel) throw new HttpError(409, 'Ce matériel est déjà indisponible.');

  let reservationTransitionnee = false;
  let emprunt;

  try {
    const transition = await empruntRepository.transitionReservation(
      reservationId,
      'CONFIRMEE',
      'EN_COURS'
    );
    if (!transition) throw new HttpError(409, 'La réservation a déjà changé de statut.');
    reservationTransitionnee = true;

    emprunt = await empruntRepository.createEmprunt({
      reservation: reservationId,
      dateSortie: new Date(),
    });
    await empruntRepository.createMouvement({
      type: 'SORTIE',
      materiel: materiel._id,
      utilisateur: reservation.utilisateur,
      description: 'Matériel remis au bénéficiaire de la réservation.',
    });

    return emprunt;
  } catch (error) {
    const compensations = [
      empruntRepository.releaseMateriel(materiel._id, true),
    ];
    if (reservationTransitionnee) {
      compensations.push(
        empruntRepository.transitionReservation(
          reservationId,
          'EN_COURS',
          'CONFIRMEE'
        )
      );
    }
    if (emprunt) compensations.push(empruntRepository.deleteEmprunt(emprunt._id));
    await Promise.allSettled(compensations);
    throw error;
  }
};

const retournerMateriel = async (empruntId, gestionnaire, etatRetour) => {
  const emprunt = await empruntRepository.findEmpruntById(empruntId);
  if (!emprunt || !emprunt.reservation) {
    throw new HttpError(404, 'Emprunt introuvable.');
  }

  const { reservation } = emprunt;
  const { materiel } = reservation;
  verifierAffectation(gestionnaire, materiel);
  if (emprunt.dateRetour || reservation.statut !== 'EN_COURS') {
    throw new HttpError(409, 'Cet emprunt est déjà terminé.');
  }

  const dateRetour = new Date();
  const retour = await empruntRepository.markReturned(empruntId, dateRetour, etatRetour);
  if (!retour) throw new HttpError(409, 'Cet emprunt a déjà été retourné.');

  await empruntRepository.transitionReservation(
    reservation._id,
    'EN_COURS',
    'TERMINEE'
  );
  await empruntRepository.releaseMateriel(materiel._id, etatRetour === 'BON');
  await empruntRepository.createMouvement({
    type: 'RETOUR',
    materiel: materiel._id,
    utilisateur: reservation.utilisateur,
    description: `Retour constaté : ${etatRetour}.`,
  });

  return retour;
};

const listerRetards = (gestionnaire) => {
  if (!gestionnaire.magasin) throw new HttpError(403, 'Aucun magasin ne vous est affecté.');
  return empruntRepository.findOverdue(gestionnaire.magasin, new Date());
};

const listerMouvements = (gestionnaire) => {
  if (!gestionnaire.magasin) throw new HttpError(403, 'Aucun magasin ne vous est affecté.');
  return empruntRepository.findMouvementsByMagasin(gestionnaire.magasin);
};

module.exports = {
  prendreMateriel,
  retournerMateriel,
  listerRetards,
  listerMouvements,
};
