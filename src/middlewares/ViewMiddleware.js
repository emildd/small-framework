const swig  = require('swig');
const path = require('path')
const __dir__ = path.resolve()
const viewsFolder = path.join(__dir__, 'src','views')
const ViewMiddleware = async (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    res.view = (templateName, data) => {
        try {
            const html = swig.renderFile(path.join(viewsFolder,templateName), data).replace(/\n/g, "");
            res.write(html)
            res.end()
        } catch (error) {
            console.log(error)
            throw error        
        }
    }
}
module.exports = ViewMiddleware