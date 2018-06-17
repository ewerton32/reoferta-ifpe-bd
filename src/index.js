const cors = require("cors");
const express = require("express");
const app = express();
const indexRoutes = require("./routes/index");
const tasksRoutes = require("./routes/tasks");

//settings
app.set("port", process.env.PORT || 3000);
app.engine("html", require("ejs").renderFile);
app.set("ver engine", "ejs");

//midlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}))

//routes
app.use(indexRoutes);
app.use("/api",tasksRoutes);

//ouvindo a porta do servidor
app.listen(app.get("port"), () => {
    console.log("Servidor na porta: ", app.get("port"))
});