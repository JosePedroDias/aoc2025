import { fetchPuzzle } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    return data.trim().split(',').map(line => {
        const [start, end] = line.split('-').map(Number);
        return [start, end];
    });
}

const items = await parseData('02a');

function analyze() {
    console.log(items);
}

function part1() {
}

function part2() {
}

analyze();
part1();
part2();
