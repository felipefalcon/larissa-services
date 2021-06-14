//  -----------------------------------------------------------------------------------------------------------------------
//	CONFIGURAÇÃO DO SERVIDOR NODE E EXPRESS
//	-----------------------------------------------------------------------------------------------------------------------
var express = require('express');
var compression = require('compression');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(compression());
app.use(express.static(__dirname + '/public'));
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

//	------------------------------------------------------------------------------------------------------------------------
//	ROTAS [PRODUTOS VITRINE]
//	------------------------------------------------------------------------------------------------------------------------
//  [ GET ] ROTA: retorna todos os produtos
app.get('/vitrine', urlencodedParser, async (req, res) => {
    try{
        const db = await dbClient();
        await db.connect();
        let result = await db.query("SELECT * FROM produto");
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

//	------------------------------------------------------------------------------------------------------------------------
//	ROTAS [GENERO DO PERFUME]
//	------------------------------------------------------------------------------------------------------------------------
//  [ GET ] ROTA: retorna um perfume pelo genero cadastrado no banco.
app.get('/generoperfume', urlencodedParser, async (req, res) => {
    try{
        const db = await dbClient();
        await db.connect();
        let result = await db.query("select * from produto where UPPER(categoria) = UPPER($1);", [req.query.categoria]);
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

//	------------------------------------------------------------------------------------------------------------------------
//	ROTAS [BUSCA PELO BOTÃO]
//	------------------------------------------------------------------------------------------------------------------------
//  [ GET ] ROTA: BUSCA PELO BOTÃO DA LUPA.
app.get('/buscaresultado', urlencodedParser, async (req, res) => {
    try{
        const db = await dbClient();
        await db.connect();
        let result = await db.query("select * from produto where titulo ilike $1;", ["%" + req.query.busca + "%"]);
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

//	------------------------------------------------------------------------------------------------------------------------
//	ROTAS [CADASTRAR]
//	------------------------------------------------------------------------------------------------------------------------
//  [ GET ] ROTA: cadastra usuário no banco
app.get('/cadastro', urlencodedParser, async (req, res) => {
    try{
        const db = await dbClient();
        await db.connect();
        await db.query("insert into cliente (nome, email, senha, documento, telefone) values ($1, $2, $3, $4, $5);", [req.query.nome, req.query.email, req.query.senha, req.query.documento, req.query.telefone]);
        return res.json(
            {
                result: "Cadastrado com sucesso",
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

//	------------------------------------------------------------------------------------------------------------------------
//	ROTAS [DETALHES DO PRODUTO]
//	------------------------------------------------------------------------------------------------------------------------
//  [ GET ] ROTA: retorna um perfume pelo genero cadastrado no banco.
app.get('/detalheproduto', urlencodedParser, async (req, res) => {
    try{
        const db = await dbClient();
        await db.connect();
        let result = await db.query("select * from produto where codigo = $1;", [req.query.codigo]);
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

//	------------------------------------------------------------------------------------------------------------------------
//	ROTAS [INSERIR NO CARRINHO]
//	------------------------------------------------------------------------------------------------------------------------
//  [ GET ] ROTA: insere item no carrinho e ja calcula o valor total
app.get('/inserecarrinho', urlencodedParser, async (req, res) => {
    try{
        const db = await dbClient();
        await db.connect();
        let result = await db.query("select valor from produto where codigo = $1;", [req.query.codproduto]);
        let multiplicacao = result.rows[0].valor*req.query.quantidade;
        await db.query("insert into cesta (sessionid, codigoproduto, quantidade, valorunitario, valortotal) values ($1, $2, $3, (select valor from produto where codigo = $2), $4);", [req.query.sessionid, req.query.codproduto, req.query.quantidade, multiplicacao]);
        //await db.query("insert into cesta (sessionid, codigoproduto, quantidade, valorunitario, valortotal) select $1, codigo, $3, valor , valor*$3 from produto where codigo = $2;", [req.query.sessionid, req.query.codproduto, req.query.quantidade]);
        return res.json(
            {
                result: "Adicionado no carrinho com sucesso",
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

//	------------------------------------------------------------------------------------------------------------------------
//	ROTAS [CARRINHO FINAL]
//	------------------------------------------------------------------------------------------------------------------------
//  [ GET ] ROTA: retorna um perfume pelo genero cadastrado no banco.
app.get('/carrinhofinal', urlencodedParser, async (req, res) => {
    try{
        const db = await dbClient();
        await db.connect();
        let result = await db.query(`select codigoproduto, valorunitario, titulo, sum(quantidade) as qtd_total, sum(valortotal) as sum_total from cesta 
        inner join produto on cesta.codigoproduto = produto.codigo 
        where sessionid = $1
        group by codigoproduto, valorunitario, titulo;`, [req.query.usuario]);
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

//	------------------------------------------------------------------------------------------------------------------------
//	ROTAS [LIMPAR CESTA]
//	------------------------------------------------------------------------------------------------------------------------
//  [ GET ] ROTA: cadastra usuário no banco
app.get('/limparcesta', urlencodedParser, async (req, res) => {
    try{
        const db = await dbClient();
        await db.connect();
        await db.query("delete from cesta where sessionid = $1;", [req.query.sessionid]);
        return res.json(
            {
                result: "Carrinho esvaziado",
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
    try{
        const db = await dbClient();
        await db.connect();
        let result = await db.query("SELECT * FROM cliente WHERE email = $1;", [req.query.email]);
        let user = result.rows[0];
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
            to: user.email, // list of receivers
            subject: 'Recuperação de Senha', // Subject line
            html: "Você solicitou a recuperação da sua senha no Projeto WEB <br> Sua senha é: " + user.senha
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
        });
        return res.json(
            {
                result: "A Senha será enviada para o email informado",
                success: true,
                stack_trace: ""
            }
        );
    }catch(e){
        return res.json(
            {
                result: "Houve um erro ao tentar conectar ao banco de dados ou enviar o email",
                success: false,
                stack_trace: JSON.stringify(e)
            }
        );
    }
});


