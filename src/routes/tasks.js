const router = require("express").Router();
const mongojs = require("mongojs");
db = mongojs("mongodb://ewerton:123456@ds235788.mlab.com:35788/acepaydb", ['tasks']);


router.get("/task", (req, res, next) => {
    //res.send("API AQUI");
    db.tasks.find((err, tasks) => {
        if(err) return next(err);
        res.json(tasks);
    });
});

router.get("/task:id", (req, res, next) => {
    //res.send("API AQUI");
    db.tasks.findOne({_id: req.params._id},(err, task) => {
        if(err) return next(err);
        res.json(task);
    });
});

module.exports = router;