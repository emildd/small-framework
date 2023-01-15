const PORT = process.env.PORT || 3001
const http = require('http')
const MainMiddleware = require('./src/middlewares/MainMiddleware');
const cluster = require('cluster')
const totalCPUs = require("os").cpus().length
if (cluster.isMaster) {
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        console.log("Let's fork another worker!");
        cluster.fork();
    });
} else {
    const server = http.createServer(async (r, s, next) => {
        MainMiddleware(r, s, next)
    })
    server.listen(PORT, () => {
        console.log(`http://localhost:${PORT} ${process.pid}`)
    })
}
