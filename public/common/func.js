import { parseLines, checkInstruction, assembleLine } from "./helper.js";


//assemble
document.addEventListener('DOMContentLoaded', () => {
	const assembleButton = document.getElementById("assemble");
	const text = document.getElementById("editorText");
	const errorsText = document.getElementById("errorsText");

	assembleButton.addEventListener("click", function () {

		const opcodeTableBody = document.getElementById("opcode-body");
		const templateElement = document.getElementById("opcode-row-template");

		if (!opcodeTableBody || !templateElement) {
			console.error("CRITICAL: Could not find table body or template element!");
			alert("Error: Table elements not found.");
			return;
		}

		const templateSource = templateElement.textContent;

		if (!templateSource || templateSource.trim() === "") {
			console.error("CRITICAL: Template source is still blank!");
			alert("Error: Template is blank.");
			return;
		}

		// --- Compile the template *just in time* ---
		const template = Handlebars.compile(templateSource);

		// --- Your original logic ---
		let errors = "";
		errorsText.value = "";
		opcodeTableBody.innerHTML = ""; // Clear table

		let codeLines = parseLines(text.value);

		codeLines.forEach((instruction, index) => {
			errors += checkInstruction(instruction, index + 1);
		});

		if (errors != "") {
			errorsText.value = errors;
			alert("Errors Found.");
		} else {
			alert("Assembling Successful.");

			const assembledInstructions = codeLines.map(line => assembleLine(line));

			const context = {
				assembledInstructions: assembledInstructions
			};

			const renderedHtml = template(context);
			opcodeTableBody.innerHTML = renderedHtml;
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
