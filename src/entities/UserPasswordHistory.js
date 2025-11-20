const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "UserPasswordHistory",
  tableName: "user_password_history",
  columns: {
    id: { type: "int", primary: true, generated: true },
    password: { type: "text", nullable: false },
    createdAt: { type: "timestamp", createDate: true }
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "user_id" },
      onDelete: "CASCADE"
    }
  }
});
