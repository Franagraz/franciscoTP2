const path = require('path')
const express = require ('express');
const { config, engine} = require ('express-edge');
const bodyParser = require('body-parser');
const Producto = require('./models/producto.js');
const { db } = require('./models/producto.js');
var ObjectId = require('mongodb').ObjectID;




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
      
 
/*-------------------------------------*/

const app = new express();
app.use(engine);
app.set('views', `${__dirname}/views`);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));



app.listen(4000, () =>{
    console.log('Aplicación levantada en el puerto 4000');
});

/*------------------HOME------------------*/
app.get('/', (req, res) => {
    res.render('index');
});


app.get('/Menu', async (req, res) => {
    collectionProductos.find().toArray((error, result)=>{
      res.render('Menu',{
          result
      })
      })
  });

/*------------------Empleado------------------*/
app.post('/indexEmpleado', async (req, res) => {
    res.render('indexEmpleado');
});


/*------------------Cliente------------------*/
app.post('/indexCliente', async (req, res) => {
    res.render('indexCliente');
});

//Renderiza la vida "AdministrarCategorias".
app.get('/AdministrarCategorias', async(req, res)=>{
    collectionCategorias.find().toArray((error, cat)=>{
        res.render('AdministrarCategorias',{
            cat
        })
        })
});

//Se genera una nueva categoria.
app.post('/AdministrarCategorias/:Categoria', async (req, res) => {
    collectionCategorias.insertOne(
        {Categoria: req.body.Categoria}
    );
    res.redirect('/AdministrarCategorias');
});

//Se elimina la categoria seleccionada
app.get('/eliminarCat/:Categoria', async (req, res)=>{
    const queryDelete = {Categoria: req.params.Categoria};
    collectionCategorias.deleteOne(queryDelete, function(error, obj){
        if(!error) {
        console.log('Borré categoria.');

        
        collectionProductos
        //db.collection('productos')
        .deleteMany({Categoria: queryDelete}, function(error, obj){
            if(!error) {
                console.log('Borré productos con dicha categoria.');
            }
            });

    }
    });

    res.redirect('/AdministrarCategorias');
});



//Renderiza la vista "VerCarrito" mostrando todos los pedidos(productos seleccionados anteriormente).
app.get('/VerCarrito', async (req, res)=>{
    listPedidos=[];
    var vacio;
    var mensaje='Su carrito está vacío!';  
    collectionProductos.find().toArray((error, producto)=>{
    collectionPedidos.find().toArray((error,pedidos)=>{
    for(var i=0;i<producto.length;i++){
        for(var j=0;j<pedidos.length;j++){
            if(producto[i]._id.equals(pedidos[j].idProducto) && pedidos[j].SnPagado=='false'){
               listPedidos.unshift(pedidos[j]);
               vacio=false;
            }
        }
    }
    
    if(vacio==false){
    res.render('VerCarrito',{
        listPedidos
    });
    }else{
        collectionProductos.find().toArray((error, prod)=>{
        res.render('RealizarPedido', {
            prod, mensaje
        });
    });
    }
    });
    });
});

//Elimina del carrito el pedido seleccionado
app.get('/eliminarDeCarrito/:_id', async (req, res) =>{
    var id=String(req.params._id);
    try{
   collectionPedidos.deleteOne({ "_id" : ObjectId(id) }, function(error, obj){
       if(!error) {
       console.log('Borré elemento '+id);
   }
   });
    }catch(e){
        console.log(e);
    }
   res.redirect('/VerCarrito');


});



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

app.get('/indexEmpleado', async (req, res) => {
    res.render('indexEmpleado');
});

//Muestra los pedidos vendidos en el día de hoy.
app.get('/informeProductos', async (req, res) => {
    var lista = [];
    var ganancia=0;
    const date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); 
    var yyyy = date.getFullYear();
    const fecha = String(yyyy+'-'+mm+'-'+dd);
    collectionProductos.find().toArray((error, productos)=>{
    collectionPedidos.find().toArray((error, pedidos)=>{
        //Recorro los productos y pedidos para ver si los pedidos cumplen los requisitos para ser mostrados.
        for(var i=0;i<pedidos.length;i++){
            for(var j=0;j<productos.length;j++){
            //Pregunto si el ID del producto es igual al ID del pedido, si el pedido fue pagado y si la fecha coincide con la fecha actual. De ser asi, agrego a la lista para mostrar
            //y acumulo la ganancia total.
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
                   interes+=(Number(producto[i].Precio)*21)/100;
                   caloriasTotales+=Number(producto[i].Calorias);
                   totalPagar+=Number(pedidos[j].Precio);
                }
            }
        }
        totalPagar = Number(totalPagar.toFixed(3));
        interes = Number(interes.toFixed(3));
        res.render('Pagar',{
            listPedidos, caloriasTotales, totalPagar, interes
        });
    });
    });
});

app.post('/Pagar/:totalPagar', async (req, res)=>{
    const query = {SnPagado: 'false'};
    const nuevosDatos = {$set:{SnPagado: 'true'}};
    collectionPedidos.updateMany(query, nuevosDatos, function(error, result){
        if(error) throw error;
        console.log('Pedido pagado.');
        var tarjeta=req.body.nro1 + req.body.nro2 + req.body.nro3 + req.body.nro4;
        collectionUsuarios.insertOne(
            {Nombre: req.body.nombre, Apellido: req.body.apellido, Dni: req.body.DNI, Tarjeta: tarjeta, Codigo: req.body.seguridad, Importe: req.params.totalPagar}
        );
    });
    res.redirect('/RealizarPedido');
});

//Vista general donde se muestran todos los productos y se puede elegir cual eliminar o modificar, o si se desea agregar uno nuevo.
app.get('/productos', async (req, res) => {
    const date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); 
    var yyyy = date.getFullYear();
    const fecha = yyyy+'-'+mm+'-'+dd
    var ordenarFecha = {Fecha: -1}
    collectionProductos.find().sort(ordenarFecha).toArray((error, result)=>{
        collectionCategorias.find().toArray((error, result2)=>{
        res.render('productos',{
            fecha, result, result2 
        })
    })
        })
});

//Se agrega un nuevo producto.
app.post('/productos/guardar', async (req, res) => {
    const date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); 
    var yyyy = date.getFullYear();
    const fecha = yyyy+'-'+mm+'-'+dd;
    collectionProductos.insertOne(
            
        {Nombre: req.body.Nombre, Precio: req.body.Precio, Descripcion: req.body.Descripcion,
             Categoria: req.body.Categoria, Calorias: req.body.Calorias, Fecha: fecha
             // ,SnPagado: 'false'
            }
    );
    res.redirect('/productos');
});

//Se elimina un producto seleccionado.
app.get('/eliminar/:Nombre', async (req, res) =>{
    const queryDelete = {Nombre: req.params.Nombre};
    collectionProductos.deleteOne(queryDelete, function(error, obj){
        if(!error) {
        console.log('Borré elemento');
    }
    });
    res.redirect('/productos');
});


//Renderiza la vista para realizar pedido y muestra todos los productos con sus respectivos atributos
app.get('/RealizarPedido', async (req, res) =>{
    var i=0;
    collectionProductos.find().toArray((error, prod)=>{
        res.render('RealizarPedido',{
             prod
    });
    });
});

//Agrega el producto seleccionado por el cliente al carrito
app.get('/AgregarCarrito/:Nombre', async (req, res)=>{
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
            mensajeOk = "¡'" + query+ "' fue agregado exitósamente!";
            encontrado=true;
        }
        i++;
    }
    collectionPedidos.insertOne(

        {idProducto: idProd, Nombre: query, Precio: precio, SnPagado: 'false', Fecha: fecha}
        
    );
    console.log("Guardé "+query+" en la tabla pedidos");
        i=0;
        collectionProductos.find().toArray((error, prod)=>{
        res.render('RealizarPedido', {
            prod, mensajeOk
        });
    });

    })

});


//Renderiza la vida "AdministrarCategorias".
app.get('/AdministrarCategorias', async(req, res)=>{
    var ordenarCategoria = {Categoria: 1}
    collectionCategorias.find().sort(ordenarCategoria).toArray((error, cat)=>{
        res.render('AdministrarCategorias',{
            cat
        })
        })
});

//Se genera una nueva categoria.
app.post('/AdministrarCategorias/:Categoria', async (req, res) => {
    collectionCategorias.insertOne(
        {Categoria: req.body.Categoria}
    );
    res.redirect('/AdministrarCategorias');
});



}
else{
    console.log(error.message);
}
});