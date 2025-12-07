import { fetchPuzzle, matrixFromLines, enumerate } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    const originalLines = data.split('\n');
    const lines = originalLines.map(s => s.split(/\s+/).filter(s => s !== ''));
    const operations = lines.pop();
    return [
        originalLines,
        lines.map(line => line.map(Number)),
        operations,
    ];
}

const [originalLines, numbers, operations] = await parseData('06a');

function analyze() {
    console.warn('numbers: ', numbers);
    console.warn('operations: ', operations);
}

function part1() {
    console.log('\npart1');
    let grandTotal = 0;
    for (let i = 0; i < operations.length; ++i) {
        const line = numbers.map(n => n[i]);
        const op = operations[i];
        //console.log(`line: ${line}, op: ${op}`);
        let total;
        if (op === '+') {
            total = line.reduce((a, b) => a + b, 0);
        } else {
            total = line.reduce((a, b) => a * b, 1);
        }
        //console.log(`total: ${total}`);
        grandTotal += total;
    }
    console.log(`grandTotal: ${grandTotal}`);
}

function part2() {
    console.log('\npart2');
    let grandTotal = 0;
        
    const m = matrixFromLines(originalLines).transpose();
    m.forEach(([row, col], c) => {
        if (c === undefined) m.set(row, col, ' ');
    });
    //console.log(m.toString());
    const opCol = m.column(m.cols - 1);
    const opIndices = opCol.map((c, i) => c === ' ' ? -1 : i).filter(i => i !== -1);
    const parts = opIndices.map((opIdx, i, arr) => {
        const start = opIdx;
        const end = arr[i + 1] || m.rows + 1;
        return m.subMatrix(start, 0, end - 1, m.cols - 1);
    });
    for (const [idx, mm] of enumerate(parts)) {
        const op = opCol[opIndices[idx]];
        //console.warn(mm.toString());
        const nums = mm.data.map(row => Number(row.join('')));
        //console.log(`#${idx} op: ${op}`);
        //console.log('nums', nums);
        
        let total;
        if (op === '+') {
            total = nums.reduce((a, b) => a + b, 0);
        } else {
            total = nums.reduce((a, b) => a * b, 1);
        }
        //console.log(`total: ${total}`);
        grandTotal += total;
    }

    console.log(`grandTotal: ${grandTotal}`);
}

analyze();
part1();
part2();
