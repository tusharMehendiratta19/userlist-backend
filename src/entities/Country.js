const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Country",
  tableName: "countries",
  columns: {
    id: { type: "int", primary: true, generated: true },
    name: { type: "varchar", nullable: false }
  },
  relations: {
    states: {
      target: "State",
      type: "one-to-many",
      inverseSide: "country",
      cascade: true
    }
  }
});
