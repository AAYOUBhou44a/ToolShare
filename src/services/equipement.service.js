
const equipmentRepository = require('../repositories/equipment.repository');
const reservationRepository = require('../repositories/reservation.repository');

const ALLOWED_STATUSES = [
  'disponible',
  'reserve',
  'maintenance',
  'hors_service',
];

const createEquipment = async (data) => {
  const reference = data.reference.trim();

  const existing = await equipmentRepository.findByReference(reference);

  if (existing) {
    const error = new Error('Cette référence existe déjà');
    error.statusCode = 409;
    throw error;
  }

  return equipmentRepository.create({
    ...data,
    reference,
    nom: data.nom.trim(),
    statut: data.statut || 'disponible',
    actif: true,
  });
};

const getEquipments = async (filters) => {
  return equipmentRepository.findAll(filters);
};

const getEquipmentById = async (id) => {
  const equipment = await equipmentRepository.findById(id);

  if (!equipment) {
    const error = new Error('Matériel introuvable');
    error.statusCode = 404;
    throw error;
  }

  return equipment;
};

const updateEquipment = async (id, data) => {
  const equipment = await equipmentRepository.findById(id);

  if (!equipment) {
    const error = new Error('Matériel introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (data.reference) {
    const reference = data.reference.trim();
    const existing = await equipmentRepository.findByReference(reference);

    if (
      existing &&
      existing._id.toString() !== equipment._id.toString()
    ) {
      const error = new Error('Cette référence est déjà utilisée');
      error.statusCode = 409;
      throw error;
    }

    data.reference = reference;
  }

  if (data.nom) {
    data.nom = data.nom.trim();
  }

  if (data.statut && !ALLOWED_STATUSES.includes(data.statut)) {
    const error = new Error('État de service invalide');
    error.statusCode = 400;
    throw error;
  }

  return equipmentRepository.updateById(id, data);
};

const deactivateEquipment = async (id) => {
  const equipment = await equipmentRepository.findById(id);

  if (!equipment) {
    const error = new Error('Matériel introuvable');
    error.statusCode = 404;
    throw error;
  }

  return equipmentRepository.deactivateById(id);
};

const checkAvailability = async (id, dateDebut, dateFin) => {
  const equipment = await getEquipmentById(id);

  if (dateDebut >= dateFin) {
    const error = new Error('La date de fin doit être après la date de début');
    error.statusCode = 400;
    throw error;
  }

  if (equipment.statut !== 'disponible') {
    return {
      disponible: false,
      raison: `Le matériel n'est pas disponible : ${equipment.statut}`,
    };
  }

  const reservations =
    await reservationRepository.findOverlappingReservations(
      equipment._id,
      dateDebut,
      dateFin
    );

  if (reservations.length > 0) {
    return {
      disponible: false,
      raison: 'Le matériel est déjà réservé sur cette période',
    };
  }

  return {
    disponible: true,
    raison: 'Le matériel est disponible sur cette période',
  };
};

module.exports = {
  createEquipment,
  getEquipments,
  getEquipmentById,
  updateEquipment,
  deactivateEquipment,
  checkAvailability,
};
