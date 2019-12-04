const path = require('path')
const express = require ('express');
const { config, engine} = require ('express-edge');
const bodyParser = require('body-parser');
const Producto = require('./models/producto.js');


//base de datos
const mongoClient = require('mongodb').MongoClient;
const uriDataBase = "mongodb+srv://tptaller2:trabajopracticotaller2@cluster0-zdr37.mongodb.net/test?retryWrites=true&w=majority";
mongoClient.connect(uriDataBase, function(error, result){
    if(!error){
        const collectionProductos = result.db('tptaller2').collection('productos');
        const collectionPedidos = result.db('tptaller2').collection('pedidos');
        const collectionCategorias = result.db('tptaller2').collection('categorias');
        const collectionUsuarios = result.db('tptaller2').collection('usuario');
        console.log('Conexión exitosa');
      
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        const hoy = dd + '/' + mm + '/' + yyyy;
/*-------------------------------------*/

const app = new express();
app.use(engine);
app.set('views', `${__dirname}/views`);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', (req, res) => {
    //res.sendFile(path.resolve(__dirname, 'src/views/index.html'))
    res.render('index');
});

app.get('/productos', (req, res) => {
    //res.sendFile(path.resolve(__dirname, 'src/views/productos.html'))
 
var hoy = 0;

    collectionProductos.find().toArray((error, result)=>{
        res.render('productos',{
            result, hoy
        })
        })
});

app.post('/productos/guardar', (req, res) => {
    const date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); 
    var yyyy = date.getFullYear();
    const fecha = yyyy+'-'+mm+'-'+dd;
    collectionProductos.insertOne(
            
        {Nombre: req.body.Nombre, Precio: req.body.Precio, Descripcion: req.body.Descripcion, Categoria: req.body.Categoria, Calorias: req.body.Calorias, Fecha: fecha, SnPagado: 'false'}
    );
    res.redirect('/productos');
});

app.listen(4000, () =>{
    console.log('Aplicación levantada en el puerto 4000');
});

app.post('/indexEmpleado', (req, res) => {
    //res.sendFile(path.resolve(__dirname, 'src/views/indexEmpleado.html'))
    res.render('indexEmpleado');
});

app.post('/indexCliente', (req, res) => {
    //res.sendFile(path.resolve(__dirname, 'src/views/indexCliente.html'))
    res.render('indexCliente');
});

app.get('/informeProductos',  (req, res) => {
    var lista = [];
    var ganancia=0;
    const date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); 
    var yyyy = date.getFullYear();
    const fecha = String(yyyy+'-'+mm+'-'+dd);
    collectionProductos.find().toArray((error, productos)=>{
    collectionPedidos.find().toArray((error, pedidos)=>{
        for(var i=0;i<pedidos.length;i++){
            for(var j=0;j<productos.length;j++){
            if(pedidos[i].idProducto.equals(productos[j]._id) && pedidos[i].SnPagado=='true' && pedidos[i].Fecha==fecha){
                productos[j].Fecha=pedidos[i].Fecha;
                lista.unshift(productos[j]);
                console.log(lista);
                ganancia+=Number(productos[j].Precio);
            }
            }
        }  
        res.render('informeProductos',{
            lista, ganancia
        })
    })
    })
    
    
});
app.get('/editar/:Nombre', (req, res) =>{
    var i=0;
    var opcion2, opcion3;
    collectionProductos.find().toArray((error, productos)=>{
        for(; i<productos.length; i++){
            if(productos[i].Nombre==req.params.Nombre){
                var producto=productos[i];
            }
        }
        if(producto.Categoria=='Hamburguesa'){
            opcion2='Papas';
            opcion3='Gaseosa';
        }else if(producto.Categoria=='Papas'){
            opcion2='Hamburguesa';
            opcion3='Gaseosa';
        }else if(producto.Categoria=='Gaseosa'){
            opcion2='Hamburguesa';
            opcion3='Papas';
        }else {
            producto.Categoria='Hamburguesa';
            opcion2='Papas';
            opcion3='Gaseosa';
        }

        res.render('editar',{
            producto, opcion2, opcion3
        })
    })
});

app.get('/eliminar/:Nombre', async (req, res) =>{
    const queryDelete = {Nombre: req.params.Nombre};
    collectionProductos.deleteOne(queryDelete, function(error, obj){
        if(!error) {
        console.log('Borré elemento');
    }
    });
    res.redirect('/productos');
});

app.post('/editar/:Nombre', async (req, res) => {
    const query = {Nombre: req.params.Nombre};
    const nuevosDatos = {$set:{Nombre: req.body.Nombre, Precio: req.body.Precio, Descripcion: req.body.Descripcion, Categoria: req.body.Categoria, Calorias: req.body.Calorias, SnPagado: 'false'}};
    collectionProductos.updateOne(query, nuevosDatos, function(error, result){
        if(error) throw error;
        console.log('Actualice elemento');
    });
    res.redirect('/editar/'+req.body.Nombre);
});

app.get('/indexEmpleado', (req, res) => {
    //res.sendFile(path.resolve(__dirname, 'src/views/indexEmpleado.html'))
    res.render('indexEmpleado');
});

app.get('/RealizarPedido', (req, res) =>{
    var listHamburguesas=[];
    var listGaseosas=[];
    var listPapas=[];
    var i=0;
    collectionCategorias.find().toArray((error, result)=>{
        collectionProductos.find().toArray((error, productos)=>{
            for(;i<productos.length;i++){
            if(productos[i].Categoria=='Hamburguesa'){
                listHamburguesas.unshift(productos[i]);
            }else if(productos[i].Categoria=='Papas'){
                listPapas.unshift(productos[i]);
            }else if(productos[i].Categoria=='Gaseosa'){
                listGaseosas.unshift(productos[i]);
            }
        }
        res.render('RealizarPedido',{
             listHamburguesas, listPapas, listGaseosas
        })
        })
    })
});

app.get('/AgregarCarrito/:Nombre', (req, res)=>{
    const query = req.params.Nombre;
    const date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); 
    var yyyy = date.getFullYear();
    const fecha = yyyy+'-'+mm+'-'+dd;
    var idProd;
    var precio;
    var i=0;
    var encontrado=false;
    collectionProductos.find().toArray((error, productos)=>{
    while(i<productos.length && encontrado==false){
        var nombreProd=productos[i].Nombre;
        if(nombreProd==query){
            idProd=productos[i]._id;
            precio=productos[i].Precio;
            mensaje="El producto '"+query+"' fue agregado correctamente a su carrito";
            encontrado=true;
        }
        i++;
    }
    collectionPedidos.insertOne(
            
        {idProducto: idProd, Nombre: query, Precio: precio, SnPagado: 'false', Fecha: fecha}
        
    );
    console.log("Guardé "+query+" en la tabla pedidos");
    //res.redirect('/RealizarPedido');

        /* ------------------------------------- */
        //Mejora
        var mensajeOk = "Se agregó el producto '"+query+"' al carrito, correctamente!";
        var listHamburguesas=[];
        var listGaseosas=[];
        var listPapas=[];
        i=0;
        collectionProductos.find().toArray((error, producto)=>{
        for(;i<producto.length;i++){
            if(producto[i].Categoria=='Hamburguesa'){
                listHamburguesas.unshift(producto[i]);
            }else if(producto[i].Categoria=='Papas'){
                listPapas.unshift(producto[i]);
            }else if(producto[i].Categoria=='Gaseosa'){
                listGaseosas.unshift(producto[i]);
            }
        }
        res.render('RealizarPedido', {
            listHamburguesas,listPapas,listGaseosas, mensajeOk
        });
    });

    })

});

app.get('/VerCarrito', (req, res)=>{
    listPedidos=[];
    var vacio;
    var mensaje='Su carrito está vacío!';  
    collectionProductos.find().toArray((error, producto)=>{
    collectionPedidos.find().toArray((error,pedidos)=>{
    for(var i=0;i<producto.length;i++){
        for(var j=0;j<pedidos.length;j++){
            if(producto[i]._id.equals(pedidos[j].idProducto) && pedidos[j].SnPagado=='false'){
               listPedidos.unshift(producto[i]);
               vacio=false;
            }
        }
    }
    
    if(vacio==false){
    res.render('VerCarrito',{
        listPedidos
    });
    }else{
        var listHamburguesas=[];
        var listGaseosas=[];
        var listPapas=[];
        i=0;
        for(;i<producto.length;i++){
            if(producto[i].Categoria=='Hamburguesa'){
                listHamburguesas.unshift(producto[i]);
            }else if(producto[i].Categoria=='Papas'){
                listPapas.unshift(producto[i]);
            }else if(producto[i].Categoria=='Gaseosa'){
                listGaseosas.unshift(producto[i]);
            }
        }
        res.render('RealizarPedido', {
            listHamburguesas,listPapas,listGaseosas, mensaje
        });

    }
    });
    });
});

app.get('/eliminarDeCarrito/:Nombre', async (req, res) =>{
    const queryDelete = {Nombre: req.params.Nombre};
    collectionPedidos.deleteOne(queryDelete, function(error, obj){
        if(!error) {
        console.log('Borré elemento');
    }
    });
    res.redirect('/VerCarrito');
});

app.get('/Pagar', async (req, res) =>{
    var listPedidos=[];
    var caloriasTotales=0;
    var totalPagar=0;
    var interes=0;
    collectionProductos.find().toArray((error, producto)=>{
    collectionPedidos.find().toArray((error, pedidos)=>{
        for(var i=0;i<producto.length;i++){
            for(var j=0;j<pedidos.length;j++){
                if(producto[i]._id.equals(pedidos[j].idProducto) && pedidos[j].SnPagado=='false'){
                   listPedidos.unshift(producto[i]) 
                   interes=(Number(producto[i].Precio)*21)/100;
                   caloriasTotales+=Number(producto[i].Calorias);
                   totalPagar+=Number(pedidos[j].Precio);
                   totalPagar+=interes;
                }
            }
        }
        res.render('Pagar',{
            listPedidos, caloriasTotales, totalPagar, interes
        });
    });
    });
    
app.post('/Pagar/:totalPagar', (req, res)=>{
    const query = {SnPagado: 'false'};
    const nuevosDatos = {$set:{SnPagado: 'true'}};
    collectionPedidos.updateOne(query, nuevosDatos, function(error, result){
        if(error) throw error;
        console.log('Pedido pagado.');
        var tarjeta=req.body.nro1 + req.body.nro2 + req.body.nro3 + req.body.nro4;
        collectionUsuarios.insertOne(
            {Nombre: req.body.nombre, Apellido: req.body.apellido, Dni: req.body.DNI, Tarjeta: tarjeta, Codigo: req.body.seguridad, Importe: req.params.totalPagar}
        );
    });
    res.redirect('/RealizarPedido');

});

});

}
else{
    console.log(error.message);
}
});
