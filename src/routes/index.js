//Rotas 
const router = require("express").Router();

router.get("/", (req, res, next) => {
    res.send("Ola Mundo!");

})

module.exports = router;