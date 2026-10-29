const express = require('express');
const { z } = require('zod');
const reservationController = require('../controllers/reservationController');
const {
  authenticate,
  authorizeRoles,
} = require('../middlewares/authMiddleware');
const validateBody = require('../middlewares/validateBody');
const validateQuery = require('../middlewares/validateQuery');

const reservationRoutes = express.Router();
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Identifiant invalide.');
const dateSchema = z.string().datetime().transform((date) => new Date(date));

const createSchema = z
  .object({
    magasin: objectIdSchema,
    materiel: objectIdSchema,
    dateDebut: dateSchema,
    dureeHeures: z.number().finite().positive(),
  })
  .strict();

const availabilitySchema = z
  .object({
    magasin: objectIdSchema,
    materiel: objectIdSchema,
    dateDebut: dateSchema,
    dureeHeures: z.coerce.number().finite().positive(),
  })
  .strict();

const listSchema = z
  .object({
    materiel: objectIdSchema.optional(),
    statut: z.enum(['CONFIRMEE', 'ANNULEE', 'EN_COURS', 'TERMINEE']).optional(),
    du: dateSchema.optional(),
    au: dateSchema.optional(),
  })
  .strict()
  .refine(
    ({ du, au }) => !du || !au || du < au,
    'La borne « du » doit précéder la borne « au ».'
  );

reservationRoutes.use(authenticate);
reservationRoutes.get(
  '/disponibilite',
  authorizeRoles('ADMIN', 'GESTIONNAIRE', 'UTILISATEUR'),
  validateQuery(availabilitySchema),
  reservationController.verifierDisponibilite
);
reservationRoutes.post(
  '/',
  authorizeRoles('UTILISATEUR'),
  validateBody(createSchema),
  reservationController.creer
);
reservationRoutes.get(
  '/',
  authorizeRoles('ADMIN', 'GESTIONNAIRE', 'UTILISATEUR'),
  validateQuery(listSchema),
  reservationController.lister
);
reservationRoutes.get(
  '/:id',
  authorizeRoles('ADMIN', 'GESTIONNAIRE', 'UTILISATEUR'),
  reservationController.obtenir
);
reservationRoutes.patch(
  '/:id/annuler',
  authorizeRoles('UTILISATEUR'),
  reservationController.annuler
);

module.exports = reservationRoutes;
