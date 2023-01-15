
const IndexHandler = async (req, res) => {
    // console.log(db)
    const data = await req.db.table('users')
    console.log(data)
    res.json(data)
}
module.exports = IndexHandler