// Definición del modelo de autores
module.exports = function(sequelize, DataTypes) {
	return sequelize.define(
		'authors',
			{
				name: {
					type: DataTypes.TEXT
				},
				sort: {
					type: DataTypes.TEXT
				},
				link: {
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