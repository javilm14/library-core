// Definición del modelo de autores
module.exports = function(sequelize, DataTypes) {
	return sequelize.define(
		'books_authors_link',
			{
				book: {
					type: DataTypes.INTEGER
				},
				author: {
					type: DataTypes.INTEGER
				}
			},
			{
				freezeTableName: true,
				timestamps: false,
				createdAt: false,
				updatedAt: false
			}
		);
}