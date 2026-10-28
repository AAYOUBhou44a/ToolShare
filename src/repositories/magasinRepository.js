const Magasin = require('../models/Magasin');

const create = (details) => Magasin.create(details);

const findAll = (filter = {}) =>
  Magasin.find(filter).sort({ nom: 1, _id: 1 });

const findById = (id, session) => {
  const query = Magasin.findById(id);
  return session ? query.session(session) : query;
};

module.exports = { create, findAll, findById };
