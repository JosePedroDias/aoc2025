import { fetchPuzzle } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    return data.split('\n');
}

let data = await parseData('11a');

function analyze() {
}

function part1() {
}

function part2() {
}

analyze();
part1();
part2();
