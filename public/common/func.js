import { parseLines, checkInstruction, assembleLine } from "./helper.js";

//assemble
let PC = new Map ([

		]);

document.addEventListener('DOMContentLoaded', () => {
	

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

					const assembledInstructions = instructions.map(line => assembleLine(line));

					const context = {
						assembledInstructions: assembledInstructions
					};

					const renderedHtml = template(context);
					opcodeTableBody.innerHTML = renderedHtml;
				}
			}
		}
	});




	document.getElementById("editor").style.display = "flex";
	document.getElementById("opcodes").style.display = "none";
	document.getElementById("errors").style.display = "none";
	document.getElementById("pipelines").style.display = "none";
	document.getElementById("risc-v registers").style.display = "none";
	document.getElementById("registers").style.display = "flex";
	document.getElementById("memory").style.display = "none";

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
		document.getElementById("registers").style.display = "flex";
		document.getElementById("memory").style.display = "none";
	};

	document.getElementById("memory button").onclick = function () {
		document.getElementById("registers").style.display = "none";
		document.getElementById("memory").style.display = "flex";
	};
});
