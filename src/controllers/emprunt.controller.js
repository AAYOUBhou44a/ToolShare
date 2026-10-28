const empruntService = require('../services/emprunt.service');

const sortie = async (req, res) => {
  const emprunt = await empruntService.prendreMateriel(
    req.params.reservationId,
    req.utilisateur
  );
  return res.status(201).json({ success: true, data: emprunt });
};

const retour = async (req, res) => {
  const emprunt = await empruntService.retournerMateriel(
    req.params.empruntId,
    req.utilisateur,
    req.body.etatRetour
  );
  return res.status(200).json({ success: true, data: emprunt });
};

const retards = async (req, res) => {
  const emprunts = await empruntService.listerRetards(req.utilisateur);
  return res.status(200).json({ success: true, count: emprunts.length, data: emprunts });
};

const mouvements = async (req, res) => {
  const mouvementsMagasin = await empruntService.listerMouvements(req.utilisateur);
  return res.status(200).json({
    success: true,
    count: mouvementsMagasin.length,
    data: mouvementsMagasin,
  });
};

module.exports = { sortie, retour, retards, mouvements };
