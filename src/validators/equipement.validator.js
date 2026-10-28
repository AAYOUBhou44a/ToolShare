
const { z } = require('zod');

const objectIdSchema = z.string().regex(
  /^[a-f\d]{24}$/i,
  'Identifiant MongoDB invalide'
);

const createEquipmentSchema = z.object({
  reference: z.string().trim().min(1, 'La référence est obligatoire'),
  nom: z.string().trim().min(1, 'Le nom est obligatoire'),
  storeId: objectIdSchema,
  statut: z.enum([
    'disponible',
    'reserve',
    'maintenance',
    'hors_service',
  ]).optional(),
});

const updateEquipmentSchema = z.object({
  reference: z.string().trim().min(1).optional(),
  nom: z.string().trim().min(1).optional(),
  storeId: objectIdSchema.optional(),
  statut: z.enum([
    'disponible',
    'reserve',
    'maintenance',
    'hors_service',
  ]).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Au moins un champ doit être fourni' }
);

const availabilitySchema = z.object({
  dateDebut: z.string().datetime(),
  dateFin: z.string().datetime(),
});

module.exports = {
  createEquipmentSchema,
  updateEquipmentSchema,
  availabilitySchema,
};
