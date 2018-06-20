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

// 40 consultas solicitadas

function executeQuery(_numeroConsulta, callback) {
    let numeroConsulta = _numeroConsulta;
    let queryMongo = global.conn.collection("usuario");
    switch (numeroConsulta) {
        //1 - Buscar todos os documentos
        case '1': queryMongo.find({}).toArray(callback); break;
        //2 - Buscar documento por ID
        case '2': queryMongo.find(new ObjectId("5ab70b50734d1d57bac4d706")).toArray(callback); break;
        //3 - Buscar todos os documentos sem transacao associada
        case '3': queryMongo.find({ "transacoes": { $exists: true, $ne: "", $ne: null, $ne: {} } }).toArray(callback);
            break;
        //4 - Buscar todos os documentos com transacao associada
        case '4': queryMongo.find(
            {
                $or: [
                    { "transacoes": { $exists: false } },
                    { "transacoes": { $eq: "" } },
                    { "transacoes": { $eq: null } },
                    { "transacoes": { $eq: {} } }
                ]
            }).toArray(callback);
            break;
        //5 - Buscar transacoes de todos os documentos com transacao associada, agrupados por CPF
        case '5': queryMongo.aggregate([
            {
                "$match": {
                    "transacoes": {
                        $exists: true,
                        $ne: "",
                        $ne: null,
                        $ne: {}
                    }
                }
            },
            {
                "$group": {
                    _id: "$cpf",
                    "transacoes": {
                        "$push": "$transacoes"
                    }
                }
            }
        ]).toArray(callback);
            break;
        //6 - Buscar todos os documentos com transacao associada com data de transacao nos ultimos 6 meses, agrupados por CPF
        case '6': queryMongo.aggregate([
            {
                "$match": {
                    "transacoes": {
                        $exists: true,
                        $ne: "",
                        $ne: null,
                        $ne: {},
                    },
                    "transacoes.data": {
                        $lt: new Date(),
                        $gte: new Date(new Date().getTime() - (1 * 24 * 60 * 60000 * 180))
                    }
                }
            },
            {
                "$group": {
                    _id: "$cpf",
                    "transacoes": {
                        "$push": "$transacoes"
                    }
                }
            }
        ]).toArray(callback);
            break;
        //7 - Buscar todos os documentos com transacao associada com data de transacao nos ultimo ano, agrupados por CPF
        case '7': queryMongo.aggregate([
            {
                "$match": {
                    "transacoes": {
                        $exists: true,
                        $ne: "",
                        $ne: null,
                        $ne: {},
                    },
                    "transacoes.data": {
                        $lt: new Date(),
                        $gte: new Date(new Date().getTime() - (1 * 24 * 60 * 60000 * 365))
                    }
                }
            },
            {
                "$group": {
                    _id: "$cpf",
                    "transacoes": {
                        "$push": "$transacoes"
                    }
                }
            }
        ]).toArray(callback);
            break;
        //8 - Buscar documentos cadastradados na ultima semana
        case '8': queryMongo.find(
            {
                "data_cadastro": {
                    $lt: new Date(),
                    $gte: new Date(new Date().getTime() - (1 * 24 * 60 * 60000 * 7))
                }

            }
        ).toArray(callback);
            break;
        //9 - Buscar documentos cadastradados na dia atual
        case '9': queryMongo.find(
            {
                "data_cadastro": {
                    $lt: new Date(),
                    $gte: new Date(new Date().getTime() - (24 * 60 * 60000))
                }

            }
        ).toArray(callback);
            break;
        //10 - Buscar documentos cadastradados nos ultimos 6 meses
        case '10': queryMongo.find(
            {
                "data_cadastro": {
                    $lt: new Date(),
                    $gte: new Date(new Date().getTime() - (24 * 60 * 60000) * (6 * 30))
                }

            }
        ).toArray(callback);
            break;
        //11 - Buscar documentos cadastradados nos no mes atual (de qualquer ano)
        case '11': queryMongo.aggregate([
            {
                $project: {
                    "document": "$$ROOT",
                    month: false, month: { $month: '$data_cadastro' }
                }
            },
            {
                "$match":
                    {
                        "document.data_cadastro": { $exists: true },
                        "month": { $eq: new Date().getMonth() + 1 }
                    }
            }
        ]).toArray(callback);
            break;
        //12 - Buscar documentos cadastradados nos no dia atual (de qualquer mes)
        case '12': queryMongo.aggregate([
            {
                $project: {
                    "document": "$$ROOT",
                    "dia_do_mes": { $dayOfMonth: '$data_cadastro' }
                }
            },
            {
                "$match":
                    {
                        "document.data_cadastro": { $exists: true },
                        "dia_do_mes": { $eq: new Date().getDate() }

                    }
            }
        ]).toArray(callback);
            break;
        //13 - Buscar documentos cadastradados nos no dia e mes atual (de qualquer ano)
        case '13': queryMongo.aggregate([
            {
                $project: {
                    "document": "$$ROOT",
                    "dia_do_mes": { $dayOfMonth: '$data_cadastro' },
                    "mes_do_ano": { $month: '$data_cadastro' }
                }
            },
            {
                "$match":
                    {
                        "document.data_cadastro": { $exists: true },
                        "dia_do_mes": { $eq: new Date().getDate() },
                        "mes_do_ano": { $eq: new Date().getMonth() + 1 }
                    }
            }
        ]);
            break;
        //14 - Buscar documentos cadastradados nos no dia atual (de qualquer mes)
        case '14':
            break;
        //15 - Buscar documentos que completam 1 ano de cadastro no mês atual
        case '15': queryMongo.aggregate([
            {
                $project: {
                    "document": "$$ROOT",
                    "dia": { $dayOfMonth: '$data_cadastro' },
                    "mes": { $month: '$data_cadastro' },
                    "ano": { $year: '$data_cadastro' }
                }
            },
            {
                "$match":
                    {
                        "document.data_cadastro": { $exists: true },
                        "mes": { $eq: new Date().getMonth() + 1 },
                        "ano": { $eq: new Date().getFullYear() - 1 }
                    }
            }
        ]).toArray(callback);
            break;
        //16 - Buscar documentos de pessoas nascidas na última década
        case '16': queryMongo.find(
            {
                "data_nasc": {
                    $lt: new Date(),
                    $gte: new Date(new Date().getTime() - (24 * 60 * 60000) * (365 * 10))
                }

            }
        ).toArray(callback);
            break;
        //17 - Buscar documentos de pessoas maiores de 18 anos
        case '17': queryMongo.find(
            {
                "data_nasc": {
                    $lte: new Date(new Date().setYear(new Date().getFullYear() - 18))
                }
            }).toArray(callback);
            break;
        //18 - Buscar documentos de pessoas menores de 18 anos
        case '18': queryMongo.find(
            {
                "data_nasc": {
                    $gte: new Date(new Date().setYear(new Date().getFullYear() - 18))
                }
            }).toArray(callback);
            break;
        //19 - Buscar documentos de pessoas que fazem aniversário no mês atual
        case '19': queryMongo.aggregate([
            {
                $project: {
                    "document": "$$ROOT",
                    "mes": { $month: '$data_nasc' }
                },
            },
            {
                "$match":
                    {
                        "document.data_nasc": { $exists: true },
                        "mes": { $eq: new Date().getMonth() + 1 },

                    }
            }
        ]).toArray(callback);
            break;
        //20 - Buscar documentos cujo endereço do usuário é da cidade do Recife
        case '20': queryMongo.find(
            {
                "endereco.cidade": /recife/i
            }).toArray(callback);
            break;
        //21 - Buscar documentos cujo endereço do usuário é do estado de Pernambuco
        case '21': queryMongo.find(
            { "endereco.estado": { $in: [/pe/i, /pernambuco/i] } }
        ).toArray(callback);
            break;
        //22 - Buscar documentos nos quais a conta bancária é corrente
        case '22': queryMongo.find(
            { "conta_bancaria.operacao": 1 }
        ).toArray(callback);
            break;
        //23 - Buscar documentos nos quais a conta bancária é poupança
        case '23': queryMongo.find(
            { "conta_bancaria.operacao": 13 }
        ).toArray(callback);
            break;
        //24 - Buscar documentos nos quais o saldo a receber da conta bancária maior que 0
        case '24': queryMongo.find(
            { "conta_bancaria.saldoReceber": { $gt: 0 } }
        ).toArray(callback);
            break;
        //25 - Buscar documentos nos quais o saldo a receber da conta bancária igual a 0
        case '25': queryMongo.find(
            { "conta_bancaria.saldoReceber": 0 }
        ).toArray(callback);
            break;
        //26 - Buscar documentos nos quais o saldo da BitCoin igual a 0
        case '26': queryMongo.find(
            { "conta_acepay.saldo_BTC": 0 }
        ).toArray(callback);
            break;
        //27 - Buscar documentos nos quais o saldo de BitCoin igual a 0,005
        case '27': queryMongo.find(
            { "conta_acepay.saldo_BTC": 0.005 }
        ).toArray(callback);
            break;
        //28 - Buscar documentos nos quais o saldo de BitCoin é igual a 0,002
        case '28': queryMongo.find(
            { "conta_acepay.saldo_BTC": 0.002 }
        ).toArray(callback);
            break;
        //29 - Buscar documentos nos quais o saldo de BitCoin está entre 0 e 1
        case '29': queryMongo.find(
            { "conta_acepay.saldo_BTC": { $gte: 0, $lt: 1 } }).toArray(callback);
            break;
        //30 - Buscar documentos nos quais o saldo de BitCoin da conta a acePay é maior ou igual a 1
        case '30': queryMongo.find(
            { "conta_acepay.saldo_BTC": { $gte: 1 } }).toArray(callback);
            break;
        //31 - Buscar a soma dos saldos das das contas cujos endereços sao do Estado de Pernambuco
        case '31': queryMongo.aggregate([{
            $match:
                {
                    "endereco.estado": { $in: [/pe/i] },
                }
        },
        {
            $group:
                {
                    _id: null,
                    soma: { $sum: "$conta_acepay.saldo_BTC" }
                }
        }]).toArray(callback);
            break;
        //32 - Buscar a soma dos saldos das das contas cujos endereços sao do Estado de Alagoas
        case '32': queryMongo.aggregate([{
            $match:
                {
                    "endereco.estado": { $in: [/al/i] },
                }
        },
        {
            $group:
                {
                    _id: null,
                    soma: { $sum: "$conta_acepay.saldo_BTC" }
                }
        }]).toArray(callback);
            break;
        //33 - Buscar a soma dos saldos das das contas cujos endereços sao do Estado da Bahia
        case '33': queryMongo.aggregate([{
            $match:
                {
                    "endereco.estado": { $in: [/ba/i] },
                }
        },
        {
            $group:
                {
                    _id: null,
                    soma: { $sum: "$conta_acepay.saldo_BTC" }
                }
        }]).toArray(callback);
            break;
        //34 - Buscar a soma dos saldos das das contas cujos endereços sao do Estado do Ceará
        case '34': queryMongo.aggregate([{
            $match:
                {
                    "endereco.estado": { $in: [/ce/i] },
                }
        },
        {
            $group:
                {
                    _id: null,
                    soma: { $sum: "$conta_acepay.saldo_BTC" }
                }
        }]).toArray(callback);
            break;
        //35 - Buscar a soma dos saldos das das contas cujos endereços sao do Estado de Maranhão
        case '35': queryMongo.aggregate([{
            $match:
                {
                    "endereco.estado": { $in: [/ma/i] },
                }
        },
        {
            $group:
                {
                    _id: null,
                    soma: { $sum: "$conta_acepay.saldo_BTC" }
                }
        }]).toArray(callback);
            break;
        //36 - Buscar a soma dos saldos das das contas cujos endereços sao do Estado do Piauí
        case '36': queryMongo.aggregate([{
            $match:
                {
                    "endereco.estado": { $in: [/pi/i] },
                }
        },
        {
            $group:
                {
                    _id: null,
                    soma: { $sum: "$conta_acepay.saldo_BTC" }
                }
        }]).toArray(callback);
            break;
        //37 - Buscar a soma dos saldos das das contas cujos endereços sao do Estado da Paraíba
        case '37': queryMongo.aggregate([{
            $match:
                {
                    "endereco.estado": { $in: [/pa/i] },
                }
        },
        {
            $group:
                {
                    _id: null,
                    soma: { $sum: "$conta_acepay.saldo_BTC" }
                }
        }]).toArray(callback);
            break;
        //38 - Buscar a soma dos saldos das das contas cujos endereços sao do Estado da Paraíba
        case '38': queryMongo.aggregate([{
            $match:
                {
                    "endereco.estado": { $in: [/pa/i] },
                }
        },
        {
            $group:
                {
                    _id: null,
                    soma: { $sum: "$conta_acepay.saldo_BTC" }
                }
        }]).toArray(callback);
            break;
        //39 - Buscar a soma dos saldos das das contas cujos endereços sao do Estado de Sergipe
        case '39': queryMongo.aggregate([{
            $match:
                {
                    "endereco.estado": { $in: [/se/i] },
                }
        },
        {
            $group:
                {
                    _id: null,
                    soma: { $sum: "$conta_acepay.saldo_BTC" }
                }
        }]).toArray(callback);
            break;
        //40 - Buscar a soma dos saldos das contas cujos endereços sao do Estado do Rio Grande do Norte
        case '40': queryMongo.aggregate([{
            $match:
                {
                    "endereco.estado": { $in: [/rn/i] },
                }
        },
        {
            $group:
                {
                    _id: null,
                    soma: { $sum: "$conta_acepay.saldo_BTC" }
                }
        }]).toArray(callback);
            break;

        default: console.log("default");
    }
}

module.exports = router;