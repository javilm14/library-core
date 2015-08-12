var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = (process.env.DATABASE_URL || "sqlite://:@:/")
	.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE || "metadata.db";


// Cargar Modelo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd, 
  { dialect:  protocol,
    protocol: protocol,
    port:     port,
    host:     host,
    storage:  storage,  // solo SQLite (.env)
    omitNull: true      // solo Postgres
  }      
);

// Importar la definición de la tabla books en books.js
var books = sequelize.import(path.join(__dirname,'books'));

// Importar la definición de la tabla Comment
//var Comment = sequelize.import(path.join(__dirname,'comment'));

//Comment.belongsTo(Quiz);
//Quiz.hasMany(Comment);

exports.books = books; // exportar definición de tabla Quiz
//exports.Comment = Comment;
// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function() {
  // then(..) ejecuta el manejador una vez creada la tabla
	books.count().then(function (count) {
		console.log('Base de datos inicializada: ' + count + ' libros.');
	});
});