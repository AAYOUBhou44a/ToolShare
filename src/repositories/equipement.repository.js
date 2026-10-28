
const Equipment = require('../models/Equipment');

const findAll = (filters = {}) => {
  const query = { actif: true };

  if (filters.statut) {
    query.statut = filters.statut;
  }

  if (filters.reference) {
    query.reference = {
      $regex: filters.reference,
      $options: 'i',
    };
  }

  if (filters.nom) {
    query.nom = {
      $regex: filters.nom,
      $options: 'i',
    };
  }

  if (filters.storeId) {
    query.storeId = filters.storeId;
  }

  return Equipment.find(query).sort({ nom: 1 });
};

const findById = (id) => {
  return Equipment.findOne({ _id: id, actif: true });
};

const findByReference = (reference) => {
  return Equipment.findOne({
    reference: reference.trim(),
  });
};

const create = (data) => {
  return Equipment.create(data);
};

const updateById = (id, data) => {
  return Equipment.findOneAndUpdate(
    { _id: id, actif: true },
    { $set: data },
    {
      new: true,
      runValidators: true,
    }
  );
};

const deactivateById = (id) => {
  return Equipment.findOneAndUpdate(
    { _id: id, actif: true },
    { $set: { actif: false } },
    { new: true }
  );
};

module.exports = {
  findAll,
  findById,
  findByReference,
  create,
  updateById,
  deactivateById,
};
