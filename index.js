const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const appointmentService = require("./services/AppointmentService");
const AppointmentService = require("./services/AppointmentService");

//  ***settings***

//static
app.use(express.static("public"));

//bodyparser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//ejs - template engine
app.set('view engine', 'ejs');

//connect base mongodb
mongoose.connect(
    "mongodb://localhost:27017/agendamento",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);
mongoose.set('useFindAndModify', false);

app.get('/', (req,res) => {
    res.render('index')
});

app.get("/cadastro", (req,res) => { //exibindo view de criação de consulta
    res.render("create");
})

app.post("/create", async (req,res) => { //salvando dados da consulta

    var status = await appointmentService.Create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time
    );

    if(status){
        res.redirect('/');
    }else{
        res.send('Ocorreu uma falha!');
    }
})

//pegando consultas
app.get('/getcalendar', async (req,res) => {

    var appointments = await appointmentService.GetAll(false);//pegando consultas que não estão finalizadas

    res.json(appointments);
})


//exibição de detalhes de cada evento direcionado a esta com rota com um click
app.get('/event/:id', async (req,res) => {
    var appointment = await AppointmentService.GetById(req.params.id);
    console.log(appointment);
    res.render('event', {appo: appointment});
})

//rota de finalização de consulta
app.post('/finish', async (req,res) => {
    var id = req.body.id;

    var result = await AppointmentService.Finish(id);
    res.redirect("/");
})

app.get("/list" , async (req,res) => {

    //await AppointmentService.Search("453.295.064-38")

    var appos = await AppointmentService.GetAll(true); //irá pegar todas as consultas, inclusive as que ja foram finalizadas
    res.render("list", {appos})
})

//resultado da pesquisa
app.get("/searchresult", async (req,res) => {
    var appos = await AppointmentService.Search(req.query.search);
    res.render("list", {appos});
})

//verificando se a consulta está a 1 hora de acontecer, caso sim, é enviado um e-mail para o cliente avisando.
//verificação a cada 5 minutos

var pollTime = 1000 * 60 * 5 ;

setInterval(async () => {
    
    await AppointmentService.SendNotification();

}, pollTime)



const port = 8080
app.listen(port, () => {
    console.log(`Connect port: ${port}`)
})


