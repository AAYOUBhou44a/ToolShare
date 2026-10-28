const mongoose = require('mongoose');

const statutsReservation = [
  'CONFIRMEE',
  'ANNULEE',
  'EN_COURS',
  'TERMINEE',
];

const reservationSchema = new mongoose.Schema(
  {
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    },
    materiel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Materiel',
      required: true,
    },
    dateDebut: {
      type: Date,
      required: true,
    },
    dateFin: {
      type: Date,
      required: true,
    },
    dureeHeures: {
      type: Number,
      required: true,
    },
    statut: {
      type: String,
      enum: statutsReservation,
      default: 'CONFIRMEE',
    },
  },
  { timestamps: true }
);

module.exports =mongoose.model('Reservation', reservationSchema);
