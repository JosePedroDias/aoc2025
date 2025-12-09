import { fetchPuzzle, permutations2, limits } from './utils.js';

function visualizePolygonAndRectangle(coords, bestRect, title = "Polygon with Best Rectangle") {
    if (!bestRect) {
        console.log("No rectangle to visualize");
        return;
    }

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

    // Create SVG
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

    // Create a container and insert the SVG
    const container = document.createElement('div');
    container.innerHTML = svg;
    container.style.margin = '20px';
    document.body.appendChild(container);

    console.log("Visualization added to page");
}

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

async function largestRectangle(coords, t0 = Date.now()) {
    const n = coords.length;

    // ---------- Helpers ----------

    // Edge list for polygon
    const edges = [];
    for (let i = 0; i < n; i++) {
        const [x1, y1] = coords[i];
        const [x2, y2] = coords[(i + 1) % n];
        edges.push({ x1, y1, x2, y2 });
    }

    // Point-in-polygon (ray casting, works for any simple polygon)
    function pointInPolygon(px, py) {
        let inside = false;
        for (let i = 0, j = n - 1; i < n; j = i++) {
            const [xi, yi] = coords[i];
            const [xj, yj] = coords[j];
            const intersect =
                ((yi > py) !== (yj > py)) &&
                (px < (xj - xi) * (py - yi) / (yj - yi + 0.0) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // Check if a point is on a polygon edge
    function isOnPolygonBoundary(px, py) {
        for (const e of edges) {
            const { x1, y1, x2, y2 } = e;
            if (x1 === x2) {
                // Vertical edge
                if (px === x1 && py >= Math.min(y1, y2) && py <= Math.max(y1, y2)) {
                    return true;
                }
            } else {
                // Horizontal edge
                if (py === y1 && px >= Math.min(x1, x2) && px <= Math.max(x1, x2)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Check if all edge points of rectangle are inside or on boundary
    function allEdgePointsValid(minX, minY, maxX, maxY) {
        // Check all points on the rectangle edges
        // Bottom and top edges
        for (let x = minX; x <= maxX; x++) {
            if (!isOnPolygonBoundary(x, minY) && !pointInPolygon(x, minY)) {
                return false;
            }
            if (!isOnPolygonBoundary(x, maxY) && !pointInPolygon(x, maxY)) {
                return false;
            }
        }
        // Left and right edges (excluding corners already checked)
        for (let y = minY + 1; y < maxY; y++) {
            if (!isOnPolygonBoundary(minX, y) && !pointInPolygon(minX, y)) {
                return false;
            }
            if (!isOnPolygonBoundary(maxX, y) && !pointInPolygon(maxX, y)) {
                return false;
            }
        }
        return true;
    }

    // Iterate through all pairs of vertices

    let bestArea = 0;
    let bestRect = null;

    let totalCandidates = 0;
    let failedNotRect = 0;
    let failedCenter = 0;
    let failedIntersection = 0;
    let passed = 0;

    // Try all pairs of vertices as opposite corners of a rectangle
    // The other 2 corners just need to be inside or on the polygon boundary
    const totalPairs = (n * (n - 1)) / 2;
    let pairsProcessed = 0;
    let lastLoggedPercent = -1;
    let lastYieldTime = Date.now();

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            pairsProcessed++;

            // Log progress every 0.5%
            const percent = Math.floor((pairsProcessed / totalPairs) * 1000) / 10; // One decimal place
            if (percent >= lastLoggedPercent + 0.5) {
                const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
                console.log(`Progress: ${percent.toFixed(1)}% (${pairsProcessed}/${totalPairs} pairs, best: ${bestArea}, ${elapsed}s)`);
                lastLoggedPercent = percent;
            }

            // Yield control to browser every 500ms to keep UI responsive
            const now = Date.now();
            if (now - lastYieldTime > 500) {
                await new Promise(resolve => setTimeout(resolve, 0));
                lastYieldTime = Date.now();
            }

            const [x1, y1] = coords[i];
            const [x2, y2] = coords[j];

            // Must form a proper rectangle (not a line)
            if (x1 === x2 || y1 === y2) {
                failedNotRect++;
                continue;
            }

            totalCandidates++;

            // Area includes the boundary points (discrete grid)
            const area = (Math.abs(x2 - x1) + 1) * (Math.abs(y2 - y1) + 1);
            if (area <= bestArea) continue;

            // Normalize to get bottom-left and top-right
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);

            // Check if all edge points (including all 4 corners) are inside or on boundary
            // This ensures the entire rectangle is contained within the polygon
            if (!allEdgePointsValid(minX, minY, maxX, maxY)) {
                failedIntersection++;
                continue;
            }

            // This rectangle is fully inside with 2 corners from vertices
            passed++;
            bestArea = area;
            bestRect = { x1: minX, y1: minY, x2: maxX, y2: maxY };
        }
    }

    // Calculate polygon area using Shoelace formula
    let polygonArea = 0;
    for (let i = 0; i < n; i++) {
        const [x1, y1] = coords[i];
        const [x2, y2] = coords[(i + 1) % n];
        polygonArea += x1 * y2 - x2 * y1;
    }
    polygonArea = Math.abs(polygonArea) / 2;

    // Final verification
    if (bestRect) {
        const vertexSet = new Set(coords.map(([x, y]) => `${x},${y}`));
        const { x1, y1, x2, y2 } = bestRect;
        const corners = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
        const vertexCorners = corners.filter(([x, y]) => vertexSet.has(`${x},${y}`));
        console.log(`Final result has ${vertexCorners.length} corners that are polygon vertices:`, vertexCorners);
        console.log(`Final rectangle dimensions: ${x2-x1+1} × ${y2-y1+1} = ${bestArea}`);
        console.log(`Polygon area: ${polygonArea}, Rectangle area: ${bestArea}, Ratio: ${(bestArea/polygonArea*100).toFixed(2)}%`);
    }

    return { bestArea, bestRect };
}

async function part2() {
    const t0 = Date.now();
    const { bestArea, bestRect } = await largestRectangle(coords, t0);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`largest rectangle area: ${bestArea} (completed in ${elapsed}s)`);
    console.log("largest rectangle corners:", bestRect);

    // Visualize the result
    visualizePolygonAndRectangle(coords, bestRect, `Part 2: Best Rectangle (Area: ${bestArea})`);
}

async function part2Parallel() {
    console.log('\n=== Part 2 (Parallel) ===');
    const t0 = Date.now();

    const n = coords.length;

    // Build edge list
    const edges = [];
    for (let i = 0; i < n; i++) {
        const [x1, y1] = coords[i];
        const [x2, y2] = coords[(i + 1) % n];
        edges.push({ x1, y1, x2, y2 });
    }

    // Determine number of workers (use navigator.hardwareConcurrency or default to 4)
    const maxWorkers = navigator.hardwareConcurrency || 4;
    //const maxWorkers = Math.floor(navigator.hardwareConcurrency / 2);

    // Create more chunks than workers for better progress feedback
    // Each chunk will be smaller, so we get more frequent updates
    const chunksPerWorker = 4; // Adjust this for more/less granular feedback
    const numChunks = maxWorkers * chunksPerWorker;
    const chunkSize = Math.ceil(n / numChunks);

    console.log(`Using up to ${maxWorkers} workers with ${numChunks} total chunks (${chunkSize} vertices per chunk)`);

    const allChunks = [];
    for (let c = 0; c < numChunks; c++) {
        const startIdx = c * chunkSize;
        const endIdx = Math.min((c + 1) * chunkSize, n);
        if (startIdx >= n) break;
        allChunks.push({ startIdx, endIdx, chunkId: c });
    }

    console.log(`Created ${allChunks.length} chunks to process`);

    let completedChunks = 0;
    let currentBestArea = 0;
    const activeWorkers = new Set();
    const promises = [];

    // Process chunks with a worker pool
    let nextChunkIdx = 0;

    function processNextChunk() {
        if (nextChunkIdx >= allChunks.length) return null;

        const chunk = allChunks[nextChunkIdx++];
        const worker = new Worker('./09-worker.js');
        activeWorkers.add(worker);

        const promise = new Promise((resolve, reject) => {
            worker.onmessage = (e) => {
                completedChunks++;
                const percent = Math.floor((completedChunks / allChunks.length) * 100);
                const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

                if (e.data.bestArea > currentBestArea) {
                    currentBestArea = e.data.bestArea;
                    console.log(`✓ Chunk ${chunk.chunkId} (${percent}%): NEW BEST AREA ${e.data.bestArea} [${elapsed}s]`);
                } else {
                    console.log(`✓ Chunk ${chunk.chunkId} (${percent}%): ${e.data.processed} pairs [${elapsed}s]`);
                }

                activeWorkers.delete(worker);
                worker.terminate();
                resolve(e.data);

                // Start next chunk if available
                const next = processNextChunk();
                if (next) promises.push(next);
            };

            worker.onerror = (error) => {
                console.error(`✗ Chunk ${chunk.chunkId} error:`, error);
                activeWorkers.delete(worker);
                reject(error);
            };
        });

        // Send work to worker
        worker.postMessage({
            coords,
            edges,
            startIdx: chunk.startIdx,
            endIdx: chunk.endIdx,
            currentBestArea: 0
        });

        return promise;
    }

    // Start initial batch of workers
    for (let i = 0; i < Math.min(maxWorkers, allChunks.length); i++) {
        const promise = processNextChunk();
        if (promise) promises.push(promise);
    }

    // Wait for all chunks to complete
    console.log('Processing chunks...');
    let results;
    try {
        results = await Promise.all(promises);
    } catch (error) {
        console.error('Worker error:', error);
        // Terminate all active workers
        activeWorkers.forEach(w => w.terminate());
        return;
    }

    // Find the best result across all workers
    let bestArea = 0;
    let bestRect = null;
    let totalProcessed = 0;

    for (const result of results) {
        totalProcessed += result.processed;
        if (result.bestArea > bestArea) {
            bestArea = result.bestArea;
            bestRect = result.bestRect;
        }
    }

    const totalElapsed = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`Total pairs processed: ${totalProcessed}`);
    console.log(`largest rectangle area: ${bestArea} (completed in ${totalElapsed}s)`);
    console.log(`largest rectangle corners:`, bestRect);

    // Visualize the result
    visualizePolygonAndRectangle(coords, bestRect, `Part 2 Parallel: Best Rectangle (Area: ${bestArea})`);
}

analyze();
part1();
//part2();
part2Parallel();
