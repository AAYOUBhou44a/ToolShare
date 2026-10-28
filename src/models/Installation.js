const mongoose = require('mongoose');

const installationSchema = new mongoose.Schema(
  {
    cle: {
      type: String,
      enum: ['application'],
      default: 'application',
      unique: true,
      required: true,
    },
    installee: {
      type: Boolean,
      default: false,
      required: true,
    },
    dateInstallation: {
      type: Date,
      default: null,
    },
    administrateurInitial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Installation', installationSchema);
