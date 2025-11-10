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


export function checkInstruction(instruction, index) {
    let error;
    switch (instruction[0]) {
        case "LW":
            error = lwInstruction(instruction, index);
            break;

        case "SW":
            error = swInstruction(instruction, index);
            break;

        case "SUB":
            if (instruction[1] === "ADD") {
                error = subAddInstruction(instruction, index);
                break;
            }
            else
                return `Error on Line ${index}:\n "${instruction[0]}" is not a valid instruction \n\n`;

        case "ADDI":
            error = addiInstruction(instruction, index);
            break;

        case "BEQ":
            error = beqInstruction(instruction, index);
            break;

        case "BNE":
            error = bneInstruction(instruction, index);
            break;

        default:
            return `Error on Line ${index}:\n "${instruction[0]}" is not a valid instruction \n\n`;
    }

    return error;
}


function lwInstruction(instruction, index) {
    let errors = "";

    if (instruction.length != 3) {
        errors += `Error on Line ${index}:\n Not enough parameters.`;
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

function swInstruction(instruction, index) {
    let errors = "";

    if (instruction.length != 3) {
        errors += `Error on Line ${index}:\n Not enough parameters. \n\n`;
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


export function assembleLine(instruction) {
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