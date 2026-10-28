const authService = require('../services/authService');

const login = async (req, res) => {
  const result = await authService.login(req.body.email, req.body.motDePasse);
  res.status(200).json({ success: true, data: result });
};

const getProfile = async (req, res) => {
  const utilisateur = await authService.getProfile(req.utilisateur.id);
  res.status(200).json({ success: true, data: { utilisateur } });
};

const updateProfile = async (req, res) => {
  const utilisateur = await authService.updateProfile(
    req.utilisateur.id,
    req.body
  );
  res.status(200).json({ success: true, data: { utilisateur } });
};

const changePassword = async (req, res) => {
  await authService.changePassword(
    req.utilisateur.id,
    req.body.motDePasseActuel,
    req.body.nouveauMotDePasse
  );
  res.status(200).json({
    success: true,
    message: 'Mot de passe modifié avec succès.',
  });
};

module.exports = { login, getProfile, updateProfile, changePassword };
