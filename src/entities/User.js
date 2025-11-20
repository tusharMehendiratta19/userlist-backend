const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: { type: "int", primary: true, generated: true },
    firstName: { type: "varchar", nullable: false },
    lastName: { type: "varchar", nullable: true },
    email: { type: "varchar", unique: true, nullable: false },
    password: { type: "varchar", nullable: false },
    createdAt: { type: "timestamp", createDate: true },
    gender: { type: "varchar", nullable: false },
    city: { type: "varchar", nullable: false },
    state: { type: "varchar", nullable: false },
    zipcode: { type: "int", nullable: false },
    country: { type: "varchar", nullable: false },
    interest: { type: "text", array: true, default: [] },
    profileImage: { type: "varchar", nullable: true },
    refreshToken: { type: "text", default: "" }
  },
  relations: {
    passwordArray: {
      target: "UserPasswordHistory",
      type: "one-to-many",
      inverseSide: "user",
      cascade: true
    }
  }
});
