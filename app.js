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

const registers = new Map([
	["x1", "00000000"],
	["x2", "00000000"],
	["x3", "00000000"],
	["x4", "00000000"],
	["x5", "00000000"],
	["x6", "00000000"],
	["x7", "00000000"],
	["x8", "00000000"],
	["x9", "00000000"],
	["x10", "00000000"],
	["x11", "00000000"],
	["x12", "00000000"],
	["x13", "00000000"],
	["x14", "00000000"],
	["x15", "00000000"],
	["x16", "00000000"],
	["x17", "00000000"],
	["x18", "00000000"],
	["x19", "00000000"],
	["x20", "00000000"],
	["x21", "00000000"],
	["x22", "00000000"],
	["x23", "00000000"],
	["x24", "00000000"],
	["x25", "00000000"],
	["x26", "00000000"],
	["x27", "00000000"],
	["x28", "00000000"],
	["x29", "00000000"],
	["x30", "00000000"],
	["x31", "00000000"]
]);

let memoryData = new Array(128);
let memory = new Array(256);

server.get('/', function (req, resp) {
	for (let i = 0; i < 128; i += 4) {
		memoryData[i] = i.toString(16).padStart(4, '0');
	}
	for (let i = 0; i < 256; i++) {
		memory[i] = i.toString(16).padStart(4, '0');
	}
	resp.render('main', {
		layout: 'index',
		title: 'CEPARCO RISC-V',
		memoryData: memoryData,
		memory: memory,
		registers: registers
	});
});


const port = process.env.PORT || 3000;
server.listen(port, function () {
	console.log('Listening at port ' + port);
});
