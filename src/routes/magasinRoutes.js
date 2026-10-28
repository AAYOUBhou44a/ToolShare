const express = require('express');
const { z } = require('zod');
const magasinController = require('../controllers/magasinController');
const {
  authenticate,
  authorizeRoles,
} = require('../middlewares/authMiddleware');
const validateBody = require('../middlewares/validateBody');

const magasinRoutes = express.Router();
const adminOnly = authorizeRoles('ADMIN');
const magasinSchema = z
  .object({
    nom: z.string().trim().min(1).max(120),
    adresse: z.string().trim().min(1).max(250),
  })
  .strict();

const modificationSchema = z
  .object({
    nom: z.string().trim().min(1).max(120).optional(),
    adresse: z.string().trim().min(1).max(250).optional(),
  })
  .strict()
  .refine((details) => Object.keys(details).length > 0, {
    message: 'Au moins un champ du magasin doit être fourni.',
  });

magasinRoutes.use(authenticate);
magasinRoutes.get(
  '/',
  authorizeRoles('ADMIN', 'GESTIONNAIRE', 'UTILISATEUR'),
  magasinController.lister
);
magasinRoutes.get(
  '/:id',
  authorizeRoles('ADMIN', 'GESTIONNAIRE', 'UTILISATEUR'),
  magasinController.obtenir
);
magasinRoutes.post(
  '/',
  adminOnly,
  validateBody(magasinSchema),
  magasinController.creer
);
magasinRoutes.patch(
  '/:id',
  adminOnly,
  validateBody(modificationSchema),
  magasinController.modifier
);
magasinRoutes.patch('/:id/desactiver', adminOnly, magasinController.desactiver);

module.exports = magasinRoutes;
