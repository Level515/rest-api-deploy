const express = require('express');
const crypto = require('node:crypto')
const movies = require('./movies.json');
const z = require('zod');
const { validateMovie } = require('./schema/movies');


const app = express();
app.use(express.json());

app.disable('X-powered-by');

app.get('/',(req,res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.json({message: "Hola mundo"});
})

//Todos los recursos que esten en el archivo JSON se identificaran con la URL movies
/* app.get('/movies', (req,res) => {
    res.json(movies);
}) */

//Se extrae de la url un parametro para poder utilizarlo al extraer un recurso
app.get('/movies/:id', (req,res) => { //path-to-regexp

    res.header('Access-Control-Allow-Origin', '*');

    const {id} = req.params;
    const movie = movies.find(movie => movie.id === id);
    if (movie) return res.json(movie);

    res.status(404).json({message: 'movie not found'})
})

app.get('/movies',(req,res) => {
    res.header('Access-Control-Allow-Origin', '*')

    //declaramos lo que obtenemos como de la string query en la variable genre
    const {genre} = req.query;
    // si genre es distinto de NULL entonces...
    if (genre) {
        //filtramos las peliculas y las ubicamos en un nuevo array, en este caso filteredMovies
        const filteredMovies = movies.filter(
            /* desde la variable movie obtenemos la propiedad genre y utilizando la funcion 
            some esta misma devolverá true cada que un elemento cumpla las condiciones 
            descriptas dentro, en este caso igualamos el valor del genero que obtuvimos de la 
            request y el dato que esta dentro del genre del recurso a minuscula para saber si 
            son iguales (de esta manera si la unica diferencia entre estos datos son las 
            mayusculas podremos ignorarlas) */
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies);
    }
    //el cambio al haberse aplicado sobre el array original movies luego se pasa como objeto JSON por la response
    res.json(movies);
})

app.post('/movies', (req,res) => {
    res.header('Access-Control-Allow-Origin', '*');
    
    //declaramos la variable que contendra el array con las peliculas, utilizamos la funcion validateMovie (Ver la declaracion y funcionamiento en ./schema/movie.js) y le pasamos como parametro el objeto req.body (Son los datos de la pelicula que queremos añadir a la base de datos)
    const result = validateMovie(req.body)

    //Manejo de excepciones, si result.error es distinto de NULL convertimos a un objeto JSON el objeto que nos pasara ZOD y lo enviamos por la respuesta
    if (result.error){
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    /* Definimos lo que será la nueva pelicula si es que los datos fueron validados correctamente */
    const newMovie = {
        //Generamos con crypto una ID unica para la pelicula
        id: crypto.randomUUID(),
        //Pasamos los datos del resultado que será un objeto
        ...result.data
    }


    //esto no seria REST porque estamos guardando el estado de la aplicacion en memoria
    //Insertamos la nueva pelicula (objeto newMovie que contiene {id, result.data}) dentro del array movies original
    movies.push(newMovie);

    //enviamos la respuesta conviertiendo el objeto a un objeto JSON y imprimiendolo en pantalla
    res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req,res) => {
    res.header('Access-Control-Allow-Origin', '*')
    //Obtenemos el ID del elemento
    const {id} = req.params;
    //buscamos con el ID en los objetos que contiene el array movies
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({message: 'Movie not found'})
    }

    //Eliminamos el objeto con el indice obtenido
    movies.splice(movieIndex, 1)

    return res.json({message: 'Movie deleted'})
})


app.patch('/movies/:id', (req,res) => {
    res.header('Access-Control-Allow-Origin', '*');

    //pasamos el objeto de la request (objeto con las propiedades de la pelicula) por la funcion validatePartialMovie (Ver definición para detalles)
    const result = validatePartialMovie(req.body);

    //si el exito en la ejecucion del result es diferente a realizado, imprimimos el mensaje del error en un objeto JSON
    if (!result.success) {
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    //obtenemos el id del parametro de la request
    const {id} = req.params
    //con la id obtenido la utilizamos como parametro para ejecutar una busqueda dentro del array y sus objetos especificando buscar por sus propiedades id
    const movieIndex = movies.findIndex(movie => movie.id === id)
    //si ni encontramos el id(nos devuelve -1) entonces imprimimos un mensaje de error
    if (movieIndex === -1) {
        return res.status(404).json({message: 'Movie not found'})
    }

    /* definimos el objeto que sera la pelicula actualizada */
    const updateMovie = {
        /* obtenemos las propiedades del objeto encontrado con la ID en el array movies, luego remplazamos las propiedades que contiene con las del objeto result.data */
        ...movies[movieIndex],
        ...result.data
    }

    //reemplazamos exactamente la pelicula en el array con el objeto actualizado
    movies[movieIndex] = updateMovie;

    //devolvemos el objeto que es la pelicula actualizada
    return res.json(updateMovie);
})

app.options('/movies/:id', (req,res) => {
    //se requiere para poder pasar por el cors
    res.header('Access-Control-Allow-Origin', '*');
    //se requiere para poder pasar por el cors con metodos que podrian generar cambios grandes como delete, put, path, etc
    res.header('Access-Control-Allow-Methods', '*');

})

//obtenemos el puerto de la variable de entorno que nos provera el servicio de hosting, si el mismo no posee, utilizará 1234
const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
})