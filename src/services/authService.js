const jwt = require('jsonwebtoken');
const utilisateurRepository = require('../repositories/utilisateurRepository');
const HttpError = require('../utils/HttpError');
const { getJwtConfig } = require('../config/jwt');

const toPublicUtilisateur = (utilisateur) => ({
  id: utilisateur.id,
  nom: utilisateur.nom,
  email: utilisateur.email,
  role: utilisateur.role,
  actif: utilisateur.actif,
  magasin: utilisateur.magasin || null,
});

const verifierMotDePasse = (utilisateur, motDePasse) =>
  utilisateur.verifierMotDePasse(motDePasse);

const login = async (email, motDePasse) => {
  const utilisateur = await utilisateurRepository.findByEmail(email);

  if (
    !utilisateur ||
    !utilisateur.actif ||
    !(await verifierMotDePasse(utilisateur, motDePasse))
  ) {
    throw new HttpError(401, 'Email ou mot de passe invalide.');
  }

  const { secret, expiresIn } = getJwtConfig();
  const token = jwt.sign(
    { sub: utilisateur.id, role: utilisateur.role },
    secret,
    { expiresIn }
  );

  return { token, utilisateur: toPublicUtilisateur(utilisateur) };
};

const authenticate = async (token) => {
  const { secret } = getJwtConfig();
  let payload;

  try {
    payload = jwt.verify(token, secret);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(401, 'Token invalide ou expiré.');
    }
    throw error;
  }

  if (!payload || typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new HttpError(401, 'Token invalide ou expiré.');
  }

  const utilisateur = await utilisateurRepository.findById(payload.sub);
  if (!utilisateur || !utilisateur.actif) {
    throw new HttpError(401, 'Compte introuvable ou désactivé.');
  }

  return toPublicUtilisateur(utilisateur);
};

const getProfile = async (utilisateurId) => {
  const utilisateur = await utilisateurRepository.findById(utilisateurId);
  if (!utilisateur || !utilisateur.actif) {
    throw new HttpError(404, 'Utilisateur introuvable.');
  }

  return toPublicUtilisateur(utilisateur);
};

const updateProfile = async (utilisateurId, changements) => {
  const utilisateur = await utilisateurRepository.findById(utilisateurId);
  if (!utilisateur || !utilisateur.actif) {
    throw new HttpError(404, 'Utilisateur introuvable.');
  }

  if (changements.nom !== undefined) utilisateur.nom = changements.nom;
  if (changements.email !== undefined) utilisateur.email = changements.email;

  await utilisateur.save();
  return toPublicUtilisateur(utilisateur);
};

const changePassword = async (
  utilisateurId,
  motDePasseActuel,
  nouveauMotDePasse
) => {
  const utilisateur =
    await utilisateurRepository.findByIdWithPassword(utilisateurId);
  if (!utilisateur || !utilisateur.actif) {
    throw new HttpError(404, 'Utilisateur introuvable.');
  }

  if (!(await verifierMotDePasse(utilisateur, motDePasseActuel))) {
    throw new HttpError(400, 'Le mot de passe actuel est incorrect.');
  }

  utilisateur.motDePasse = nouveauMotDePasse;
  await utilisateur.save();
};

module.exports = {
  login,
  authenticate,
  getProfile,
  updateProfile,
  changePassword,
};
