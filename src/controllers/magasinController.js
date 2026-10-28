const magasinService = require('../services/magasinService');

const lister = async (req, res) => {
  const magasins = await magasinService.lister(req.utilisateur);
  res.status(200).json({ success: true, data: { magasins } });
};

const obtenir = async (req, res) => {
  const magasin = await magasinService.obtenir(
    req.params.id,
    req.utilisateur
  );
  res.status(200).json({ success: true, data: { magasin } });
};

const creer = async (req, res) => {
  const magasin = await magasinService.creer(req.body);
  res.status(201).json({ success: true, data: { magasin } });
};

const modifier = async (req, res) => {
  const magasin = await magasinService.modifier(req.params.id, req.body);
  res.status(200).json({ success: true, data: { magasin } });
};

const desactiver = async (req, res) => {
  const magasin = await magasinService.desactiver(req.params.id);
  res.status(200).json({ success: true, data: { magasin } });
};

module.exports = { lister, obtenir, creer, modifier, desactiver };
