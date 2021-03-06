const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    _id: {type: Number},
    Nombre: {type: String, required: true},
    Precio: {type: Number},
    Descripcion: {type: String, required: true},
    Categoria: {type: String, required: true},
    Calorias: {type: Number},
    Fecha: {type: String, required: true}
    //,SnPagado: {type: Boolean, required: true}
})

const Producto = mongoose.model('Producto', productoSchema)
module.exports = Producto