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
    console.log("Servidor ativo em: http://localhost:" + port);
});

//  ------------------------------------------------------------------------------------------------------------------------
//	CONFIGURAÇÃO DO BANCO DE DADOS
//	------------------------------------------------------------------------------------------------------------------------
const pg = require('pg');
async function dbClient(){
    return new pg.Client({
        user: 'plqutghdamllgm',
        host: 'ec2-3-212-75-25.compute-1.amazonaws.com',
        database: 'dadn1cddkhm83j',
        password: '91c33fd5b27a61a5d01e872f66813058026eb512289d391605cb387057855093',
        port: 5432,
        ssl: { rejectUnauthorized: false }
    });
}

//  ------------------------------------------------------------------------------------------------------------------------
//	ROTAS
//	------------------------------------------------------------------------------------------------------------------------
//	ROTAS [USUÁRIO]
//	------------------------------------------------------------------------------------------------------------------------
//  [ GET ] ROTA: retorna um usuário, se a senha e email baterem
app.get('/login', urlencodedParser, async (req, res) => {
    try{
        const db = await dbClient();
        await db.connect();
        let result = await db.query("SELECT * FROM cliente WHERE email = $1 AND senha = $2;", [req.query.email, req.query.senha]);
        return res.json(
            {
                result: result.rows,
                success: true,
                stack_trace: ""
            }
        );
    }catch(e){
        return res.json(
            {
                result: [],
                success: false,
                stack_trace: JSON.stringify(e)
            }
        );
    }
});

app.get('/cadastro', urlencodedParser, async (req, res) => {
    // try{
    //     await db.connect();
    //     let result = await db.query("SELECT * FROM cliente WHERE email = $1 AND senha = $2;", [req.query.email, req.query.senha]);
    //     return res.json(
    //         {
    //             result: result.rows,
    //             success: true,
    //             stack_trace: ""
    //         }
    //     );
    // }catch(e){
    //     return res.json(
    //         {
    //             result: [],
    //             success: false,
    //             stack_trace: JSON.stringify(e)
    //         }
    //     );
    // }
});

