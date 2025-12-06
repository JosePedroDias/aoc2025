import { fetchPuzzle } from './utils.js';

const data = await fetchPuzzle('02a');
const items = data.split(',').map(s => s.split('-').map(Number));

function isInvalid1(n) {
    const s = n.toString();
    const l = s.length;
    if (l % 2 === 1) return false;
    const z = Math.floor(l / 2);
    for (let i = 0; i < l - z; ++i) {
        const a = s.substr(i, z);
        const b = s.substr(i + z, z);
        if (a === b) return true;
    }
    return false;
}

const lookup = {
     2: [[1, 1]],
     3: [[1, 1, 1]],
     4: [[1, 1, 1, 1], [2, 2]], // 2*2
     5: [[1, 1, 1, 1, 1]],
     6: [[1, 1, 1, 1, 1, 1], [2, 2, 2], [3, 3]], // 2*3
     7: [[1, 1, 1, 1, 1, 1, 1]],
     8: [[1, 1, 1, 1, 1, 1, 1, 1], [2, 2, 2, 2], [4, 4]], // 2*4
     9: [[1, 1, 1, 1, 1, 1, 1, 1, 1], [3, 3, 3]],
    10: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [2, 2, 2, 2, 2], [5, 5]], // 2*5
};

function isInvalid2(n) {
    const s = n.toString();
    const l = s.length;
    const combs = lookup[l];
    if (!combs) return false;
    for (let comb of combs) {
        const match = s.substr(0, comb[0]);
        if (match.repeat(comb.length) === s) return true;
    }
    return false;
}

function analyze() {
    const bounds = [Infinity, -Infinity];
    items.forEach(([a, b]) => {
        if (a < bounds[0]) bounds[0] = a;
        if (b > bounds[1]) bounds[1] = b;
    });
    console.warn(`bounds: ${bounds}`);
    console.warn(`max string length: ${bounds[1].toString().length}`); // 10
}

function runPart(fn) {
    let sum = 0;
    for (let pair of items) {
        const [a, b] = pair;
        //console.log(`${a} .. ${b}:`);
        for (let n = a; n <= b; ++n) {
            if (fn(n)) {
                //console.log(`-> ${n}!`);
                sum += n;
            }
        }
    }
    console.log('sum: ', sum);
}

analyze();

console.warn('\npart1:');
runPart(isInvalid1);

console.warn('\npart2:');
runPart(isInvalid2);
