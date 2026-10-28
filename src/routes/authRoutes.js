const express = require('express');
const { z } = require('zod');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const validateBody = require('../middlewares/validateBody');

const authRoutes = express.Router();
const loginSchema = z
  .object({
    email: z.email().transform((email) => email.trim().toLowerCase()),
    motDePasse: z.string().min(1, 'Le mot de passe est obligatoire.'),
  })
  .strict();

const profileSchema = z
  .object({
    nom: z.string().trim().min(1).max(100).optional(),
    email: z.email().transform((email) => email.trim().toLowerCase()).optional(),
  })
  .strict()
  .refine((profile) => Object.keys(profile).length > 0, {
    message: 'Au moins un champ du profil doit être fourni.',
  });

const passwordSchema = z
  .object({
    motDePasseActuel: z.string().min(1),
    nouveauMotDePasse: z
      .string()
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères.')
      .refine(
        (password) => Buffer.byteLength(password, 'utf8') <= 72,
        'Le nouveau mot de passe ne peut pas dépasser 72 octets.'
      ),
  })
  .strict();

authRoutes.post('/login', validateBody(loginSchema), authController.login);
authRoutes.get('/me', authenticate, authController.getProfile);
authRoutes.patch(
  '/me',
  authenticate,
  validateBody(profileSchema),
  authController.updateProfile
);
authRoutes.patch(
  '/change-password',
  authenticate,
  validateBody(passwordSchema),
  authController.changePassword
);

module.exports = authRoutes;
