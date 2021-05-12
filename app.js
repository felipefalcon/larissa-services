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


















//  ------------------------------------------------------------------------------------------------------------------------
//	CONFIGURAÇÃO DO MÓDULO NODEMAILER
//	------------------------------------------------------------------------------------------------------------------------
const nodemailer = require('nodemailer');

app.get('/esqueci-senha', urlencodedParser, async (req, res) => {
    let email = req.query.email;
    let user = {};

    try{
        const db = await dbClient();
        await db.connect();
        let result = await db.query("SELECT * FROM cliente WHERE email = $1;", [req.query.email]);
        user = result.rows[0];
        let transporter = nodemailer.createTransport({
            host: 'smtp-mail.outlook.com',
            secureConnection: false, // TLS requires secureConnection to be false
            port: 587, // port for secure SMTP
            tls: {
                ciphers:'SSLv3'
            },
            auth: {
                user: 'projeto-tcc-2020@outlook.com',
                pass: 'Projeto2020'
            }
        });
        let mailOptions = {
            from: '"projeto-tcc-2020@outlook.com', // sender address
            to: email, // list of receivers
            subject: 'Recuperação senha - Projeto WEB', // Subject line
            html: "Você parece ter se esquecido sua senha, a senha para acessar o projeto de WEB é: <br> <b>" + user.senha + "</b>"
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
        });
    
        return res.json(
            {
                result: "Senha enviada com sucesso para o email",
                success: true,
                stack_trace: ""
            }
        );
    }catch(e){
        return res.json(
            {
                result: "Houve um erro ao tentar conectar ao banco de dados",
                success: false,
                stack_trace: JSON.stringify(e)
            }
        );
    }
});


