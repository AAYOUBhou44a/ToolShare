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
      validate: {
        validator: (duree) => Number.isFinite(duree) && duree > 0,
        message: 'La durée doit être strictement positive.',
      },
    },
    statut: {
      type: String,
      enum: statutsReservation,
      default: 'CONFIRMEE',
    },
  },
  { timestamps: true }
);

reservationSchema.pre('validate', function calculerDateFin() {
  if (this.dateDebut && this.dureeHeures > 0) {
    this.dateFin = new Date(
      this.dateDebut.getTime() + this.dureeHeures * 60 * 60 * 1000
    );
  }

  if (this.isNew && this.dateDebut && this.dateDebut <= new Date()) {
    this.invalidate(
      'dateDebut',
      'La date de début ne peut pas être dans le passé.'
    );
  }

  if (this.dateDebut && this.dateFin && this.dateFin <= this.dateDebut) {
    this.invalidate('dateFin', 'La date de fin doit être après le début.');
  }
});

module.exports =
  mongoose.models.Reservation ||
  mongoose.model('Reservation', reservationSchema);
