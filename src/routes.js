const IndexHandler = require("./handlers/IndexHandler");
module.exports = [
    {
        method: "GET",
        path: "/",
        handler: IndexHandler,
    },
]