const registers = new Map([
    ["x0", 0],
    ["x1", 1],
    ["x2", 2],
    ["x3", 3],
    ["x4", 4],
    ["x5", 5],
    ["x6", 6],
    ["x7", 7],
    ["x8", 8],
    ["x9", 9],
    ["x10", 10],
    ["x11", 11],
    ["x12", 12],
    ["x13", 13],
    ["x14", 14],
    ["x15", 15],
    ["x16", 16],
    ["x17", 17],
    ["x18", 18],
    ["x19", 19],
    ["x20", 20],
    ["x21", 21],
    ["x22", 22],
    ["x23", 23],
    ["x24", 24],
    ["x25", 25],
    ["x26", 26],
    ["x27", 27],
    ["x28", 28],
    ["x29", 29],
    ["x30", 30],
    ["x31", 31]
]);

export function parseLines(text) {
    const lines = text.split("\n");
    const codeLines = [];

    lines.forEach(line => {
        if (line.trim() !== "") {
            let words = line.trim().split(/\s+/);
            words = words.map(word => word.replace(/,/g, ""));

            codeLines.push(words);
        }
    });

    return codeLines;
}


export function checkInstruction(instruction, index, PC) {
    let error;
        if (instruction[0] == "LW" || instruction[0] == "SW") {
            error = lwswInstruction(instruction, index);
        }
        else if (instruction[0] == "SUB" || instruction[0] == "ADD") {
            error = subaddInstruction(instruction, index);
        }
        else if (instruction[0] == "ADDI") {
            error = addiInstruction(instruction, index);
        }
        else if (instruction[0] == "BEQ" || instruction[0] == "BNE") {
            error = beqbneInstruction(instruction, index, PC);
            
        }
        else if (instruction[0].slice(-1) == ":") {
            error = "";
        }
        else {
            return `Error on Line ${index}:\n "${instruction[0]}" is not a valid instruction \n\n`;
        }

    return error;
}

function lwswInstruction(instruction, index) {
    let errors = "";

    if (instruction.length != 3) {
        errors += `Error on Line ${index}:\n Incorrect number of parameters.`;
    }

    if (!registers.has(instruction[1])) {
        errors += `Error on Line ${index}:\n ${instruction[1]} is not a valid register. \n\n`;
    }

    const param2 = instruction[2].match(/^(-?0x[0-9a-fA-F]+|-?\d+)\((x[0-9]|x1[0-9]|x2[0-9]|x3[01])\)$/);

    if (!param2) {
        errors += `Error on Line ${index}: \n ${instruction[2]} is not a valid parameter. \n\n`;
    }

    let offset;

    if (param2) {
        const offsetStr = param2[1];
        if (offsetStr.startsWith("0x") || offsetStr.startsWith("-0x")) {
            offset = parseInt(offsetStr, 16);
        } else {
            offset = parseInt(offsetStr, 10);
        }

        if (offset < -2048 || offset > 2047) {
            errors += `Error on Line ${index}: \n Offset ${offset} out of range (-2048 to 2047). \n\n`;
        }
    }

    return errors;
}

function subaddInstruction(instruction, index) {
    let errors = "";

    if(instruction.length != 4) {
        errors += `Error on Line ${index}: \n Incorrect number of parameters. \n\n`;
    }
    if(!registers.has(instruction[1])) {
        errors += `Error on Line ${index}: \n Register ${instruction[1]} is not a valid register. \n\n`;
    }
    if(!registers.has(instruction[2])) {
        errors += `Error on Line ${index}: \n Register ${instruction[2]} is not a valid register. \n\n`;
    }
    if(!registers.has(instruction[3])) {
        errors += `Error on Line ${index}: \n Register ${instruction[3]} is not a valid register. \n\n`;
    }

    return errors;
}

function addiInstruction(instruction, index) {
    let errors = "";
    const rd = instruction[1];
    const rs1 = instruction[2];

    if (instruction.length != 4) {
        errors += `Error on Line ${index}: \n Incorrect number of parameters. \n\n`;
    }
    if (!registers.has(rd)) {
        errors += `Error on Line ${index}: \n Register ${rd} is not a valid register. \n\n`;
    }
    if (!registers.has(rs1)) {
       errors += `Error on Line ${index}: \n Register ${rs1} is not a valid register. \n\n`;
    }

    return errors;
}

function beqbneInstruction(instruction, index, PC) {
    let errors = "";
    if (instruction.length != 4) {
        errors += `Error on Line ${index}: \n Incorrect number of parameters. \n\n`;
    }
    if(!registers.has(instruction[1])) {
        errors += `Error on Line ${index}: \n Register ${instruction[1]} is not a valid register. \n\n`;
    }
    if(!registers.has(instruction[2])) {
        errors += `Error on Line ${index}: \n Register ${instruction[2]} is not a valid register. \n\n`;
    }
    let jmp = instruction[3] + ":";
    if(!PC.has(jmp)) {
        errors += `Error on Line ${index}: \n "${instruction[3]}" is not a valid branch \n\n`;
    }
    return errors;
}


export function assembleLine(instruction, PC) {
    const op = instruction[0].toUpperCase();
    let data = {
        instructionName: instruction.join(' '), // e.g., "ADD R1, R2, R3"
        field31_25: '?',
        field24_20: '?',
        field19_15: '?',
        field14_12: '?',
        field11_7: '?',
        field6_0: '?',
        hexcode: '?'
    };
    if (op === 'LW') {
        assembleLWInstruction(data, instruction);
    }

    if (op === "SW") {
        assembleSWInstruction(data, instruction);
    }

    if (op === "ADD" || op === "SUB") {
        assembleRTypeInstruction(data, instruction);
    }

    if (op === "ADDI") {
        assembleADDIInstruction(data, instruction);
    }

    if (op.slice[-1] === ":") {
        return;
    }
	
	if (op === "BEQ" || op === "BNE") {
		assembleBranchInstruction(data, instruction, PC);
	}

    return data;
}

function assembleLWInstruction(data, instruction) {
    const opcode = 0b0000011;
    const funct3 = 0b010;

    const param2 = instruction[2].match(/^(-?0x[0-9a-fA-F]+|-?\d+)\((x[0-9]|x1[0-9]|x2[0-9]|x3[01])\)$/);

    let offset;

    const offsetStr = param2[1];
    if (offsetStr.startsWith("0x") || offsetStr.startsWith("-0x")) {
        offset = parseInt(offsetStr, 16);
    } else {
        offset = parseInt(offsetStr, 10);
    }

    //get binary
    let opcodeBin = opcode.toString(2).padStart(7, "0");
    let rdBin = parseInt(registers.get(instruction[1])).toString(2).padStart(5, "0");
    let funct3Bin = funct3.toString(2).padStart(3, "0");
    let rs1Bin = parseInt(registers.get(param2[2])).toString(2).padStart(5, "0");
    let immBin = (offset & 0xFFF).toString(2).padStart(12, "0");


    let opcode32bit = immBin + rs1Bin + funct3Bin + rdBin + opcodeBin;
    let hexcode = parseInt(opcode32bit, 2).toString(16).padStart(8, "0").toUpperCase();

    data.field31_25 = immBin.slice(0, -5).padStart(7, "0");
    data.field24_20 = immBin.slice(-5).padStart(5, "0");
    data.field19_15 = rs1Bin;
    data.field14_12 = funct3Bin;
    data.field11_7 = rdBin;
    data.field6_0 = opcodeBin;
    data.hexcode = hexcode;
}

function assembleSWInstruction(data, instruction) {
    const opcode = 0b0100011;
    const funct3 = 0b010;

    const param2 = instruction[2].match(/^(-?0x[0-9a-fA-F]+|-?\d+)\((x[0-9]|x1[0-9]|x2[0-9]|x3[01])\)$/);

    let offset;

    const offsetStr = param2[1];
    if (offsetStr.startsWith("0x") || offsetStr.startsWith("-0x")) {
        offset = parseInt(offsetStr, 16);
    } else {
        offset = parseInt(offsetStr, 10);
    }

    let immBin = (offset & 0xFFF).toString(2).padStart(12, "0");

    let opcodeBin = opcode.toString(2).padStart(7, "0");
    let imm40Bin = immBin.slice(-5).padStart(5, "0");
    let funct3Bin = funct3.toString(2).padStart(3, "0");
    let rs1Bin = parseInt(registers.get(param2[2])).toString(2).padStart(5, "0");
    let rs2Bin = parseInt(registers.get(instruction[1])).toString(2).padStart(5, "0");
    let imm115Bin = immBin.slice(0, -5).padStart(7, "0");

    let opcode32bit = imm115Bin + rs2Bin + rs1Bin + funct3Bin + imm40Bin + opcodeBin;
    let hexcode = parseInt(opcode32bit, 2).toString(16).padStart(8, "0").toUpperCase();

    data.field31_25 = imm115Bin;
    data.field24_20 = rs2Bin;
    data.field19_15 = rs1Bin;
    data.field14_12 = funct3Bin;
    data.field11_7 = imm40Bin;
    data.field6_0 = opcodeBin;
    data.hexcode = hexcode;
}

function assembleRTypeInstruction(data, instruction) {
    const op = instruction[0].toUpperCase();
    const opcode = 0b0110011;
    const funct3 = 0b000;     // same for ADD and SUB
    const funct7 = op === "ADD" ? 0b0000000 : 0b0100000;

    const rdBin  = registers.get(instruction[1]).toString(2).padStart(5, "0");
    const rs1Bin = registers.get(instruction[2]).toString(2).padStart(5, "0");
    const rs2Bin = registers.get(instruction[3]).toString(2).padStart(5, "0");
    const funct3Bin = funct3.toString(2).padStart(3, "0");
    const funct7Bin = funct7.toString(2).padStart(7, "0");
    const opcodeBin = opcode.toString(2).padStart(7, "0");

    const opcode32bit = funct7Bin + rs2Bin + rs1Bin + funct3Bin + rdBin + opcodeBin;
    const hexcode = parseInt(opcode32bit, 2).toString(16).padStart(8, "0").toUpperCase();

    data.field31_25 = funct7Bin;
    data.field24_20 = rs2Bin;
    data.field19_15 = rs1Bin;
    data.field14_12 = funct3Bin;
    data.field11_7  = rdBin;
    data.field6_0   = opcodeBin;
    data.hexcode    = hexcode;
}

function assembleADDIInstruction(data, instruction) {
    const opcode = 0b0010011;
    const funct3 = 0b000;

    const rd = instruction[1];
    const rs1 = instruction[2];
	const imm = instruction[3];

    const immBin = (imm & 0xFFF).toString(2).padStart(12, "0");
    const rs1Bin = registers.get(rs1).toString(2).padStart(5, "0");
    const funct3Bin = funct3.toString(2).padStart(3, "0");
    const rdBin = registers.get(rd).toString(2).padStart(5, "0");
    const opcodeBin = opcode.toString(2).padStart(7, "0");

    const opcode32bit = immBin + rs1Bin + funct3Bin + rdBin + opcodeBin;
    const hexcode = parseInt(opcode32bit, 2).toString(16).padStart(8, "0").toUpperCase();

    data.field31_25 = immBin.slice(0, 7);
    data.field24_20 = immBin.slice(7, 12);
    data.field19_15 = rs1Bin;
    data.field14_12 = funct3Bin;
    data.field11_7  = rdBin;
    data.field6_0   = opcodeBin;
    data.hexcode    = hexcode;
}

function assembleBranchInstruction(data, instruction, PC) {
    const opcode = 0b1100011;
	let funct3;
	
	if (instruction[0] === "BEQ")
		funct3 = 0b000;
	if (instruction[0] === "BNE")
		funct3 = 0b001;

	let jmp = instruction[3] + ":";
	let toPC = PC.get(jmp);
	let fromPC = PC.get(instruction[0] + "," + instruction[1] + "," + instruction[2] + "," + instruction[3]);
	toPC = parseInt(toPC, 16);
	fromPC = parseInt(fromPC, 16);
	const intOffset = toPC - fromPC;		//get offset
	const imm = intOffset >> 1;				//shift
	const mask = (1 << 13) - 1;				//13 bit binary template
    const unsignedValue = imm & mask;		//use template on imm
    const immString = unsignedValue.toString(2).padStart(13, '0');

    //get binary
    let opcodeBin = opcode.toString(2).padStart(7, "0");
    let rs1Bin = parseInt(registers.get(instruction[1])).toString(2).padStart(5, "0");
    let funct3Bin = funct3.toString(2).padStart(3, "0");
    let rs2Bin = parseInt(registers.get(instruction[2])).toString(2).padStart(5, "0");
    let immBin = immString;

	

    let opcode32bit = immBin.slice(0,1) + immBin.slice(2,8) + rs2Bin + rs1Bin + 
		funct3Bin + immBin.slice(8) + immBin.slice(1,2) + opcodeBin;
    let hexcode = parseInt(opcode32bit, 2).toString(16).padStart(8, "0").toUpperCase();

    data.field31_25 = immBin.slice(0,1) + immBin.slice(2,8);
    data.field24_20 = rs2Bin;
    data.field19_15 = rs1Bin;
    data.field14_12 = funct3Bin;
    data.field11_7 = immBin.slice(8,12) + immBin.slice(1,2);
    data.field6_0 = opcodeBin;
    data.hexcode = hexcode;
}

