const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const roles = ['ADMIN', 'GESTIONNAIRE', 'UTILISATEUR'];

const utilisateurSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    motDePasse: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: roles,
      default: 'UTILISATEUR',
    },
    actif: {
      type: Boolean,
      default: true,
    },
    magasin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Magasin',
      default: null,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Utilisateur', utilisateurSchema);
