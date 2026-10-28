const mongoose = require('mongoose');
const magasinRepository = require('../repositories/magasinRepository');
const HttpError = require('../utils/HttpError');

const rolesGestionMagasins = ['ADMIN', 'GESTIONNAIRE', 'UTILISATEUR'];

const verifierRole = (utilisateur, roles) => {
  if (!utilisateur || !roles.includes(utilisateur.role)) {
    throw new HttpError(403, 'Accès interdit.');
  }
};

const verifierIdentifiant = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, 'Identifiant de magasin invalide.');
  }
};

const magasinGestionnaire = (utilisateur) => {
  if (!utilisateur.magasin) {
    throw new HttpError(403, 'Aucun magasin n’est affecté à ce gestionnaire.');
  }

  return String(utilisateur.magasin);
};

const lister = async (utilisateur) => {
  verifierRole(utilisateur, rolesGestionMagasins);

  if (utilisateur.role === 'ADMIN') {
    return magasinRepository.findAll();
  }

  if (utilisateur.role === 'GESTIONNAIRE') {
    const magasinId = magasinGestionnaire(utilisateur);
    const magasin = await magasinRepository.findById(magasinId);
    return magasin ? [magasin] : [];
  }

  return magasinRepository.findAll({ actif: true });
};

const obtenir = async (id, utilisateur) => {
  verifierRole(utilisateur, rolesGestionMagasins);
  verifierIdentifiant(id);

  const magasin = await magasinRepository.findById(id);
  if (!magasin) throw new HttpError(404, 'Magasin introuvable.');

  if (utilisateur.role === 'GESTIONNAIRE') {
    if (magasinGestionnaire(utilisateur) !== String(magasin.id)) {
      throw new HttpError(403, 'Accès interdit à ce magasin.');
    }
  } else if (utilisateur.role === 'UTILISATEUR' && !magasin.actif) {
    throw new HttpError(404, 'Magasin introuvable.');
  }

  return magasin;
};

const creer = async (details) => magasinRepository.create(details);

const modifier = async (id, changements) => {
  verifierIdentifiant(id);

  const magasin = await magasinRepository.findById(id);
  if (!magasin) throw new HttpError(404, 'Magasin introuvable.');

  magasin.modifier(changements);
  await magasin.save();
  return magasin;
};

const desactiver = async (id) => {
  verifierIdentifiant(id);

  const magasin = await magasinRepository.findById(id);
  if (!magasin) throw new HttpError(404, 'Magasin introuvable.');

  magasin.desactiver();
  await magasin.save();
  return magasin;
};

module.exports = { lister, obtenir, creer, modifier, desactiver };
