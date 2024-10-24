const z = require('zod');

//Creamos el schema que contendra las validaciones al obtener propiedades de los objetos
//Creamos una constante y lo definimos objeto con ZOD
const movieSchema = z.object({
    /* De este modo obtenemos las propiedades que contiene cada elemento de los objetos en el 
    array movies, en el caso de title definimos que tiene que ser un dato de tipo string, si 
    los datos obtenidos son de un tipo diferente o no existe el dato que tiene que pasarse se 
    declara el manejo de excepciones de la siguiente manera */
    title: z.string({
        //Para error en el tipo de dato
        invalid_type_error: 'Movie title must be a string',
        //Para declarar que es requerido el dato
        required_error: 'Title is required'
    }),
    /* En year declaramos que tiene que ser un numero, ser entero y tener un minimo y un 
    maximo, las condiciones se pueden encadenar como se ve abajo */
    year: z.number().int().min(1900).max(2024),
    /* Definimos las condiciones para director con el manejo de excepciones */
    director: z.string({
        invalid_type_error: 'Movie director must be a string',
        required_error: 'director is required'
    }),
    /* definimos como numero, ser entero y ser positivo(Mayor que 0) */
    duration: z.number().positive().int(),
    /* Definimos como un numero entero con minimo y maximo, tambien que por defecto contenga un valor, por lo que declarar este valor es opcional */
    rate: z.number().int().min(0).max(10).default(5),
    /* Definimos que sea un string y una URL junto con el manejo de excepciones */
    poster: z.string().url({
        message: 'Poster must be a valid URL'
    }),
    /* Definimos que genero sea una array de datos */
    genre: z.array(
        /* Definimos las posibilidades que seran aceptadas dentro de un enum junto con el 
        manejo de excepciones del array*/
        z.enum(['Action','Adventure','Comedy','Drama','Fantasy','Horror','Sci-fi','Thriller']),
        {
            required_error: 'Movie genre required',
            invalid_type_error: 'Movie genre must be an array of enum Genre'
        })
})

/* Definimos la funcion que utilizara estas validaciones y el parametro que recibirá, el cual 
sera el array movies, luego se transformara a un objeto JSON safeparse(el cual si se obtiene un error devolvero un objeto tipo JSON con las especificaciones) que se podra finalmente utilizar el movieSchema */
function validateMovie(input){
    return movieSchema.safeParse(input)
}

//Declaramos la funcion que validará los datos para la funcion path, con esta forma de declaracion del schema .partial() agrega la funcionalidad de que cada uno de los argumentos que contiene son opcionales, por lo que en el caso de solo querer actalizar el año de una pelicula podriamos hacerlo utilizando las validaciones ya creadas como esta pero solo diciendole que procese el resto de validaciones como opcionales
function validatePartialMovie(){
    return movieSchema.partial().safeParse(input)
}


//Se exporta el modulo
module.exports = {
    validateMovie,
    validatePartialMovie
}