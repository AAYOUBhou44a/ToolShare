const Utilisateur = require('../models/Utilisateur');

const findByEmail = (email) =>
  Utilisateur.findOne({ email }).select('+motDePasse');

const findById = (id) => Utilisateur.findById(id);

const findByIdWithPassword = (id) =>
  Utilisateur.findById(id).select('+motDePasse');

module.exports = { findByEmail, findById, findByIdWithPassword };
