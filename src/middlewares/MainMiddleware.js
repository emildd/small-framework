const querystring = require('querystring');
const Route = require('route-parser');
const knexfile = require('../../knexfile');
const routes = require('../routes');
const knex = require('knex');
const db = knex(knexfile.development)

module.exports = async (r,s) => { 
    r.start = new Date().getTime()
    r.cookies = parseCookies(r)
    r.guestId = guestCookies(r,s)
    // console.log(r.cookies)
    r.db = db
    r.end = new Date().getTime()
    r.ms = 0
    s.json = (obj) => {
        s.statusCode = 200
        s.setHeader('Content-Type', 'application/json')
        s.write(JSON.stringify(obj))
        s.end();
    }
    r.query = {}
    r.params = {}
    var method = r.method
    var url = r.url
    var arrPath = url.split('?')
    var q = arrPath.length > 1 ? arrPath[1] : ""
    arrPath.pop()
    var path = arrPath.join('')
    var query = querystring.parse(q, "&", "=")
    r.query = query
    r.body = null;
    r.on('data', function (chunk) {
        r.body = "";
        if (chunk) {
            r.body += chunk;
        }
    });
    // cors
    var headers = {};
    // set header to handle the CORS
    s.setHeader('Access-Control-Allow-Origin','*')
    s.setHeader('Access-Control-Allow-Headers','Content-Type, Content-Length, Authorization, Accept, X-Requested-With')
    s.setHeader('Access-Contrl-Allow-Methods','PUT, POST, GET, DELETE, OPTIONS')
    s.setHeader("Access-Control-Max-Age",'86400')
    // s.writeHead(200, headers);
    // s.writeHead(headers)

    if ( r.method === 'OPTIONS' ) {
        console.log('OPTIONS SUCCESS');
        r.end();
    }else{
        var route = routes.find(f => {
            var routeIsMatched = false;
            var router = new Route(f.path);
            var urlArr = url.split('?')
            if(urlArr.length > 1){
                urlArr.pop()
            }
            url = urlArr.join('')
            if(url.substring(url.length -1) === "/"){
                url = url.substring(0, url.length -1)
            }
            if(url === ""){
                url = "/"
            }
            var matchingRouter = router.match(url);
            if (matchingRouter) {
                routeIsMatched = true;
                r.params = matchingRouter
            }
            return routeIsMatched && method === f.method
        })
        if (route) {
            if(route.middlewares && route.middlewares.length){
                for (let index = 0; index < route.middlewares.length; index++) {
                    const m = route.middlewares[index];
                    m(r,s)
                }
                // route.middlewares.forEach(m => {
                //     m(r,s)
                // })
            }
            await route.handler(r, s)
        } else {
            s.statusCode = 404
            s.write(`${method} ${url} route not found`)
            s.end()
        }
    }
    r.on('end', function () {
        r.ends = new Date().getTime()
        r.ms = r.ends - r.start
        console.info(new Date().getTime() / 1000, s.statusCode, method, path, url, `${r.ms}ms ${process.pid}`)
    });
}
function parseCookies (request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function(cookie) {
        let [ name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}
function guestCookies(req, res){
    // set guest 
    let gid = ""
    console.log(req.cookies)
    if(!req.cookies.__gid){
        gid = makeid(5)
        res.setHeader("Set-Cookie",`__gid=${makeid(5)}` )

    }else{
        gid = req.cookies.__gid
    }
    return gid
}
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
