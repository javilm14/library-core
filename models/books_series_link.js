// Definición del modelo de autores
module.exports = function(sequelize, DataTypes) {
	return sequelize.define(
		'books_series_link',
			{
				book: {
					type: DataTypes.INTEGER
				},
				series: {
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