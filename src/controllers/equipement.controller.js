
const equipmentService = require('../services/equipment.service');

const handleError = (res, error) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Cette référence existe déjà',
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Identifiant invalide',
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: 'Une erreur interne est survenue',
  });
};

const create = async (req, res) => {
  try {
    const equipment = await equipmentService.createEquipment(req.body);

    return res.status(201).json({
      success: true,
      message: 'Matériel créé avec succès',
      data: equipment,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getAll = async (req, res) => {
  try {
    const filters = {
      statut: req.query.statut,
      reference: req.query.reference,
      nom: req.query.nom,
      storeId: req.query.storeId,
    };

    const equipments = await equipmentService.getEquipments(filters);

    return res.status(200).json({
      success: true,
      count: equipments.length,
      data: equipments,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getById = async (req, res) => {
  try {
    const equipment = await equipmentService.getEquipmentById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const update = async (req, res) => {
  try {
    const equipment = await equipmentService.updateEquipment(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Matériel modifié avec succès',
      data: equipment,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deactivate = async (req, res) => {
  try {
    const equipment = await equipmentService.deactivateEquipment(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: 'Matériel désactivé avec succès',
      data: equipment,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const availability = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.body;

    const result = await equipmentService.checkAvailability(
      req.params.id,
      new Date(dateDebut),
      new Date(dateFin)
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  deactivate,
  availability,
};
