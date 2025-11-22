import { parseLines, checkInstruction, assembleLine } from "./helper.js";
import { readWord, writeWord, getImm, writesRd } from "./helper.js";
import { IF, ID, EX, MEM, WB, NOP } from "./stages.js";

let cycle = 0;
let pipelineMap = new Map();
let pipelineRegisterMap = new Map();

let currentPC = 0x00000080;
let addressToInstr = new Map();
let maxPC = 0x00000080;

//assemble
let PC = new Map([]);

let programCounter;

let registers = new Map([
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
memory.fill(0);

document.addEventListener('DOMContentLoaded', () => {
    //default display
    document.getElementById("editor").style.display = "flex";
    document.getElementById("opcodes").style.display = "none";
    document.getElementById("errors").style.display = "none";
    document.getElementById("pipelines").style.display = "none";
    document.getElementById("risc-v registers").style.display = "none";
    document.getElementById("registers").style.display = "flex";
    document.getElementById("memory").style.display = "none";
    document.getElementById("view-memory").style.display = "none";
    document.getElementById("set memory button").style.display = "none";
    document.getElementById("goto button").style.display = "none";
    document.getElementById("searchMemory").style.display = "none";

    const assembleButton = document.getElementById("assemble");
    const text = document.getElementById("editorText");
    const errorsText = document.getElementById("errorsText");

    assembleButton.addEventListener("click", function () {

        PC = new Map([]);
        programCounter = 0x00000080;

        const opcodeTableBody = document.getElementById("opcode-body");
        const templateElement = document.getElementById("opcode-row-template");

        const templateSource = templateElement.textContent;

        const template = Handlebars.compile(templateSource);

        for (let i = 0; i < 2; i++) {
            let errors = "";
            errorsText.value = "";
            opcodeTableBody.innerHTML = "";

            let codeLines = parseLines(text.value);
            if (i == 0) {
                for (let j = 0; j < codeLines.length; j++) {
                    PC.set(codeLines[j].join(' '), programCounter);

                    if (!codeLines[j][0].endsWith(":")) {
                        programCounter += 4;
                    }
                }
                maxPC = programCounter;
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

                    assembledInstructions.forEach((instruction) => {
                        const addr = PC.get(instruction.instructionName);
                        addressToInstr.set(addr, instruction.instructionName);
                    });

                    assembledInstructions.forEach(instruction => {
                        let opcode = instruction.field31_25 + instruction.field24_20 + instruction.field19_15 + instruction.field14_12 + instruction.field11_7 + instruction.field6_0;
                        opcode = Number(BigInt('0b' + opcode));
                        const startAddress = parseInt(PC.get(instruction.instructionName), 10);
                        memory[startAddress] = (opcode & 0xFF);
                        memory[startAddress + 1] = (opcode >>> 8) & 0xFF;
                        memory[startAddress + 2] = (opcode >>> 16) & 0xFF;
                        memory[startAddress + 3] = (opcode >>> 24) & 0xFF;
                    });
                    const registersArray = Array.from(registers);

                    const context = {
                        assembledInstructions: assembledInstructions,
                        registers: registersArray
                    };

                    const renderedHtml = template(context);
                    opcodeTableBody.innerHTML = renderedHtml;

                    resetPipeline();
                }
            }
        }
    });

    const runStepButton = document.getElementById("run step");
    runStepButton.addEventListener("click", runStep);

    const runAllButton = document.getElementById("run all");
    runAllButton.addEventListener("click", runAll);

    const stopButton = document.getElementById("stop");
    stopButton.addEventListener("click", stopRunning);

    let isRunning = false;

    function stopRunning() {
        isRunning = false;
    }

    function runAll() {
        isRunning = true;
        function loop() {
            if (!isRunning) return;
            runStep();
            if (IF.IR === NOP && ID.IR === NOP && EX.IR === NOP && MEM.IR === NOP && currentPC >= maxPC) {
                isRunning = false;
                return;
            }
            setTimeout(loop, 0); // To avoid blocking the browser
        }
        loop();
    }

    //Initialize pipeline registers
    function resetPipeline() {
        cycle = 0;
        pipelineMap.clear();

        pipelineRegisterMap.clear();
        pipelineRegisterMap.set("IF/ID.IR", []);
        pipelineRegisterMap.set("IF/ID.NPC", []);
        pipelineRegisterMap.set("IF/ID.PC", []);
        pipelineRegisterMap.set(" ", []);
        pipelineRegisterMap.set("ID/EX.A", []);
        pipelineRegisterMap.set("ID/EX.B", []);
        pipelineRegisterMap.set("ID/EX.IMM", []);
        pipelineRegisterMap.set("ID/EX.IR", []);
        pipelineRegisterMap.set("ID/EX.NPC", []);
        pipelineRegisterMap.set("  ", []);
        pipelineRegisterMap.set("EX/MEM.ALUOUTPUT", []);
        pipelineRegisterMap.set("EX/MEM.IR", []);
        pipelineRegisterMap.set("EX/MEM.B", []);
        pipelineRegisterMap.set("EX/MEM.COND", []);
        pipelineRegisterMap.set("   ", []);
        pipelineRegisterMap.set("MEM/WB.LMD", []);
        pipelineRegisterMap.set("MEM/WB.IR", []);
        pipelineRegisterMap.set("MEM/WB.ALUOUTPUT", []);
        pipelineRegisterMap.set("MEM[EX/MEM.ALUOUTPUT]", []);
        pipelineRegisterMap.set("    ", []);
        pipelineRegisterMap.set("REGS[MEM/WB.IR[rd]]", []);

        currentPC = 0x00000080;
        IF.IR = NOP;
        IF.NPC = 0x00000000;
        IF.PC = 0x00000000;
        ID.A = 0x00000000;
        ID.B = 0x00000000;
        ID.IMM = 0x00000000;
        ID.IR = NOP;
        ID.NPC = 0x00000000;
        ID.PC = 0x00000000;
        EX.ALUOUTPUT = 0x00000000;
        EX.IR = NOP;
        EX.B = 0x00000000;
        EX.COND = 0;
        EX.PC = 0x00000000;
        MEM.LMD = 0x00000000;
        MEM.IR = NOP;
        MEM.ALUOUTPUT = 0x00000000;
        MEM.MEMALUOUTPUT = 0x00000000;
        MEM.PC = 0x00000000;
        WB.Rn = 0x00000000;
        WB.PC = 0x00000000;
        updatePipelineMap();
        updateRiscVRegisters();
        updateRegistersTable();
        updateMemoryTable();
        updateViewMemoryTable();
    }

    let thisIsABranchFlag = 0;  // flags if branching will occur
    let branchTarget = 0x00000000; // branch destination

    function runStep() {

        if (thisIsABranchFlag > 0) {
            thisIsABranchFlag--;
        }
        // WB stage
        const memOpcode = MEM.IR & 0x7F;
        let memRd = (MEM.IR >> 7) & 0x1F;
        WB.Rn = (memOpcode === 0b0000011) ? MEM.LMD : MEM.ALUOUTPUT;
        WB.PC = MEM.PC;
        if (writesRd(MEM.IR) && memRd !== 0) {
            registers.set(`x${memRd}`, WB.Rn);
        }

        // Detect stall for the instruction in ID
        let stall = false;
        const idOpcode = ID.IR & 0x7F;
        const idRs1 = (ID.IR >> 15) & 0x1F;
        const idRs2 = (ID.IR >> 20) & 0x1F;
        let usesRs1 = false;
        let usesRs2 = false;
        if (idOpcode === 0b0110011 || idOpcode === 0b1100011) { // ADD/SUB, BEQ/BNE
            usesRs1 = true;
            usesRs2 = true;
        } else if (idOpcode === 0b0010011 || idOpcode === 0b0000011) { // ADDI, LW
            usesRs1 = true;
            usesRs2 = false;
        } else if (idOpcode === 0b0100011) { // SW
            usesRs1 = true;
            usesRs2 = true;
        }
        const exRd = (EX.IR >> 7) & 0x1F;
        memRd = (MEM.IR >> 7) & 0x1F;
        if (writesRd(EX.IR) && exRd !== 0 && ((usesRs1 && idRs1 === exRd) || (usesRs2 && idRs2 === exRd))) {
            stall = true;
        }
        if (writesRd(MEM.IR) && memRd !== 0 && ((usesRs1 && idRs1 === memRd) || (usesRs2 && idRs2 === memRd))) {
            stall = true;
        }

        if (thisIsABranchFlag === 0 && branchTarget !== 0) {
            if (currentPC < branchTarget) {
                currentPC = branchTarget;
            }
            if (IF.NPC < branchTarget) {
                IF.IR = NOP;
                IF.PC = 0;
                IF.NPC = 0;
            }
            if (ID.NPC <= branchTarget) {
                ID.IR = NOP;
                ID.PC = 0;
                ID.NPC = 0;
                ID.A = 0;
                ID.B = 0;
                ID.IMM = 0;
            }
            if (EX.PC - 4 <= branchTarget) {
                EX.IR = NOP;
                EX.PC = 0;
                EX.ALUOUTPUT = 0;
                EX.B = 0;
                EX.COND = 0;
            }
            branchTarget = 0;
        }

        // MEM stage
        const exOpcode = EX.IR & 0x7F;
        let newMEM = {
            IR: EX.IR,
            ALUOUTPUT: EX.ALUOUTPUT,
            LMD: 0x00000000,
            MEMALUOUTPUT: readWord(EX.ALUOUTPUT, memory),
            PC: EX.PC
        };
        if (exOpcode === 0b0000011) { // LW
            newMEM.LMD = newMEM.MEMALUOUTPUT;
        } else if (exOpcode === 0b0100011) { // SW
            writeWord(EX.ALUOUTPUT, EX.B, memory);
        }
        Object.assign(MEM, newMEM);

        // EX stage
        let newEX = {
            ALUOUTPUT: 0x00000000,
            IR: NOP,
            B: 0x00000000,
            COND: 0,
            PC: 0x00000000
        };
        let branchTaken = false;
        let target = 0x00000000;
        if (!stall) {
            const funct3 = (ID.IR >> 12) & 0x7;
            const funct7 = ID.IR >> 25;
            let aluOut = 0;
            let cond = 0;
            switch (idOpcode) {
                case 0b0110011: // R-type ADD/SUB
                    if (funct3 === 0) {
                        if (funct7 === 0) {
                            aluOut = ID.A + ID.B;
                        } else if (funct7 === 0b0100000) {
                            aluOut = ID.A - ID.B;
                        }
                    }
                    break;
                case 0b0010011: // ADDI
                    if (funct3 === 0) {
                        aluOut = ID.A + ID.IMM;
                    }
                    break;
                case 0b0000011: // LW
                case 0b0100011: // SW
                    aluOut = ID.A + ID.IMM;
                    break;
                case 0b1100011: // BEQ/BNE
                    if (funct3 === 0) { // BEQ
                        cond = (ID.A === ID.B) ? 1 : 0;
                    } else if (funct3 === 1) { // BNE
                        cond = (ID.A !== ID.B) ? 1 : 0;
                    }
                    if (cond === 1 && thisIsABranchFlag === 0) {
                        thisIsABranchFlag = 2;
                        branchTarget = ID.NPC + ID.IMM;
                    }
                    //target = ID.NPC - 4 + ID.IMM;
                    branchTaken = cond === 1;
                    break;
            }
            newEX.ALUOUTPUT = aluOut;
            newEX.IR = ID.IR;
            newEX.B = ID.B;
            newEX.COND = cond;
            newEX.PC = ID.PC;
        }
        Object.assign(EX, newEX);

        // ID stage
        let newID = { A: 0x00000000, B: 0x00000000, IMM: 0x00000000, IR: NOP, NPC: 0x00000000, PC: 0x00000000 };
        if (!stall) {
            const ifIR = IF.IR;
            const ifOpcode = ifIR & 0x7F;
            const rs1 = (ifIR >> 15) & 0x1F;
            const rs2 = (ifIR >> 20) & 0x1F;
            let type = '';
            if (ifOpcode === 0b0010011 || ifOpcode === 0b0000011) type = 'I';
            if (ifOpcode === 0b0100011) type = 'S';
            if (ifOpcode === 0b1100011) type = 'B';
            const imm = getImm(ifIR, type);
            newID.A = registers.get(`x${rs1}`) || 0;
            newID.B = registers.get(`x${rs2}`) || 0;
            newID.IMM = imm;
            newID.IR = ifIR;
            newID.NPC = IF.NPC;
            newID.PC = IF.PC;
        } else {
            newID = { ...ID };
        }
        Object.assign(ID, newID);

        // IF stage
        let newIF = { IR: NOP, NPC: 0x00000000, PC: 0x00000000 };
        if (!stall && currentPC <= maxPC) {
            const ir = readWord(currentPC, memory);
            newIF.IR = ir;
            if (ir !== 0) {
                newIF.PC = currentPC;
                newIF.NPC = currentPC + 4;
                currentPC += 4;
            } else {
                newIF.IR = NOP;
            }
        } else {
            newIF = { ...IF };
        }
        Object.assign(IF, newIF);

        cycle++;
        recordStages();
        updatePipelineMap();
        updateRiscVRegisters();
        updateRegistersTable();
        updateMemoryTable();
        updateViewMemoryTable();
    }


    function recordStages() {
        if (IF.IR !== NOP && IF.IR !== 0 && IF.PC >= 0x00000080 && IF.PC < maxPC) {
            if (!pipelineMap.has(IF.PC)) {
                pipelineMap.set(IF.PC, { startCycle: cycle, stages: new Map() });
            }
            pipelineMap.get(IF.PC).stages.set(cycle, 'IF');
        }
        if (ID.IR !== NOP && ID.IR !== 0 && ID.PC >= 0x00000080 && ID.PC < maxPC) {
            if (!pipelineMap.has(ID.PC)) {
                pipelineMap.set(ID.PC, { startCycle: cycle, stages: new Map() });
            }
            pipelineMap.get(ID.PC).stages.set(cycle, 'ID');
        }
        if (EX.IR !== NOP && EX.IR !== 0 && EX.PC >= 0x00000080 && EX.PC < maxPC) {
            if (!pipelineMap.has(EX.PC)) {
                pipelineMap.set(EX.PC, { startCycle: cycle, stages: new Map() });
            }
            pipelineMap.get(EX.PC).stages.set(cycle, 'EX');
        }
        if (MEM.IR !== NOP && MEM.IR !== 0 && MEM.PC >= 0x00000080 && MEM.PC < maxPC) {
            if (!pipelineMap.has(MEM.PC)) {
                pipelineMap.set(MEM.PC, { startCycle: cycle, stages: new Map() });
            }
            pipelineMap.get(MEM.PC).stages.set(cycle, 'MEM');
        }
        if (WB.PC !== 0x00000000 && WB.PC >= 0x00000080 && WB.PC < maxPC && pipelineMap.has(WB.PC)) {
            pipelineMap.get(WB.PC).stages.set(cycle, 'WB');
        }

        pipelineRegisterMap.get("IF/ID.IR").push(IF.IR);
        pipelineRegisterMap.get("IF/ID.NPC").push(IF.NPC);
        pipelineRegisterMap.get("IF/ID.PC").push(IF.PC);

        pipelineRegisterMap.get("ID/EX.A").push(ID.A);
        pipelineRegisterMap.get("ID/EX.B").push(ID.B);
        pipelineRegisterMap.get("ID/EX.IMM").push(ID.IMM);
        pipelineRegisterMap.get("ID/EX.IR").push(ID.IR);
        pipelineRegisterMap.get("ID/EX.NPC").push(ID.NPC);

        pipelineRegisterMap.get("EX/MEM.ALUOUTPUT").push(EX.ALUOUTPUT);
        pipelineRegisterMap.get("EX/MEM.IR").push(EX.IR);
        pipelineRegisterMap.get("EX/MEM.B").push(EX.B);
        pipelineRegisterMap.get("EX/MEM.COND").push(EX.COND);

        pipelineRegisterMap.get("MEM/WB.LMD").push(MEM.LMD);
        pipelineRegisterMap.get("MEM/WB.IR").push(MEM.IR);
        pipelineRegisterMap.get("MEM/WB.ALUOUTPUT").push(MEM.ALUOUTPUT);
        pipelineRegisterMap.get("MEM[EX/MEM.ALUOUTPUT]").push(MEM.MEMALUOUTPUT);

        pipelineRegisterMap.get("REGS[MEM/WB.IR[rd]]").push(WB.Rn);
    }

    function updatePipelineMap() {
        const table = document.getElementById("pipeline-table");
        if (!table) return;
        table.innerHTML = '';
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const thInstr = document.createElement('th');
        thInstr.textContent = 'Instruction';
        tr.appendChild(thInstr);
        for (let c = 1; c <= cycle; c++) {
            const th = document.createElement('th');
            th.textContent = c.toString();
            tr.appendChild(th);
        }
        thead.appendChild(tr);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        const instrList = Array.from(pipelineMap.keys()).sort((a, b) => a - b);
        for (let pc of instrList) {
            const entry = pipelineMap.get(pc);
            const instrName = addressToInstr.get(pc) || `Unknown at 0x${pc.toString(16).padStart(8, '0').toUpperCase()}`;
            const rowTr = document.createElement('tr');
            const tdInstr = document.createElement('td');
            tdInstr.textContent = instrName;
            rowTr.appendChild(tdInstr);
            for (let c = 1; c <= cycle; c++) {
                const td = document.createElement('td');
                td.textContent = entry.stages.get(c) || '';
                rowTr.appendChild(td);
            }
            tbody.appendChild(rowTr);
        }
        table.appendChild(tbody);
    }

    function updateRiscVRegisters() {
        const pipelineTable = document.getElementById("pipeline-regs-table");
        if (!pipelineTable) return;

        pipelineTable.innerHTML = '';

        // --- Header Setup (Cycle Numbers) ---
        const tableHead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const instructionHeaderCell = document.createElement('th');
        instructionHeaderCell.textContent = 'Register';
        headerRow.appendChild(instructionHeaderCell);

        for (let currentCycle = 1; currentCycle <= cycle; currentCycle++) {
            const cycleHeaderCell = document.createElement('th');
            cycleHeaderCell.textContent = currentCycle.toString();
            headerRow.appendChild(cycleHeaderCell);
        }

        tableHead.appendChild(headerRow);
        pipelineTable.appendChild(tableHead);

        // --- Body Setup (Latch Contents) ---
        const tableBody = document.createElement('tbody');
        const registerNames = Array.from(pipelineRegisterMap.keys());
        for (const regName of registerNames) {
            const history = pipelineRegisterMap.get(regName);
            const rowTr = document.createElement('tr');

            // Latch Name Cell
            const tdName = document.createElement('td');
            tdName.textContent = regName;
            rowTr.appendChild(tdName);

            // Cycle Data Cells
            for (let currentCycle = 1; currentCycle <= cycle; currentCycle++) {
                const td = document.createElement('td');
                if (regName != " " && regName != "  " && regName != "   " && regName != "    ") {
                    // Use array index (cycle - 1) since we used push()
                    const entry = history[currentCycle - 1];
                    if (regName == "EX/MEM.COND") {
                        td.textContent = entry;
                    }
                    else if (regName == "MEM/WB.LMD" || regName == "MEM/WB.ALUOUTPUT" || regName == "MEM[EX/MEM.ALUOUTPUT]" || regName == "REGS[MEM/WB.IR[rd]]") {
                        if (entry == 0) {
                            td.textContent = "N/A";
                        }
                        else {
                            td.textContent = entry.toString(16).padStart(8, '0').toUpperCase();
                        }
                    }
                    else {
                        td.textContent = entry.toString(16).padStart(8, '0').toUpperCase();
                    }
                }

                rowTr.appendChild(td);
            }
            tableBody.appendChild(rowTr);
        }

        pipelineTable.appendChild(tableBody);
    }

    function updateRegistersTable() {
        for (let i = 1; i <= 31; i++) {
            const reg = `x${i}`;
            const textarea = document.getElementById(reg);
            if (textarea) {
                const val = registers.get(reg) || 0;
                textarea.value = (val >>> 0).toString(16).padStart(8, '0').toUpperCase();
            }
        }
    }

    function updateMemoryTable() {
        const memoryText = document.getElementsByClassName("textbox-memory");
        for (let i = 0; i < memoryText.length; i++) {
            const addr = i * 4;
            if (addr <= 0x7C) {
                const word = readWord(addr, memory);
                memoryText[i].value = (word >>> 0).toString(16).padStart(8, '0').toUpperCase();
            }
        }
    }

    function updateViewMemoryTable() {
        const memoryText = document.getElementsByClassName("textbox-viewmemory");
        const numWords = memoryText.length / 4;
        for (let i = 0; i < numWords; i++) {
            const addr = i * 4;
            const startIndex = i * 4;
            const word = readWord(addr, memory);

            const byte0 = (word >>> 0) & 0xFF; // Shift 0 (or no shift), then mask to 8 bits
            memoryText[startIndex].value = byte0.toString(16).padStart(2, '0').toUpperCase();

            const byte1 = (word >>> 8) & 0xFF; // Shift right 8 bits
            memoryText[startIndex + 1].value = byte1.toString(16).padStart(2, '0').toUpperCase();

            const byte2 = (word >>> 16) & 0xFF; // Shift right 16 bits
            memoryText[startIndex + 2].value = byte2.toString(16).padStart(2, '0').toUpperCase();

            const byte3 = (word >>> 24) & 0xFF; // Shift right 24 bits
            memoryText[startIndex + 3].value = byte3.toString(16).padStart(2, '0').toUpperCase();
        }
    }

    document.getElementById("set registers button").onclick = function () {

        const regs = document.getElementsByClassName("textbox-register");
        for (let i = 0; i < regs.length; i++) {
            const value = parseInt(regs[i].value, 16) || 0; // hex radix, 0 if invalid
            registers.set(regs[i].id, value);
        }
        alert("Registers set.");
    };

    document.getElementById("set memory button").onclick = function () {
        const memoryText = document.getElementsByClassName("textbox-memory");

        for (let i = 0; i <= 127; i++) {
            memory[i] = 0;
        }

        for (let i = 0; i < memoryText.length; i++) {
            const currentAddress = i * 4;
            const hexValue = memoryText[i].value.trim();

            if (hexValue !== "") {

                if (currentAddress % 4 !== 0) {
                    continue; // Skip to the next input field
                }

                const wordValue = parseInt(hexValue, 16);

                memory[currentAddress] = (wordValue & 0xFF);

                memory[currentAddress + 1] = (wordValue >>> 8) & 0xFF;

                memory[currentAddress + 2] = (wordValue >>> 16) & 0xFF;

                memory[currentAddress + 3] = (wordValue >>> 24) & 0xFF;
            }

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
        updatePipelineMap(); // Refresh when switching to pipeline view
    };

    document.getElementById("risc-v registers button").onclick = function () {
        document.getElementById("editor").style.display = "none";
        document.getElementById("opcodes").style.display = "none";
        document.getElementById("errors").style.display = "none";
        document.getElementById("pipelines").style.display = "none";
        document.getElementById("risc-v registers").style.display = "inline";
        updateRiscVRegisters(); // Refresh when switching
    };

    document.getElementById("registers button").onclick = function () {
        document.getElementById("set memory button").style.display = "none";
        document.getElementById("goto button").style.display = "none";
        document.getElementById("searchMemory").style.display = "none";
        document.getElementById("set registers button").style.display = "inline";
        document.getElementById("registers").style.display = "flex";
        document.getElementById("view-memory").style.display = "none";
        document.getElementById("memory").style.display = "none";
        updateRegistersTable(); // Refresh when switching
    };

    document.getElementById("memory button").onclick = function () {
        document.getElementById("set registers button").style.display = "none";
        document.getElementById("goto button").style.display = "none";
        document.getElementById("searchMemory").style.display = "none";
        document.getElementById("set memory button").style.display = "inline";
        document.getElementById("registers").style.display = "none";
        document.getElementById("view-memory").style.display = "none";
        document.getElementById("memory").style.display = "flex";
        updateMemoryTable(); // Refresh when switching
    };

    document.getElementById("view memory button").onclick = function () {
        document.getElementById("set registers button").style.display = "none";
        document.getElementById("set memory button").style.display = "none";
        document.getElementById("goto button").style.display = "inline";
        document.getElementById("searchMemory").style.display = "inline";
        document.getElementById("registers").style.display = "none";
        document.getElementById("view-memory").style.display = "flex";
        document.getElementById("memory").style.display = "none";
        updateViewMemoryTable();
    }
});
