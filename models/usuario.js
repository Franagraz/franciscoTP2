const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    _id: {type: Object},
    Nombre: {type: String, required: true},
    Apellido: {type: String, required: true},
    Dni: {type: Number},
    Tarjeta: {type: Number},
    Codigo: {type: Number},
    Importe: {type: Number}
})

const Usuario = mongoose.model('Usuario', usuarioSchema)
module.exports = Usuario