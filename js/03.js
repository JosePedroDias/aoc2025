import { fetchPuzzle } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    let lines = data.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    return lines.map(line => line.split('').map(Number));
}

const items = await parseData('03a');

function analyze() {
    // jolt 1-9
    const lengths = [Infinity, -Infinity];
    items.forEach(line => {
        lengths[0] = Math.min(lengths[0], line.length);
        lengths[1] = Math.max(lengths[1], line.length);
    });
    console.warn(`lengths: ${lengths}`); // 15 ~> 100
}

function maxJolts1(bank) {
    const l = bank.length;
    const max = Math.max.apply(null, bank);
    const maxIndex = bank.indexOf(max);
    //console.log(`max: ${max}, maxIndex: ${maxIndex}, l: ${l}`);
    if (maxIndex < l -1) {
        const secondMax = Math.max.apply(null, bank.slice(maxIndex + 1));
        //console.log(`basic case: ${max}${secondMax}`);
        return max * 10 + secondMax;
    }
    {
        const max = Math.max.apply(null, bank.slice(0, maxIndex));
        const maxIndex2 = bank.indexOf(max);
        const secondMax = Math.max.apply(null, bank.slice(maxIndex2 + 1));
        //console.log(`non-basic case: ${max}${secondMax}`);
        return max * 10 + secondMax;
    }
}

function maxJolts2(bank) {
    let found = [];
    while (found.length < 12) {
        let l = bank.length;
        let nn = 11 - found.length; // 11, 10...
        //console.log('nn', nn, 'bank', bank);
        //let left = bank.slice(l-nn, l);
        let these = bank.slice(0, l-nn);
        //console.log('these', these, 'left', left);
        const max = Math.max.apply(null, these);
        found.push(max);
        let i = these.indexOf(max);
        //console.log('max', max, 'i', i);
        bank = bank.slice(i + 1);
    }

    return Number(found.join(''));
}

function runPart(fn) {
    let sum = 0;
    for (let bank of items) {
        const jolts = fn(bank);
        //console.log(`-> ${jolts}`);
        sum += jolts;
    }
    console.log(`sum: ${sum}`);
}

analyze();
runPart(maxJolts1);
runPart(maxJolts2);
