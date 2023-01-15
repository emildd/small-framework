var typeorm = require("typeorm")

var dataSource = new typeorm.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "emylmaulana",
    password: "",
    database: "globalcms",
    synchronize: true,
    entities: [require("./entity/Tag")],
    migrationsTableName: "__migrations",
    migrations: [
        "./migration/*.js"
    ],
    cli: {
        entitiesDir: "./entity",
        migrationsDir: "./migration",
        subscribersDir: "./subscriber"
    }
})
dataSource.initialize()
.then(() => {
    console.log("Data Source has been initialized!")
})
.catch((err) => {
    console.error("Error during Data Source initialization", err)
})