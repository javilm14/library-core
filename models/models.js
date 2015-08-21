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
console.log('Inicializando base de datos de libros...')
var books = sequelize.import(path.join(__dirname,'books'));
exports.books = books;
sequelize.sync().then(function() {
  books.count().then(function (count) {
    console.log('Base de datos inicializada: ' + count + ' libros.');
  });
});

// Importar la definición de la tabla authors en authors.js
console.log('Inicializando base de datos de autores...')
var authors = sequelize.import(path.join(__dirname,'authors'));
exports.authors = authors;
sequelize.sync().then(function() {
  authors.count().then(function (count) {
    console.log('Base de datos inicializada: ' + count + ' autores.');
  });
});

// Importar la definición de la tabla series en series.js
console.log('Inicializando base de datos de series...')
var series = sequelize.import(path.join(__dirname,'series'));
exports.series = series;
sequelize.sync().then(function() {
  series.count().then(function (count) {
    console.log('Base de datos inicializada: ' + count + ' series.');
  });
});

// Importar la definición de la tabla data en data.js
console.log('Inicializando base de datos de data...')
var data = sequelize.import(path.join(__dirname,'data'));
exports.data = data;
sequelize.sync().then(function() {
  data.count().then(function (count) {
    console.log('Base de datos inicializada: ' + count + ' data.');
  });
});

// Importar la definición de la tabla tags en tags.js
console.log('Inicializando base de datos de etiquetas...')
var tags = sequelize.import(path.join(__dirname,'tags'));
exports.tags = tags;
sequelize.sync().then(function() {
  tags.count().then(function (count) {
    console.log('Base de datos inicializada: ' + count + ' etiquetas.');
  });
});

// Importar la definición de la tabla books_authors_link en books_authors_link.js
console.log('Inicializando base de datos de relaciones entre libros y autores...')
var books_authors_link = sequelize.import(path.join(__dirname,'books_authors_link'));
exports.books_authors_link = books_authors_link;
sequelize.sync().then(function() {
  books_authors_link.count().then(function (count) {
    console.log('Base de datos inicializada: ' + count + ' resultados.');
  });
});

// Importar la definición de la tabla books_series_link en books_series_link.js
console.log('Inicializando base de datos de relaciones entre libros y series...')
var books_series_link = sequelize.import(path.join(__dirname,'books_series_link'));
exports.books_series_link = books_series_link;
sequelize.sync().then(function() {
  books_series_link.count().then(function (count) {
    console.log('Base de datos inicializada: ' + count + ' resultados.');
  });
});

// Importar la definición de la tabla books_tags_link en books_tags_link.js
console.log('Inicializando base de datos de relaciones entre libros y etiquetas...')
var books_tags_link = sequelize.import(path.join(__dirname,'books_tags_link'));
exports.books_tags_link = books_tags_link;
sequelize.sync().then(function() {
  books_tags_link.count().then(function (count) {
    console.log('Base de datos inicializada: ' + count + ' resultados.');
  });
});