exports.testRoute = (req,res)=>{
    console.log(req.user);
    console.log(req.isAdmin);
    return res.json({})
}