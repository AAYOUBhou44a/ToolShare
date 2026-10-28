const bcrypt = require('bcryptjs');
const User = require('../models/User');
const InstallationState = require('../models/InstallationState');

const initializeAdmin = async (req, res) => {
  try {
    const secret = req.headers['x-installation-secret'];

    if (!process.env.INSTALLATION_SECRET ||
        secret !== process.env.INSTALLATION_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Clé d’initialisation invalide',
      });
    }

    const { nom, prenom, email, password } = req.body;

    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères',
      });
    }

    const installation = await InstallationState.findOne({
      key: 'initial-admin',
    });

    if (installation?.completed) {
      return res.status(409).json({
        success: false,
        message: 'L’initialisation a déjà été effectuée',
      });
    }

    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Un administrateur existe déjà',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      nom,
      prenom,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
    });

    await InstallationState.findOneAndUpdate(
      { key: 'initial-admin' },
      { $set: { key: 'initial-admin', completed: true } },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Administrateur initial créé avec succès',
    });
  } catch (error) {
    console.error('Erreur d’initialisation :', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l’initialisation',
    });
  }
};

module.exports = { initializeAdmin };