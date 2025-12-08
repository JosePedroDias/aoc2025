import { fetchPuzzle, matrixFromLines, HistogramOf } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    return data.split('\n');
}

const lines = await parseData('07a');
const m0 = matrixFromLines(lines);
//console.log(m0.toString());

let startPosition = null;
m0.forEach(([row, col], c) => {
    if (c === 'S') startPosition = [row, col];
});
//console.log('startPosition', startPosition);

const splitterPositions = {};
m0.forEachRowIndex((rIdx) => splitterPositions[rIdx] = new Set());
m0.forEach(([row, col], c) => {
    if (c === '^') splitterPositions[row].add(col);
});
//console.log('splitterPositions', splitterPositions);

function analyze() {
}

function part1() {
    const m = m0.clone();
    let row = startPosition[0];
    let cols = new Set([startPosition[1]]);

    let splits = 0;
    while (row < m.rows - 1) {
        ++row;
        let cols2 = new Set();
        cols.forEach(col => {
            if (splitterPositions[row].has(col)) {
                ++splits;
                cols2.add(col - 1);
                cols2.add(col + 1);
            } else {
                cols2.add(col);
            }
        });
        cols = cols2;
        //cols.forEach((col) => m.set(row, col, '|') );
        //console.log(m.toString());
    }
    console.log('splits:', splits);
}

function part2() {
    const m = m0.clone();
    let row = startPosition[0];
    let cols = new HistogramOf((i) => i, (i) => i);
    cols.inc(startPosition[1]);

    while (row < m.rows - 1) {
        ++row;        
        let cols2 = cols.emptyClone();
        cols.forEach((col, count) => {
            if (splitterPositions[row].has(col)) {
                cols2.add(col - 1, count);
                cols2.add(col + 1, count);
            } else {
                cols2.add(col, count);
            }
        });
        cols = cols2;
    }

    console.log('total:', cols.sum());
}

analyze();
part1();
part2();
