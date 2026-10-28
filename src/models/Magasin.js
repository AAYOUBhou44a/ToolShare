const mongoose = require('mongoose');

const magasinSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    adresse: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    actif: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

magasinSchema.methods.modifier = function modifier(changements) {
  if (changements.nom !== undefined) this.nom = changements.nom;
  if (changements.adresse !== undefined) this.adresse = changements.adresse;
  return this;
};

magasinSchema.methods.desactiver = function desactiver() {
  this.actif = false;
  return this;
};

module.exports = mongoose.model('Magasin', magasinSchema);
