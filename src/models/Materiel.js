const mongoose = require('mongoose');

const materielSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    magasin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Magasin',
      required: true,
    },
    disponible: {
      type: Boolean,
      default: true,
    },
    reservationVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    actif: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Materiel', materielSchema);
