const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "City",
  tableName: "cities",
  columns: {
    id: { type: "int", primary: true, generated: true },
    name: { type: "varchar", nullable: false }
  },
  relations: {
    state: {
      target: "State",
      type: "many-to-one",
      joinColumn: true
    }
  }
});
