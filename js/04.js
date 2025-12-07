import { fetchPuzzle, matrixFromLines } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    let lines = data.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    return lines;
}

const items = await parseData('04');
const m = matrixFromLines(items);
console.log(m.toString());

function analyze() {
    console.log(`lines: ${items.length}`);
    console.log(`widths: ${items.map(line => line.length)}`);
}

function countRolls(arr) {
    return arr.filter(c => c === '@').length;
}

function part1() {
    console.log(`\npart1`);
    const m2 = m.clone();
    let amount = 0;
    for (let [row, col] of m.positions()) {
        const c = m.get(row, col);
        if (c !== '@') continue;
        const neighbors = m.mapPositions(m.neightbors8(row, col));
        if (countRolls(neighbors) >= 4) continue;
        m2.set(row, col, 'x');
        amount++;
    }
    console.log(`amount: ${amount}`);
    console.log(m2.toString());
}

function part2() {
    let m1 = m.clone();
    console.log(`\npart2`);
    
    let totalAmount = 0;
    let amount;
    do {
        amount = 0;
        let m2 = m1.clone();
        for (let [row, col] of m1.positions()) {
            const c = m1.get(row, col);
            if (c !== '@') continue;
            const neighbors = m1.mapPositions(m1.neightbors8(row, col));
            if (countRolls(neighbors) >= 4) continue;
            m2.set(row, col, '.');
            amount++;
        }
        console.log(`amount: ${amount}`);
        console.log(m2.toString());
        m1 = m2;
        totalAmount += amount;
    } while (amount > 0);
    console.log(`totalAmount: ${totalAmount}`);
}

analyze();
part1();
part2();
