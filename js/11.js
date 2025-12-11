import { fetchPuzzle } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    const lines = data.split('\n');
    const m = new Map();
    lines.forEach(line => {
        const [name, rest] = line.split(': ');
        const targets = rest.split(' ');
        m.set(name, targets);
    });
    return m;

}

let m = await parseData('11');

function analyze() {
    console.log('m', m);
    console.log('m.size', m.size);
    const maxDests = Math.max(...[...m.values()].map(arr => arr.length));
    console.log('maxDests', maxDests);

    //console.warn(`digraph:`);
    const gv = `digraph G {
${[...m.entries()].map(([source, targets]) => targets.map(t => `  ${source} -> ${t};`).join('\n')).join('\n')}
}`;
    //console.log(gv);
    //window.gv = gv;
    //console.log(`dot -Tsvg 11a.gv -o 11a.svg`);
}

// bidirectional BFS: search from both ends and meet in the middle
function pathsFromAToB(a, b, maxDepth = 15, findAll = true, maxPaths = 100000) {
    // Build reverse graph for backward search
    const reverseM = new Map();
    for (const [source, targets] of m.entries()) {
        for (const target of targets) {
            if (!reverseM.has(target)) {
                reverseM.set(target, []);
            }
            reverseM.get(target).push(source);
        }
    }

    // Forward search: paths from A
    // Store both the path array and a Set for O(1) loop detection
    const forwardPaths = new Map(); // node -> array of {path, visited} objects
    forwardPaths.set(a, [{ path: [a], visited: new Set([a]) }]);
    const forwardQueue = [{ path: [a], visited: new Set([a]) }];

    // Backward search: paths to B (stored in reverse)
    const backwardPaths = new Map(); // node -> array of {path, visited} objects
    backwardPaths.set(b, [{ path: [b], visited: new Set([b]) }]);
    const backwardQueue = [{ path: [b], visited: new Set([b]) }];

    const completePaths = [];
    const meetingNodes = new Set();

    // Alternate between forward and backward search
    let forwardDepth = 0;
    let backwardDepth = 0;

    while ((forwardQueue.length > 0 || backwardQueue.length > 0) &&
           forwardDepth + backwardDepth < maxDepth) {

        // Forward step
        if (forwardQueue.length > 0 && forwardDepth <= backwardDepth) {
            const batchSize = forwardQueue.length;
            for (let i = 0; i < batchSize; i++) {
                const { path, visited } = forwardQueue.shift();
                const currentNode = path[path.length - 1];

                // Check if we've met the backward search
                if (backwardPaths.has(currentNode)) {
                    meetingNodes.add(currentNode);
                }

                const targets = m.get(currentNode);
                if (targets) {
                    for (const target of targets) {
                        if (!visited.has(target)) {
                            const newPath = [...path, target];
                            const newVisited = new Set(visited);
                            newVisited.add(target);
                            const pathObj = { path: newPath, visited: newVisited };

                            if (!forwardPaths.has(target)) {
                                forwardPaths.set(target, []);
                            }
                            forwardPaths.get(target).push(pathObj);
                            forwardQueue.push(pathObj);
                        }
                    }
                }
            }
            forwardDepth++;
        }

        // Backward step
        if (backwardQueue.length > 0 && backwardDepth < forwardDepth) {
            const batchSize = backwardQueue.length;
            for (let i = 0; i < batchSize; i++) {
                const { path, visited } = backwardQueue.shift();
                const currentNode = path[path.length - 1];

                // Check if we've met the forward search
                if (forwardPaths.has(currentNode)) {
                    meetingNodes.add(currentNode);
                }

                const sources = reverseM.get(currentNode);
                if (sources) {
                    for (const source of sources) {
                        if (!visited.has(source)) {
                            const newPath = [...path, source];
                            const newVisited = new Set(visited);
                            newVisited.add(source);
                            const pathObj = { path: newPath, visited: newVisited };

                            if (!backwardPaths.has(source)) {
                                backwardPaths.set(source, []);
                            }
                            backwardPaths.get(source).push(pathObj);
                            backwardQueue.push(pathObj);
                        }
                    }
                }
            }
            backwardDepth++;
        }
    }

    // Combine paths at meeting nodes
    for (const meetingNode of meetingNodes) {
        const forwardPathsToMeeting = forwardPaths.get(meetingNode) || [];
        const backwardPathsFromMeeting = backwardPaths.get(meetingNode) || [];

        for (const fPathObj of forwardPathsToMeeting) {
            for (const bPathObj of backwardPathsFromMeeting) {
                // bPath is reversed (from meeting to b), so reverse it
                const reversedBPath = [...bPathObj.path].reverse();
                // Combine: fPath goes to meeting, reversedBPath goes from meeting to b
                // Skip the duplicate meeting node
                const completePath = [...fPathObj.path, ...reversedBPath.slice(1)];
                completePaths.push(completePath);

                // If we only want the first path, return immediately
                if (!findAll) {
                    return completePaths;
                }

                // Limit total paths to prevent memory explosion
                if (completePaths.length >= maxPaths) {
                    console.warn(`Reached maxPaths limit (${maxPaths}) for ${a} → ${b}`);
                    return completePaths;
                }
            }
        }
    }

    return completePaths;
}

function part1() {
    console.warn("\npart1");
    const paths = pathsFromAToB('you', 'out', 15);
    console.log('paths', paths);
    console.log('paths.length (answer 1)', paths.length);
}

function part2() {
    console.warn("\npart2");

    console.log('\n=== Iteratively searching with increasing depth ===');

    // Precompute reachability: which nodes can reach each target?
    function computeReachability(targets) {
        const canReach = new Map(); // target -> Set of nodes that can reach it

        // Build reverse graph
        const reverseM = new Map();
        for (const [source, dests] of m.entries()) {
            for (const dest of dests) {
                if (!reverseM.has(dest)) reverseM.set(dest, []);
                reverseM.get(dest).push(source);
            }
        }

        for (const target of targets) {
            const reachable = new Set([target]);
            const queue = [target];

            while (queue.length > 0) {
                const node = queue.shift();
                const sources = reverseM.get(node) || [];
                for (const src of sources) {
                    if (!reachable.has(src)) {
                        reachable.add(src);
                        queue.push(src);
                    }
                }
            }

            canReach.set(target, reachable);
        }

        return canReach;
    }

    // Precompute reachability for all waypoints we care about
    const reachability = computeReachability(['fft', 'dac', 'out']);
    console.log('Precomputed reachability');

    // Count paths from A to B, avoiding visited nodes, with depth limit
    function countSegmentPaths(from, to, visited, maxDepth, reachableSet) {
        let count = 0;

        function dfs(node, depth) {
            if (node === to) {
                count++;
                return;
            }

            if (depth >= maxDepth) return;
            if (!reachableSet.has(node)) return; // pruning

            const targets = m.get(node);
            if (!targets) return;

            for (const t of targets) {
                if (!visited.has(t)) {
                    visited.add(t);
                    dfs(t, depth + 1);
                    visited.delete(t);
                }
            }
        }

        dfs(from, 0);
        return count;
    }

    // Enumerate paths from A to B
    function enumeratePaths(from, to, maxDepth, reachableSet, maxPaths = 100000) {
        const paths = [];

        function dfs(node, path) {
            if (node === to) {
                paths.push([...path]);
                return;
            }

            if (path.length >= maxDepth) return;
            if (paths.length >= maxPaths) return;
            if (!reachableSet.has(node)) return;

            const targets = m.get(node);
            if (!targets) return;

            for (const t of targets) {
                if (!path.includes(t)) {
                    path.push(t);
                    dfs(t, path);
                    path.pop();
                }
            }
        }

        dfs(from, [from]);
        return paths;
    }

    // First, let's check if segments can overlap at all
    console.log('\n=== Checking segment overlap potential ===');

    function bfsReachable(start, maxDepth = 20) {
        const reached = new Set([start]);
        let frontier = [start];
        for (let d = 0; d < maxDepth && frontier.length > 0; d++) {
            const next = [];
            for (const node of frontier) {
                for (const t of (m.get(node) || [])) {
                    if (!reached.has(t)) {
                        reached.add(t);
                        next.push(t);
                    }
                }
            }
            frontier = next;
        }
        return reached;
    }

    const fromSvr = bfsReachable('svr', 15);
    const fromFft = bfsReachable('fft', 15);
    const fromDac = bfsReachable('dac', 15);

    // What can reach fft, dac, out (backwards)?
    const toFft = reachability.get('fft');
    const toDac = reachability.get('dac');
    const toOut = reachability.get('out');

    // Nodes that could be in svr→fft paths
    const svrFftNodes = new Set([...fromSvr].filter(n => toFft.has(n)));
    // Nodes that could be in fft→dac paths
    const fftDacNodes = new Set([...fromFft].filter(n => toDac.has(n)));
    // Nodes that could be in dac→out paths
    const dacOutNodes = new Set([...fromDac].filter(n => toOut.has(n)));

    // Check overlaps
    const overlap1 = [...svrFftNodes].filter(n => fftDacNodes.has(n) && n !== 'fft');
    const overlap2 = [...fftDacNodes].filter(n => dacOutNodes.has(n) && n !== 'dac');
    const overlap3 = [...svrFftNodes].filter(n => dacOutNodes.has(n));

    console.log(`  svr→fft zone: ${svrFftNodes.size} nodes`);
    console.log(`  fft→dac zone: ${fftDacNodes.size} nodes`);
    console.log(`  dac→out zone: ${dacOutNodes.size} nodes`);
    console.log(`  Overlap (svr→fft) ∩ (fft→dac): ${overlap1.length} nodes`);
    console.log(`  Overlap (fft→dac) ∩ (dac→out): ${overlap2.length} nodes`);
    console.log(`  Overlap (svr→fft) ∩ (dac→out): ${overlap3.length} nodes`);

    if (overlap1.length === 0 && overlap2.length === 0 && overlap3.length === 0) {
        console.log('\n✓ NO OVERLAP! We can just multiply segment counts!');

        // Count paths without storing them (no limit issues)
        function countPaths(from, to, maxDepth, reachableSet) {
            let count = 0;
            function dfs(node, visited, depth) {
                if (node === to) {
                    count++;
                    return;
                }
                if (depth >= maxDepth) return;
                if (!reachableSet.has(node)) return;

                const targets = m.get(node);
                if (!targets) return;

                for (const t of targets) {
                    if (!visited.has(t)) {
                        visited.add(t);
                        dfs(t, visited, depth + 1);
                        visited.delete(t);
                    }
                }
            }
            dfs(from, new Set([from]), 0);
            return count;
        }

        // Test convergence with increasing depths
        console.log('\n  Testing convergence...');

        for (const [d1, d2, d3] of [[12, 20, 12], [15, 25, 15], [18, 30, 18]]) {
            const start = Date.now();
            const c1 = countPaths('svr', 'fft', d1, toFft);
            const c2 = countPaths('fft', 'dac', d2, toDac);
            const c3 = countPaths('dac', 'out', d3, toOut);
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);
            console.log(`  [${d1},${d2},${d3}]: ${c1} × ${c2} × ${c3} = ${c1 * c2 * c3} (${elapsed}s)`);
        }

        return;
    }

    console.log('\n✗ Segments CAN overlap. Need full enumeration.');
    if (overlap1.length > 0) console.log(`  Overlap nodes (seg1∩seg2): ${overlap1.slice(0, 10).join(', ')}...`);
    if (overlap2.length > 0) console.log(`  Overlap nodes (seg2∩seg3): ${overlap2.slice(0, 10).join(', ')}...`);
    if (overlap3.length > 0) console.log(`  Overlap nodes (seg1∩seg3): ${overlap3.slice(0, 10).join(', ')}...`);

    // ========== MANUALLY ADJUST THESE VALUES ==========
    // Ordering 1: svr → fft → dac → out
    const A1 = 9;   // svr → fft depth
    const A2 = 14;  // fft → dac depth
    const A3 = 10;  // dac → out depth

    // Ordering 2: svr → dac → fft → out
    const B1 = 14;  // svr → dac depth
    const B2 = 9;   // dac → fft depth
    const B3 = 9;   // fft → out depth
    // ==================================================

    function countOrdering(name, seg1, d1, d1Name, seg2, d2, d2Name, seg3, d3, d3Name) {
        console.log(`\n${name} with depths [${d1Name}=${d1}, ${d2Name}=${d2}, ${d3Name}=${d3}]`);

        const [from1, to1] = seg1;
        const [from2, to2] = seg2;
        const [from3, to3] = seg3;

        const start1 = Date.now();
        const firstPaths = enumeratePaths(from1, to1, d1, reachability.get(to1));
        const elapsed1 = ((Date.now() - start1) / 1000).toFixed(2);

        if (firstPaths.length === 0) {
            console.log(`  ❌ ${from1}→${to1}: 0 paths (${elapsed1}s) → INCREASE ${d1Name}`);
            return 0;
        }
        console.log(`  ✓ ${from1}→${to1}: ${firstPaths.length} paths (${elapsed1}s)`);

        let totalCount = 0;
        let seg2Count = 0;  // Track how many seg2 paths we find
        let seg3Count = 0;  // Track how many seg3 paths we find
        let processed = 0;
        const start2 = Date.now();

        for (const path1 of firstPaths) {
            processed++;
            if (processed % 500 === 0 || processed === 1) {
                const elapsed = ((Date.now() - start2) / 1000).toFixed(1);
                console.log(`  Processing ${processed}/${firstPaths.length}, seg2: ${seg2Count}, seg3: ${seg3Count}, total: ${totalCount} (${elapsed}s)`);
            }

            const visited1 = new Set(path1);

            function dfs(node, path) {
                if (node === to2) {
                    seg2Count++;
                    const combinedVisited = new Set([...visited1, ...path]);
                    const seg3Paths = countSegmentPaths(from3, to3, combinedVisited, d3, reachability.get(to3));
                    seg3Count += seg3Paths;
                    totalCount += seg3Paths;
                    return;
                }

                if (path.length >= d2) return;
                if (!reachability.get(to2).has(node)) return;

                const targets = m.get(node);
                if (!targets) return;

                for (const t of targets) {
                    if (!visited1.has(t) && !path.includes(t)) {
                        path.push(t);
                        dfs(t, path);
                        path.pop();
                    }
                }
            }

            dfs(from2, [from2]);
        }

        const elapsed = ((Date.now() - start2) / 1000).toFixed(1);

        if (seg2Count === 0) {
            console.log(`  ❌ ${from2}→${to2}: 0 paths found → INCREASE ${d2Name}`);
        } else {
            console.log(`  ✓ ${from2}→${to2}: ${seg2Count} paths`);
        }

        if (seg3Count === 0 && seg2Count > 0) {
            console.log(`  ❌ ${from3}→${to3}: 0 paths found → INCREASE ${d3Name}`);
        } else if (seg2Count > 0) {
            console.log(`  ✓ ${from3}→${to3}: ${seg3Count} paths`);
        }

        console.log(`  Result: ${totalCount} total paths (${elapsed}s)`);
        return totalCount;
    }

    // Try ordering 1: svr → fft → dac → out
    const count1 = countOrdering(
        'svr → fft → dac → out',
        ['svr', 'fft'], A1, 'A1',
        ['fft', 'dac'], A2, 'A2',
        ['dac', 'out'], A3, 'A3'
    );

    // Try ordering 2: svr → dac → fft → out
    const count2 = countOrdering(
        'svr → dac → fft → out',
        ['svr', 'dac'], B1, 'B1',
        ['dac', 'fft'], B2, 'B2',
        ['fft', 'out'], B3, 'B3'
    );

    console.log('\n=== TOTAL ===');
    console.log(`Ordering 1 (fft first): ${count1}`);
    console.log(`Ordering 2 (dac first): ${count2}`);
    console.log(`Combined: ${count1 + count2}`);
}

analyze();
part1();
part2();
