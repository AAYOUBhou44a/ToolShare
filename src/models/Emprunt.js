const mongoose = require('mongoose');

const empruntSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
      unique: true,
    },
    dateSortie: {
      type: Date,
      default: null,
    },
    dateRetour: {
      type: Date,
      default: null,
    },
    etatRetour: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Emprunt', empruntSchema);
