const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs'
}));

server.use(express.static('public'));

const registers = [
    {"register":"x0","data":"00000000"},
	{"register":"x1","data":"00000000"},
	{"register":"x2","data":"00000000"},
	{"register":"x3","data":"00000000"},
	{"register":"x4","data":"00000000"},
	{"register":"x5","data":"00000000"},
	{"register":"x6","data":"00000000"},
	{"register":"x7","data":"00000000"},
	{"register":"x8","data":"00000000"},
	{"register":"x9","data":"00000000"},
    {"register":"x10","data":"00000000"},
	{"register":"x11","data":"00000000"},
	{"register":"x12","data":"00000000"},
	{"register":"x13","data":"00000000"},
	{"register":"x14","data":"00000000"},
	{"register":"x15","data":"00000000"},
	{"register":"x16","data":"00000000"},
	{"register":"x17","data":"00000000"},
	{"register":"x18","data":"00000000"},
	{"register":"x19","data":"00000000"},
    {"register":"x20","data":"00000000"},
	{"register":"x21","data":"00000000"},
	{"register":"x22","data":"00000000"},
	{"register":"x23","data":"00000000"},
	{"register":"x24","data":"00000000"},
	{"register":"x25","data":"00000000"},
	{"register":"x26","data":"00000000"},
	{"register":"x27","data":"00000000"},
	{"register":"x28","data":"00000000"},
	{"register":"x29","data":"00000000"},
    {"register":"x30","data":"00000000"},
	{"register":"x31","data":"00000000"},
	{"register":"x32","data":"00000000"}
];
server.get('/', function(req, resp){
    resp.render('main',{
        layout: 'index',
        title: 'CEPARCO RISC-V',
		registers: registers
    });
});


const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
