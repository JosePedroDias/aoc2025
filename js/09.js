import { fetchPuzzle, permutations2, SparseMatrix, limits, crop, times, SetOf } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    const lines = data.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    return lines.map(line => line.split(',').map(Number));
}

let coords = (await parseData('09a')).map(([x, y]) => [y, x]);

function area([ax, ay], [bx, by]) {
    return (1+Math.abs(ax - bx)) * (1+Math.abs(ay - by));
}

function analyze() {
    const numPoints = coords.length;
    const lims = limits(coords);
    console.warn(`numPoints: ${numPoints}
limitsX: ${lims[0]}
limitsY: ${lims[1]}`);
}

function part1() {
    //console.log(area([2,5],[9,7])) // 24
    const pairs = permutations2(coords.length);
    console.log(`# pairs: ${pairs.length}`);
    let maxArea = 0;
    for (let [i, j] of pairs) {
        const a = area(coords[i], coords[j]);
        maxArea = Math.max(maxArea, a);
    }
    console.log(`maxArea: ${maxArea}`);
}

function drawLineOfXs(m, [x1, y1], [x2, y2]) {
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    for (let x = x1, y = y1; x !== x2 || y !== y2; x += dx, y += dy) {
        m.set(x, y, 'X');
    }
}

function part2() {
    const lims = limits(coords);
    const {dims, offsets} = crop(lims);
    coords = coords.map(([x, y]) => [x + offsets[0], y + offsets[1]]);

    const m = new SparseMatrix(dims[0], dims[1], '.');
    
    const l = coords.length;

    times(l).forEach(i => {
        const j = (i + 1) % l;
        drawLineOfXs(m, coords[i], coords[j]);
    });

    for (let [x, y] of coords) m.set(x, y, '#');

    const boundary = new SetOf(
        ([x, y]) => `${x},${y}`,
        (s) => s.split(',').map(Number)
    );
    m.keys().forEach(([x, y]) => {
            boundary.add([x, y]);
    });
    
    // Scanline fill
    for (let y of times(dims[1])) {
        let inside = false;
        let prevWasBoundary = false;
        let entryHadAbove = false;
        let entryHadBelow = false;

        for (let x of times(dims[0])) {
            const isBoundary = boundary.has([x, y]);

            if (isBoundary && !prevWasBoundary) {
                // Entering a boundary segment
                const hasAbove = y > 0 && boundary.has([x, y - 1]);
                const hasBelow = y < dims[1] - 1 && boundary.has([x, y + 1]);
                entryHadAbove = hasAbove;
                entryHadBelow = hasBelow;
            } else if (!isBoundary && prevWasBoundary) {
                // Exiting a boundary segment
                const lastX = x - 1;
                const hasAbove = y > 0 && boundary.has([lastX, y - 1]);
                const hasBelow = y < dims[1] - 1 && boundary.has([lastX, y + 1]);

                // Toggle based on vertical edge crossings

                if ((entryHadAbove && hasBelow) || (entryHadBelow && hasAbove)) {
                    // Opposite directions
                    inside = !inside;
                } else if ((entryHadAbove && hasAbove) || (entryHadBelow && hasBelow)) {
                    // Same direction 
                } else if (entryHadAbove || entryHadBelow || hasAbove || hasBelow) {
                    // Only one end has a vertical connection
                    inside = !inside;
                }
            }

            // Fill if we're inside and not on a boundary
            if (!isBoundary && inside) {
                m.set(x, y, 'X');
            }

            prevWasBoundary = isBoundary;
        }
    }

    let filledCells = m.values().length;
    console.log(`filledCells: ${filledCells}`);

    //console.log(m.toString());
}

//analyze();
//part1();
part2();
