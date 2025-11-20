const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "State",
  tableName: "states",
  columns: {
    id: { type: "int", primary: true, generated: true },
    name: { type: "varchar", nullable: false }
  },
  relations: {
    country: {
      target: "Country",
      type: "many-to-one",
      joinColumn: true
    },
    cities: {
      target: "City",
      type: "one-to-many",
      inverseSide: "state",
      cascade: true
    }
  }
});
