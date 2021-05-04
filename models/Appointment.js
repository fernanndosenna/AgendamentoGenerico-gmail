const mongoose = require('mongoose');

//criação do model
const appointment = new mongoose.Schema({
    name: String,
    email: String,
    description: String,
    cpf: String,
    date: Date,
    time:String,
    finished: Boolean, //se consulta foi finalizada ou não
    notified: Boolean // se consulta foi notificada ou não, caso falso, significa que não foi enviado o email ainda para o cliente

})


module.exports = appointment