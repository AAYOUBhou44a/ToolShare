const mongoose = require('mongoose');
const magasinRepository = require('../repositories/magasinRepository');
const reservationRepository = require('../repositories/reservationRepository');
const HttpError = require('../utils/HttpError');

const roles = ['ADMIN', 'GESTIONNAIRE', 'UTILISATEUR'];

const verifierRole = (utilisateur, rolesAutorises = roles) => {
  if (!utilisateur || !rolesAutorises.includes(utilisateur.role)) {
    throw new HttpError(403, 'Accès interdit.');
  }
};

const verifierId = (id, nom) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, `Identifiant de ${nom} invalide.`);
  }
};

const obtenirDates = ({ dateDebut, dureeHeures }) => {
  const debut = new Date(dateDebut);
  if (!Number.isFinite(debut.getTime())) {
    throw new HttpError(400, 'La date de début est invalide.');
  }
  if (!Number.isFinite(dureeHeures) || dureeHeures <= 0) {
    throw new HttpError(400, 'La durée doit être strictement positive.');
  }
  if (debut <= new Date()) {
    throw new HttpError(400, 'La date de début ne peut pas être dans le passé.');
  }

  const fin = new Date(debut.getTime() + dureeHeures * 60 * 60 * 1000);
  if (!Number.isFinite(fin.getTime())) {
    throw new HttpError(400, 'La date de fin calculée est invalide.');
  }

  return { dateDebut: debut, dateFin: fin };
};

const verifierMagasinEtMateriel = async (
  magasinId,
  materielId,
  session,
  requireAvailable = false
) => {
  const magasin = await magasinRepository.findById(magasinId, session);
  if (!magasin || !magasin.actif) {
    throw new HttpError(404, 'Magasin introuvable ou inactif.');
  }

  const materiel = await reservationRepository.findMaterielById(
    materielId,
    session
  );
  if (!materiel) throw new HttpError(404, 'Matériel introuvable.');
  if (String(materiel.magasin) !== String(magasinId)) {
    throw new HttpError(400, 'Le matériel ne dépend pas du magasin sélectionné.');
  }
  if (!materiel.actif || !materiel.disponible) {
    if (requireAvailable) {
      return { magasin, materiel, disponible: false };
    }
    throw new HttpError(409, 'Le matériel est indisponible.');
  }

  return { magasin, materiel, disponible: true };
};

const verifierDisponibilite = async (criteria) => {
  verifierId(criteria.magasin, 'magasin');
  verifierId(criteria.materiel, 'matériel');
  const dates = obtenirDates(criteria);
  const { materiel, disponible } = await verifierMagasinEtMateriel(
    criteria.magasin,
    criteria.materiel,
    null,
    true
  );

  if (!disponible) {
    return { disponible: false, raison: 'Le matériel est indisponible.' };
  }

  const chevauchement = await reservationRepository.findOverlapping(
    materiel._id,
    dates.dateDebut,
    dates.dateFin
  );

  return chevauchement
    ? {
        disponible: false,
        raison: 'Le matériel est déjà réservé sur cette période.',
      }
    : { disponible: true, raison: 'Le matériel est disponible sur cette période.' };
};

const creer = async (details, utilisateur) => {
  verifierRole(utilisateur, ['UTILISATEUR']);
  verifierId(details.magasin, 'magasin');
  verifierId(details.materiel, 'matériel');
  const dates = obtenirDates(details);
  const session = await mongoose.startSession();
  let reservation;

  try {
    await session.withTransaction(async () => {
      const { materiel } = await verifierMagasinEtMateriel(
        details.magasin,
        details.materiel,
        session
      );

      const verrouAcquis =
        await reservationRepository.incrementVersion(
          materiel._id,
          details.magasin,
          session
        );
      if (!verrouAcquis) {
        throw new HttpError(409, 'Le matériel est devenu indisponible.');
      }

      const chevauchement = await reservationRepository.findOverlapping(
        materiel._id,
        dates.dateDebut,
        dates.dateFin,
        session
      );
      if (chevauchement) {
        throw new HttpError(
          409,
          'Le matériel est déjà réservé sur cette période.'
        );
      }

      reservation = await reservationRepository.create(
        {
          utilisateur: utilisateur.id,
          materiel: materiel._id,
          dateDebut: dates.dateDebut,
          dateFin: dates.dateFin,
          dureeHeures: details.dureeHeures,
          statut: 'CONFIRMEE',
        },
        session
      );
    });
  } finally {
    await session.endSession();
  }

  return reservation;
};

const construireFiltre = (filters) => {
  const query = {};

  if (filters.materiel) query.materiel = filters.materiel;
  if (filters.statut) query.statut = filters.statut;
  if (filters.au) query.dateDebut = { $lt: filters.au };
  if (filters.du) query.dateFin = { $gt: filters.du };

  return query;
};

const lister = async (utilisateur, filters) => {
  verifierRole(utilisateur);
  const query = construireFiltre(filters);

  if (utilisateur.role === 'UTILISATEUR') {
    query.utilisateur = utilisateur.id;
  } else if (utilisateur.role === 'GESTIONNAIRE') {
    if (!utilisateur.magasin) {
      throw new HttpError(403, 'Aucun magasin n’est affecté à ce gestionnaire.');
    }
    const materielIds =
      await reservationRepository.findMaterielIdsByMagasin(
        utilisateur.magasin
      );
    query.materiel = query.materiel
      ? { $in: materielIds, $eq: query.materiel }
      : { $in: materielIds };
  }

  return reservationRepository.findAll(query);
};

const obtenir = async (id, utilisateur) => {
  verifierRole(utilisateur);
  verifierId(id, 'réservation');
  const reservation = await reservationRepository.findById(id);
  if (!reservation) throw new HttpError(404, 'Réservation introuvable.');

  if (
    utilisateur.role === 'UTILISATEUR' &&
    String(reservation.utilisateur?._id || reservation.utilisateur) !==
      String(utilisateur.id)
  ) {
    throw new HttpError(404, 'Réservation introuvable.');
  }

  if (utilisateur.role === 'GESTIONNAIRE') {
    if (!utilisateur.magasin) {
      throw new HttpError(403, 'Aucun magasin n’est affecté à ce gestionnaire.');
    }
    const magasinId =
      reservation.materiel?.magasin?._id || reservation.materiel?.magasin;
    if (String(magasinId) !== String(utilisateur.magasin)) {
      throw new HttpError(404, 'Réservation introuvable.');
    }
  }

  return reservation;
};

const annuler = async (id, utilisateur) => {
  verifierRole(utilisateur, ['UTILISATEUR']);
  verifierId(id, 'réservation');

  const reservation = await reservationRepository.findById(id);
  if (
    !reservation ||
    String(reservation.utilisateur?._id || reservation.utilisateur) !==
      String(utilisateur.id)
  ) {
    throw new HttpError(404, 'Réservation introuvable.');
  }

  if (reservation.statut !== 'CONFIRMEE') {
    throw new HttpError(
      409,
      'Seule une réservation confirmée peut être annulée.'
    );
  }
  if (reservation.dateDebut <= new Date()) {
    throw new HttpError(
      409,
      'Une réservation ne peut plus être annulée après son début.'
    );
  }

  const annulation = await reservationRepository.findByIdAndCancel(
    id,
    utilisateur.id,
    new Date()
  );
  if (!annulation) {
    throw new HttpError(
      409,
      'La réservation a commencé ou son statut a changé.'
    );
  }
  return annulation;
};

module.exports = {
  verifierDisponibilite,
  creer,
  lister,
  obtenir,
  annuler,
};
