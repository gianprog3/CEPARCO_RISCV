export const NOP = 0x00000013;

export let IF = {
    IR: NOP,
    NPC: 0x00000000,
    PC: 0x00000000
};

export let ID = {
    A: 0x00000000,
    B: 0x00000000,
    IMM: 0x00000000,
    IR: NOP,
    NPC: 0x00000000,
    PC: 0x00000000
};

export let EX = {
    ALUOUTPUT: 0x00000000,
    IR: NOP,
    B: 0x00000000,
    COND: 0,
    PC: 0x00000000
};

export let MEM = {
    LMD: 0x00000000,
    IR: NOP,
    ALUOUTPUT: 0x00000000,
    MEMALUOUTPUT: 0x00000000,
    PC: 0x00000000
};

export let WB = {
    Rn: 0x00000000,
    PC: 0x00000000 // Optional, not used
};
