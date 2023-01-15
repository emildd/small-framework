const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Tag", // Will use table name `category` as default behaviour.
    tableName: "tags", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        name: {
            type: "varchar",
            length: 255,
            unique: true,
            nullable: false,
        },
        slug: {
            type: "varchar",
            length: 255,
            unique: true,
            nullable: false,
        },
    },
    indices:[
        {columns: ["slug"]}
    ]
})