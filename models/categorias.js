const mongoose = require('mongoose');

const categoriasSchema = new mongoose.Schema({
    _id: {type: Number},
    Categoria: {type: String, required: true}
})

const Categoria = mongoose.model('Categoria', categoriasSchema)
module.exports = Categoria