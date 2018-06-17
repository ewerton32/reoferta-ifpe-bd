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
    db.tasks.findOne({_id: mongojs.ObjectId(req.params._id)},(err, task) => {
        if(err) return next(err);
        res.json(task);
    });
});

router.post("/tasks", (req, res, next) => {
    const task = req.body;
    if(!task.title || !(task.isDone)+"") {
          res.status(400).json({
            error: "Bad data!"

          });  

    } else {
        db.task.save(task, (err, task) => {
            if(err) return next(err);
            res.json(task);
        });
    }


})
//metodo delete para remover dados
router.delete("/tasks:id", (req, res, next) => {
    db.tasks.remove({_id: mongojs.ObjectId(req.params.id)}, (err, result) => {
        if(err) return next(err);
        res.json(result);
    });    
})

router.put("/tasks:id", (req, res, next) => {
    const task = req.body;
    const updateTask = { };

    if(task.isDone){
        updateTask.isDone = task.isDone;
    }

    if( task.title){
        updateTask.title = task.title;
    }

    if(!updateTask) {
        res.status(400).json({
            error : "Bad Request!"
        });
     } else {
        
        db.tasks.update({_id: mongojs.ObjectId(req.params.id)}, (err, task) =>{
            if (err) return next(err);
            res.json(task);
        
        });
    };
})

module.exports = router;