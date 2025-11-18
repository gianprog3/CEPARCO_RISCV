import { parseLines, checkInstruction, assembleLine } from "./helper.js";

//assemble
let PC = new Map ([

		]);

let registers = new Map ([
	["x0", 0x00000000],
    ["x1", 0x00000000],
    ["x2", 0x00000000],
    ["x3", 0x00000000],
    ["x4", 0x00000000],
    ["x5", 0x00000000],
    ["x6", 0x00000000],
    ["x7", 0x00000000],
    ["x8", 0x00000000],
    ["x9", 0x00000000],
    ["x10", 0x00000000],
    ["x11", 0x00000000],
    ["x12", 0x00000000],
    ["x13", 0x00000000],
    ["x14", 0x00000000],
    ["x15", 0x00000000],
    ["x16", 0x00000000],
    ["x17", 0x00000000],
    ["x18", 0x00000000],
    ["x19", 0x00000000],
    ["x20", 0x00000000],
    ["x21", 0x00000000],
    ["x22", 0x00000000],
    ["x23", 0x00000000],
    ["x24", 0x00000000],
    ["x25", 0x00000000],
    ["x26", 0x00000000],
    ["x27", 0x00000000],
    ["x28", 0x00000000],
    ["x29", 0x00000000],
    ["x30", 0x00000000],
    ["x31", 0x00000000]
]);

//memory which has 256 spaces i.e. until 00FF
//0000 - 007F data, 0080 - 00FF program
let memory = new Array(256); 

document.addEventListener('DOMContentLoaded', () => {
	//default display
	document.getElementById("editor").style.display = "flex";
	document.getElementById("opcodes").style.display = "none";
	document.getElementById("errors").style.display = "none";
	document.getElementById("pipelines").style.display = "none";
	document.getElementById("risc-v registers").style.display = "none";
	document.getElementById("registers").style.display = "flex";
	document.getElementById("memory").style.display = "none";
	document.getElementById("set memory button").style.display = "none";

	const assembleButton = document.getElementById("assemble");
	const text = document.getElementById("editorText");
	const errorsText = document.getElementById("errorsText");

	assembleButton.addEventListener("click", function () {
		
		PC = new Map([]);
		let programCounter = 0x00000000;

		const opcodeTableBody = document.getElementById("opcode-body");
		const templateElement = document.getElementById("opcode-row-template");

		const templateSource = templateElement.textContent;

		const template = Handlebars.compile(templateSource);

		for(let i = 0; i < 2; i++) {
			let errors = "";
			errorsText.value = "";
			opcodeTableBody.innerHTML = "";

			let codeLines = parseLines(text.value);
			if (i == 0) {
				for(let j = 0; j < codeLines.length; j++) {
					PC.set(codeLines[j].toString(), programCounter);
					programCounter += 4;
				}
			}
			else {
				let instructions = [];

				codeLines.forEach((instruction) => {
					if (!instruction.toString().endsWith(":")) {
						instructions.push(instruction);
						}
				 });

				instructions.forEach((instruction, index) => {
					errors += checkInstruction(instruction, index + 1, PC);
				});

				if (errors != "") {
					errorsText.value = errors;
					alert("Errors Found.");
				} else {
					alert("Assembling Successful.");

					const assembledInstructions = instructions.map(line => assembleLine(line, PC));
					
					const registersArray = Array.from(registers);
					
					const context = {
						assembledInstructions: assembledInstructions,
						registers: registersArray
					};

					const renderedHtml = template(context);
					opcodeTableBody.innerHTML = renderedHtml;
				}
			}
		}
	});
	
	document.getElementById("set registers button").onclick = function () {
	
		const regs = document.getElementsByClassName("textbox-register");
		for (let i=0; i<regs.length; i++) {	
			const value = parseInt(regs[i].value, 16) || 0; // hex radix, 0 if invalid
			registers.set(regs[i].id, value);
		}
		alert("Registers set.");
	};

	document.getElementById("set memory button").onclick = function () {
		const memory = document.getElementsByClassName("textbox-memory");
		for (let i=0; i<memory.length; i++) {	
			const value = parseInt(regs[i].value, 16) || 0;
			memory[i] = value;
		}
		alert("Memory set.");
	};

	document.getElementById("editor button").onclick = function () {
		document.getElementById("editor").style.display = "flex";
		document.getElementById("opcodes").style.display = "none";
		document.getElementById("errors").style.display = "none";
		document.getElementById("pipelines").style.display = "none";
		document.getElementById("risc-v registers").style.display = "none";
	};

	document.getElementById("opcodes button").onclick = function () {
		document.getElementById("editor").style.display = "none";
		document.getElementById("opcodes").style.display = "inline";
		document.getElementById("errors").style.display = "none";
		document.getElementById("pipelines").style.display = "none";
		document.getElementById("risc-v registers").style.display = "none";
	};

	document.getElementById("errors button").onclick = function () {
		document.getElementById("editor").style.display = "none";
		document.getElementById("opcodes").style.display = "none";
		document.getElementById("errors").style.display = "flex";
		document.getElementById("pipelines").style.display = "none";
		document.getElementById("risc-v registers").style.display = "none";
	};

	document.getElementById("pipelines button").onclick = function () {
		document.getElementById("editor").style.display = "none";
		document.getElementById("opcodes").style.display = "none";
		document.getElementById("errors").style.display = "none";
		document.getElementById("pipelines").style.display = "inline";
		document.getElementById("risc-v registers").style.display = "none";
	};

	document.getElementById("risc-v registers button").onclick = function () {
		document.getElementById("editor").style.display = "none";
		document.getElementById("opcodes").style.display = "none";
		document.getElementById("errors").style.display = "none";
		document.getElementById("pipelines").style.display = "none";
		document.getElementById("risc-v registers").style.display = "inline";
	};

	document.getElementById("registers button").onclick = function () {
		document.getElementById("set memory button").style.display = "none";
		document.getElementById("set registers button").style.display = "inline";
		document.getElementById("registers").style.display = "flex";
		document.getElementById("memory").style.display = "none";
	};

	document.getElementById("memory button").onclick = function () {
		document.getElementById("set registers button").style.display = "none";
		document.getElementById("set memory button").style.display = "inline";
		document.getElementById("registers").style.display = "none";
		document.getElementById("memory").style.display = "flex";
	};
});
