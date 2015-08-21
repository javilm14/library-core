// Definición del modelo de autores
module.exports = function(sequelize, DataTypes) {
	return sequelize.define(
		'series',
			{
				name: {
					type: DataTypes.TEXT
				},
				sort: {
					type: DataTypes.TEXT
				}
			},
			{
				timestamps: false,
				createdAt: false,
				updatedAt: false
			}
		);
}