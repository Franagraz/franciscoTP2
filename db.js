const mongoClient = require('mongodb').MongoClient;
const uriDataBase = "mongodb+srv://tptaller2:trabajopracticotaller2@cluster0-zdr37.mongodb.net/test?retryWrites=true&w=majority";
const Producto = require('./models/producto');
mongoClient.connect(uriDataBase, function(error, result){
    if(!error){
        console.log('Conexión exitosa');
        
        const collectionProductos = result.db('tptaller2').collection('productos');
        const collectionPedidos = result.db('tptaller2').collection('pedidos');
         var query = { Nombre: 'Hamburguesa clásica'};
         const productos = collectionProductos.find(query).toArray(function(err, result) {
         console.log(result)
        })
        
        /*
        const productos = collectionProductos.find().toArray((error, result)=>{
            console.log(result);
        });
        


           
        try{
            collectionProductos.insertOne(
            
                {Nombre: 'test2', Precio: 9999, Descripción: 'test2', Categoría: 'test2',Calorias: 9999}
                
            );
            console.log('Subi elemento')
        }catch(error){
            console.log(error);
        }
        
        
       
        const queryDelete = {Nombre: "test"};
        collectionPedidos.deleteMany(queryDelete, function(error, obj){
            if(!error) {
            console.log('Borré elemento');
            }
        });
*/
    }
    else{
        console.log(error.message);
    }
});