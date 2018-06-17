const router = require("express").Router();

router.get("/task", (req, res, next) => {

    res.send("API AQUI");
});

module.exports = router;