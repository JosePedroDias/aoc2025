import { fetchPuzzle, permutations2, limits, compressCoordinates } from './utils.js';

function draw(coords, bestRect, title = "polygon with best rectangle") {
    if (!bestRect) return;

    // Find bounds
    const xs = coords.map(([x, y]) => x);
    const ys = coords.map(([x, y]) => y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;
    const padding = Math.max(width, height) * 0.1;

    const viewWidth = width + 2 * padding;
    const viewHeight = height + 2 * padding;
    const viewMinX = minX - padding;
    const viewMinY = minY - padding;

    // Build polygon path
    const pathData = coords.map(([x, y], i) =>
        `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    ).join(' ') + ' Z';

    // Build rectangle path
    const { x1, y1, x2, y2 } = bestRect;
    const rectPath = `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`;

    const svg = `
<svg width="800" height="600" viewBox="${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}"
     xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #ccc; background: white;">
    <title>${title}</title>

    <!-- Polygon -->
    <path d="${pathData}"
          fill="rgba(100, 150, 255, 0.2)"
          stroke="blue"
          stroke-width="${Math.max(width, height) * 0.01}"
          stroke-linejoin="round"/>

    <!-- Polygon vertices -->
    ${coords.map(([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="${Math.max(width, height) * 0.00375}" fill="blue"/>`
    ).join('\n    ')}

    <!-- Best rectangle -->
    <path d="${rectPath}"
          fill="rgba(255, 100, 100, 0.3)"
          stroke="red"
          stroke-width="${Math.max(width, height) * 0.015}"
          stroke-linejoin="miter"/>

    <!-- Rectangle corners -->
    <circle cx="${x1}" cy="${y1}" r="${Math.max(width, height) * 0.005}" fill="red" fill-opacity="0.66" stroke="red" stroke-opacity="0.66"/>
    <circle cx="${x2}" cy="${y1}" r="${Math.max(width, height) * 0.005}" fill="red" fill-opacity="0.66" stroke="red" stroke-opacity="0.66"/>
    <circle cx="${x1}" cy="${y2}" r="${Math.max(width, height) * 0.005}" fill="red" fill-opacity="0.66" stroke="red" stroke-opacity="0.66"/>
    <circle cx="${x2}" cy="${y2}" r="${Math.max(width, height) * 0.005}" fill="red" fill-opacity="0.66" stroke="red" stroke-opacity="0.66"/>

    <!-- Labels -->
    <text x="${viewMinX + viewWidth/2}" y="${viewMinY + padding/2}"
          text-anchor="middle"
          font-family="sans-serif"
          font-size="${Math.max(width, height) * 0.05}"
          fill="black">${title}</text>

    <text x="${viewMinX + viewWidth/2}" y="${viewMinY + viewHeight - padding/3}"
          text-anchor="middle"
          font-family="sans-serif"
          font-size="${Math.max(width, height) * 0.04}"
          fill="red">Rectangle: (${x1},${y1}) to (${x2},${y2}), Area: ${(x2-x1+1)*(y2-y1+1)}</text>
</svg>`;

    const container = document.createElement('div');
    container.innerHTML = svg;
    container.style.margin = '20px';
    document.body.appendChild(container);
}

async function parseData(name) {
    const data = await fetchPuzzle(name);
    const lines = data.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    return lines.map(line => line.split(',').map(Number));
}

let coords = await parseData('09a');

const { compressedCoords } = compressCoordinates(coords);

function analyze() {
    const numPoints = coords.length;
    const lims = limits(coords);
    console.warn(`numPoints: ${numPoints}
limitsX: ${lims[0]}
limitsY: ${lims[1]}`);
}

function area([ax, ay], [bx, by]) {
    return (1+Math.abs(ax - bx)) * (1+Math.abs(ay - by));
}

function part1() {
    const pairs = permutations2(coords.length);
    console.log(`# pairs: ${pairs.length}`);
    let maxArea = 0;
    for (let [i, j] of pairs) {
        const a = area(coords[i], coords[j]);
        maxArea = Math.max(maxArea, a);
    }
    console.log(`maxArea: ${maxArea}`);
}

async function part2() {
    const t0 = Date.now();

    const compressedEdges = [];
    const n = compressedCoords.length;
    for (let i = 0; i < n; i++) {
        const [x1, y1] = compressedCoords[i];
        const [x2, y2] = compressedCoords[(i + 1) % n];
        compressedEdges.push({ x1, y1, x2, y2 });
    }

    function isPointOnEdge(px, py, x1, y1, x2, y2) {
        if (x1 === x2) {
            if (px === x1 && py >= Math.min(y1, y2) && py <= Math.max(y1, y2)) return true;
        } else {
            if (py === y1 && px >= Math.min(x1, x2) && px <= Math.max(x1, x2)) return true;
        }
        return false;
    }

    function pointInPolygon(px, py) {
        let intersections = 0;

        for (const edge of compressedEdges) {
            const { x1, y1, x2, y2 } = edge;

            if (px < x1 && px < x2) continue;

            if (isPointOnEdge(px, py, x1, y1, x2, y2)) return true;

            if (x1 === x2) {
                const yMin = Math.min(y1, y2);
                const yMax = Math.max(y1, y2);
                if (yMin < py && py <= yMax) ++intersections;
            }
        }

        return intersections % 2 === 1;
    }

    function isOnPolygonBoundary(px, py) {
        for (const edge of compressedEdges) {
            if (isPointOnEdge(px, py, edge.x1, edge.y1, edge.x2, edge.y2)) return true;
        }
        return false;
    }

    function allEdgePointsValid(minX, minY, maxX, maxY) {
        // verify the other two corners first
        const corner1Valid = isOnPolygonBoundary(minX, maxY) || pointInPolygon(minX, maxY);
        const corner2Valid = isOnPolygonBoundary(maxX, minY) || pointInPolygon(maxX, minY);

        if (!corner1Valid || !corner2Valid) return false;

        // Early exit
        const height = maxY - minY;
        const sampleStep = Math.min(1500, Math.max(100, Math.floor(height / 10)));

        for (let y = minY; y <= maxY; y += sampleStep) {
            if (!isOnPolygonBoundary(minX, y) && !pointInPolygon(minX, y)) return false;
            if (!isOnPolygonBoundary(maxX, y) && !pointInPolygon(maxX, y)) return false;
        }

        // verify all edge points
        for (let x = minX; x <= maxX; x++) {
            if (!isOnPolygonBoundary(x, minY) && !pointInPolygon(x, minY)) return false;
            if (!isOnPolygonBoundary(x, maxY) && !pointInPolygon(x, maxY)) return false;
        }

        for (let y = minY + 1; y < maxY; y++) {
            if (!isOnPolygonBoundary(minX, y) && !pointInPolygon(minX, y)) return false;
            if (!isOnPolygonBoundary(maxX, y) && !pointInPolygon(maxX, y)) return false;
        }

        return true;
    }

    let bestArea = 0;
    let bestRect = null;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const [origX1, origY1] = coords[i];
            const [origX2, origY2] = coords[j];

            if (origX1 === origX2 || origY1 === origY2) continue;

            const area = (Math.abs(origX2 - origX1) + 1) * (Math.abs(origY2 - origY1) + 1);
            if (area <= bestArea) continue;

            const [compX1, compY1] = compressedCoords[i];
            const [compX2, compY2] = compressedCoords[j];

            const minX = Math.min(compX1, compX2);
            const maxX = Math.max(compX1, compX2);
            const minY = Math.min(compY1, compY2);
            const maxY = Math.max(compY1, compY2);

            if (allEdgePointsValid(minX, minY, maxX, maxY)) {
                bestArea = area;
                //bestRectCompressed = { x1: minX, y1: minY, x2: maxX, y2: maxY };
                bestRect = {
                    x1: Math.min(origX1, origX2),
                    y1: Math.min(origY1, origY2),
                    x2: Math.max(origX1, origX2),
                    y2: Math.max(origY1, origY2)
                };
            }
        }
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`largest area: ${bestArea} (completed in ${elapsed}s)`);
    console.log(`largest corners:`, bestRect);

    draw(coords, bestRect, `Part 2: Best Rectangle (Area: ${bestArea})`);
}

analyze();
part1();
part2();
