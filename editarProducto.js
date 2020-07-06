//Se muestran los inputs con los datos del producto a modificar.
app.get('/editar/:Nombre', (req, res) =>{
    var i=0;
    var j=0;
    var opcion2, opcion3;
    collectionProductos.find().toArray((error, productos)=>{
        collectionCategorias.find().toArray((error, categorias) =>{
        for(; i<productos.length; i++){
            if(productos[i].Nombre==req.params.Nombre){
                var producto=productos[i];
            }
        }
        res.render('editar',{
            producto, categorias
        })
    })
    })
});

//Se genera la modificación del producto, previamente seleccionado.
app.post('/editar/:Nombre', async (req, res) => {
    const query = {Nombre: req.params.Nombre};
    const nuevosDatos = {$set:{Nombre: req.body.Nombre, Precio: req.body.Precio, Descripcion: req.body.Descripcion, Categoria: req.body.Categoria, Calorias: req.body.Calorias, SnPagado: 'false'}};
    collectionProductos.updateOne(query, nuevosDatos, function(error, result){
        if(error) throw error;
        console.log('Actualice elemento');
    });
    res.redirect('/productos');
});