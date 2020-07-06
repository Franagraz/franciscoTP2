const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    _id: {type: Number},
    idProducto: {type: Number},
    Nombre: {type: String, required: true},
    Precio: {type: Number},
    SnPagado: {type: String, required: true},
    Fecha: {type: String, required: true}
})

const Pedido = mongoose.model('Pedido', pedidoSchema)
module.exports = Pedido