const express = require('express');
const { z } = require('zod');
const empruntController = require('../controllers/emprunt.controller');
const {
  authenticate,
  authorizeRoles,
} = require('../middlewares/authMiddleware');
const validateBody = require('../middlewares/validateBody');

const empruntRoutes = express.Router();
const retourSchema = z
  .object({ etatRetour: z.enum(['BON', 'ENDOMMAGE']) })
  .strict();

empruntRoutes.use(authenticate, authorizeRoles('GESTIONNAIRE'));
empruntRoutes.post('/:reservationId/sortie', empruntController.sortie);
empruntRoutes.post(
  '/:empruntId/retour',
  validateBody(retourSchema),
  empruntController.retour
);
empruntRoutes.get('/retards', empruntController.retards);
empruntRoutes.get('/mouvements', empruntController.mouvements);

module.exports = empruntRoutes;
