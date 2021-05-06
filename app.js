//  -----------------------------------------------------------------------------------------------------------------------
//	CONFIGURAÇÃO DO SERVIDOR NODE E EXPRESS
//	-----------------------------------------------------------------------------------------------------------------------
var express = require('express');
var compression = require('compression');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(compression());
var port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', function () {
    console.log("PORTA: " + port);
});

//  ------------------------------------------------------------------------------------------------------------------------
//	CONFIGURAÇÃO DO BANCO DE DADOS
//	------------------------------------------------------------------------------------------------------------------------
const pg = require('pg');
const db = new pg.Client({
    user: 'plqutghdamllgm',
    host: 'ec2-3-212-75-25.compute-1.amazonaws.com',
    database: 'dadn1cddkhm83j',
    password: '91c33fd5b27a61a5d01e872f66813058026eb512289d391605cb387057855093',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

//  ------------------------------------------------------------------------------------------------------------------------
//	ROTAS
//	------------------------------------------------------------------------------------------------------------------------
//	ROTAS [USUÁRIO]
//	------------------------------------------------------------------------------------------------------------------------
//  [ GET ] ROTA: retorna uma mensagem de teste
app.get('/teste', urlencodedParser, async function (req, res) {
    try{
        await db.connect();
        let result = await db.query("SELECT * FROM abb;");
        return res.json({result: result.rows});
    }catch(e){
        res.json({error: e});
    }
});
