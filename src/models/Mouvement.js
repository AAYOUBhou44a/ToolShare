const mongoose = require('mongoose');

const mouvementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    materiel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Materiel',
      required: true,
    },
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mouvement', mouvementSchema);
