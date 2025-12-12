import { fetchPuzzle, Matrix, matrixFromLines } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    const parts = data.split('\n\n');
    const lastPart = parts.pop();
    const pieces_ = parts.map(part => part.split('\n').slice(1));
    const reqs = lastPart.split('\n').map(l => { 
        const [a, b] = l.split(': ');
        const dims = a.split('x').map(Number);
        const counts = b.split(' ').map(Number);
        return { dims, counts };
    });
    const pieces = pieces_.map(piece => matrixFromLines(piece, c => c === '#'));
    return { pieces, reqs };
}

function mToString(m) {
    return m.data.map(row => row.map(c => c ? '#' : '.').join('')).join('\n');
}

const { pieces, reqs } = await parseData('12');

function hashM(m) {
    return  m.data[0][0]       +
            m.data[0][1] *   2 +
            m.data[0][2] *   4 +
            m.data[1][0] *   8 +
            m.data[1][1] *  16 +
            m.data[1][2] *  32 +
            m.data[2][0] *  64 +
            m.data[2][1] * 128 +
            m.data[2][2] * 256;
}

function _computeVariants(m) {
    //console.log(mToString(m));

    const [a, b, c] = m.data[0];
    const [d, e, f] = m.data[1];
    const [g, h, i] = m.data[2];

    const variants = [];
    const s = new Set();

    variants.push(m);
    s.add(hashM(m));

    {   // 90
        const M = new Matrix(3, 3, false);
        M.data[0] = [c, f, i];
        M.data[1] = [b, e, h];
        M.data[2] = [a, d, g];
        const hx = hashM(M);
        if (!s.has(hx)) { variants.push(M); s.add(hx); }
    }
    {   // 180
        const M = new Matrix(3, 3, false);
        M.data[0] = [i, h, g];
        M.data[1] = [f, e, d];
        M.data[2] = [c, b, a];
        const hx = hashM(M);
        if (!s.has(hx)) { variants.push(M); s.add(hx); }
    }
    {   // 270
        const M = new Matrix(3, 3, false);
        M.data[0] = [g, d, a];
        M.data[1] = [h, e, b];
        M.data[2] = [i, f, c];
        const hx = hashM(M);
        if (!s.has(hx)) { variants.push(M); s.add(hx); }
    }
    {   // 0 flipped
        const M = new Matrix(3, 3, false);
        M.data[0] = [c, b, a];
        M.data[1] = [f, e, d];
        M.data[2] = [i, h, g];
        const hx = hashM(M);
        if (!s.has(hx)) { variants.push(M); s.add(hx); }
    }
    {   // 90 flipped
        const M = new Matrix(3, 3, false);
        M.data[0] = [i, f, c];
        M.data[1] = [h, e, b];
        M.data[2] = [g, d, a];
        const hx = hashM(M);
        if (!s.has(hx)) { variants.push(M); s.add(hx); }
    }
    {   // 180 flipped
        const M = new Matrix(3, 3, false);
        M.data[0] = [g, h, i];
        M.data[1] = [d, e, f];
        M.data[2] = [a, b, c];
        const hx = hashM(M);
        if (!s.has(hx)) { variants.push(M); s.add(hx); }
    }
    {   // 270 flipped
        const M = new Matrix(3, 3, false);
        M.data[0] = [a, d, g];
        M.data[1] = [b, e, h];
        M.data[2] = [c, f, i];
        const hx = hashM(M);
        if (!s.has(hx)) { variants.push(M); s.add(hx); }
    }

    return variants;
}

const _varsMemo = new Map();
function computeVariants(m) {
    const key = hashM(m);
    if (_varsMemo.has(key)) return _varsMemo.get(key);
    const vars = _computeVariants(m);
    _varsMemo.set(key, vars);
    return vars;
}

//const vars = computeVariants(pieces[4]); console.log(vars.map(m => mToString(m)).join('\n\n'));

function analyze() {
    //console.log('pieces', pieces);
    //console.log('reqs', reqs);
    console.log('pieces.length', pieces.length); // 6, 6
    console.log('reqs.length', reqs.length); // 3, 1000
    const maxPieceArea = Math.max(...pieces.map(m => m.rows * m.cols));
    const maxReqSpaceDim0 = Math.max(...reqs.map(r => r.dims[0]));
    const maxReqSpaceDim1 = Math.max(...reqs.map(r => r.dims[1]));
    const maxReqSpaceArea = Math.max(...reqs.map(r => r.dims[0] * r.dims[1]));
    console.log('maxPieceArea', maxPieceArea); // 9, 9
    console.log('are all pieces 3x3?', pieces.every(m => m.rows === m.cols && m.rows === 3));
    console.log('maxReqSpaceDim0', maxReqSpaceDim0); // 12, 50
    console.log('maxReqSpaceDim1', maxReqSpaceDim1); // 5, 50
    console.log('maxReqSpaceArea', maxReqSpaceArea); // 60, 2500
}

function part1Lame() {
    let numRegionsFulfilled = 0;
    for (let { dims, counts } of reqs) {
        const [rows, cols] = dims;
        const numTotalPieces = counts.reduce((a, b) => a + b);
        const rowsOver3 = Math.floor(rows / 3);
        const colsOver3 = Math.floor(cols / 3);
        const maxPossiblePieces = rowsOver3 * colsOver3;
        const doesItFit = numTotalPieces <= maxPossiblePieces;
        if (doesItFit) ++numRegionsFulfilled;
        console.log(`rows: ${rows}, cols: ${cols}, numTotalPieces: ${numTotalPieces}, maxPossiblePieces: ${maxPossiblePieces}, doesItFit: ${doesItFit}`);
    }
    console.log(`regionsFulfilled ${numRegionsFulfilled}/${reqs.length}`);
}

function part1() {
    const pieceVariants = pieces.map(computeVariants);
    for (let { dims, counts } of reqs) {
        const [rows, cols] = dims;
        const sp = new Matrix(rows, cols, false);
        //console.log(indices);
        const itemsToPlace = [];
        let i = 0;
        for (let count of counts) {
            for (let j = 0; j < count; ++j) itemsToPlace.push(pieceVariants[i]);
            ++i;
        }
        //console.log('itemsToPlace');
        //itemsToPlace.forEach((it, i) => console.log(`** #${i} **\n\n` + it.map(m => mToString(m)).join('\n\n')));

        for (let it of itemsToPlace) {
            // TODO
        }

        console.log('------');
    }
    console.log('end of part 1');
}

function part2() {
}

//analyze();
//part1();
part1Lame();
part2();
