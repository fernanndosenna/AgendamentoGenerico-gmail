var appointment = require('../models/Appointment');
var mongoose = require("mongoose");
var AppointmentFactory = require("../factories/AppointmentFactory");
var mailer = require("nodemailer");
//model de consulta
const Appo = mongoose.model("Appointment", appointment);

class AppointmentService {

    //criação da consulta
    async Create(name, email, description, cpf, date, time){

        var newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false, //assim que criar uma consulta, finalizada setando falso.
            notified: false //assim que uma consulta é criada, obviamente não foi notificada
        });

        try {        
            await newAppo.save();
            return true;
        } catch (err) {
            console.log(err)
            return false;
        }
    }

    async GetAll(showFinished){
        if(showFinished){ //se parametro for passado como verdadeiro, irá mostrar todas as consultas, finalizadas ou nao
            return await Appo.find();
        }else{
            var appos = await Appo.find({'finished': false});//capturando consultas, menos as que já foram finalizadas
            var appointments = [];

            appos.forEach(appointment => { //e será adicionado ao array uma consulta complexa já processada na factory
                
                if(appointment.date != undefined){ //isso irá permiter que data nula ou inválida não seja processada.
                    appointments.push(AppointmentFactory.Build(appointment))
                }
                
            })

            return appointments;
        }
    }

    //capturando um evento pelo id
    async GetById(id){
        try{
            var event = await Appo.findOne({'_id' : id});
            return event;
        }catch(err){
            console.log(err)
        }
    }

    //finalizar uma consulta
    async Finish(id){
        try{
            await Appo.findByIdAndUpdate(id, { finished: true});
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    //pesquisando por cpf ou email
    async Search(query){
        try{
            var appos = await Appo.find().or([{email: query}, {cpf: query}]);
            return appos;
        }catch(err){
            console.log(err);
            return [];
        }
    }

    //envio de notificação
    async SendNotification(){
        var appos  = await this.GetAll(false); //pegando consultas que nao foram finalizadas

        var transporter = mailer.createTransport({ //configuraçoes do mail trap
            host: "smtp.mailtrap.io",
            port: 25, //porta padrao do mail trap
            auth: { // configuraçoes do mail trap
                user: "1c6ba0e7182dad",
                pass: "7fd7f524f2bdaf"
            }

        })

        //calculo de datas
        appos.forEach(async app => {
            var date = app.start.getTime() //hora inicial da consulta, pegando hora inicial no formato de milisegundos
            var hour = 1000 * 60 * 60;
            var gap = date - Date.now() //lacuna, data do consulta menos a data atual, o retorno será; se falta 1 hora ou 10 minutos e etcc
            
            if(gap <= hour){ // se faltar menos de 1 hora ou uma 1 hr para consulta ocorrer

              //envio do e-mail
              if(!app.notified){ // se consulta ainda não foi notificada

                await Appo.findByIdAndUpdate(app.id, {notified: true});

                transporter.sendMail({
                    from: "Antonio Sena <victor@guia.com.br>",
                    to: app.email, // enviar para o email da consulta
                    subject: "Sua consulta irá acontecer embreve!",
                    text:"Conteúdo qualquer!!! sua consulta irá acontecer em 1 hora"
                }).then(() => {

                }).catch(err => {

                })

              }
            }
        })
    }
}

module.exports = new AppointmentService();