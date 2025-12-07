import { fetchPuzzle } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    let lines = data.split('\n');
    const cutLineIndex = lines.findIndex(line => line === '');
    const ranges = lines.slice(0, cutLineIndex).map(s => s.split('-').map(Number));
    const ids = lines.slice(cutLineIndex + 1).map(Number);
    return [ranges, ids];
}

const [ranges, ids] = await parseData('05');

function inRange(n, range) {
    return n >= range[0] && n <= range[1];
}

function analyze() {
    console.log(`ranges: ${ranges.length}, ids: ${ids.length}`);
}

function part1() {
    let numFresh = 0;
    for (let id of ids) {
        if (ranges.some(range => inRange(id, range))) {
            //console.log(`id ${id} is fresh`);
            ++numFresh;
        }
    }
    console.log(`numFresh: ${numFresh}`);
}

function part2() {
    // sort from lowest min
    const sortedRanges = [...ranges].sort((a, b) => a[0] - b[0]);
    let nextRanges = [];

    const fresh = new Set();
    for (let [m, M] of sortedRanges) {
        if (nextRanges.length === 0) {
            nextRanges.push([m, M]);
            continue;
        }
        const prevRange = nextRanges[nextRanges.length - 1];
        if (m > prevRange[1] + 1) {
            nextRanges.push([m, M]);
        } else {
            prevRange[1] = Math.max(prevRange[1], M);
        }
    }
    //console.log(`nextRanges`, nextRanges);
    let numFresh = 0;
    for (let [m, M] of nextRanges) {
        numFresh += M - m + 1;
    }
    console.log(`numFresh: ${numFresh}`);
}

analyze();
part1();
part2();
