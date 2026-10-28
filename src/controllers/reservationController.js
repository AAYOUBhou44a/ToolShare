const reservationService = require('../services/reservationService');

const verifierDisponibilite = async (req, res) => {
  const disponibilite = await reservationService.verifierDisponibilite(
    res.locals.query
  );
  res.status(200).json({ success: true, data: disponibilite });
};

const creer = async (req, res) => {
  const reservation = await reservationService.creer(
    req.body,
    req.utilisateur
  );
  res.status(201).json({ success: true, data: { reservation } });
};

const lister = async (req, res) => {
  const reservations = await reservationService.lister(
    req.utilisateur,
    res.locals.query
  );
  res.status(200).json({
    success: true,
    count: reservations.length,
    data: { reservations },
  });
};

const obtenir = async (req, res) => {
  const reservation = await reservationService.obtenir(
    req.params.id,
    req.utilisateur
  );
  res.status(200).json({ success: true, data: { reservation } });
};

const annuler = async (req, res) => {
  const reservation = await reservationService.annuler(
    req.params.id,
    req.utilisateur
  );
  res.status(200).json({ success: true, data: { reservation } });
};

module.exports = { verifierDisponibilite, creer, lister, obtenir, annuler };
