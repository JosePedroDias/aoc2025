import { fetchPuzzle, permutations2, times, dist3 } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    const points = data.split('\n');
    return points.map(p => p.split(',').map(Number));
}

const points = await parseData('08a');

function analyze() {
    console.warn('count:', points.length);
    const limits = [Infinity, -Infinity];
    points.forEach(([a, b]) => {
        limits[0] = Math.min(limits[0], a, b);
        limits[1] = Math.max(limits[1], a, b);
    });
    console.warn('limits:', limits);
}

function arrayOfSetsToString(arr) {
    const buffer = [];
    arr.forEach((set, i) => {
        buffer.push(`#${i}: ${Array.from(set).join(',')}\n`);
    });
    return buffer.join('') + '\n';
}

function part1() {
    console.log('\npart1');
    const N = points.length;
    console.log(`N: ${N}`);
    //console.log(`points:\n${points.map((p, i) => '#' + i + ' ' + p.join(',')).join('\n')}`);
    const perms = permutations2(N);
    console.log(`# perms: ${perms.length}`);
    //console.log(perms);
    let clusters = times(N).map((i) => new Set([i]));
    //console.log(`initial clusters:\n${arrayOfSetsToString(clusters)}`);
    const dists = perms.map(([i, j]) => ({i, j, dist: dist3(points[i], points[j]) }));
    dists.sort((a, b) => a.dist - b.dist);

    const connectionsLeft = 1000;

    dists.splice(connectionsLeft, dists.length - connectionsLeft);// TODO temp keep 10 shortest
    //console.log(dists);

    for (let {i, j, dist} of dists) {
        const clusterOfI = clusters.find(c => c.has(i));
        const clusterOfJ = clusters.find(c => c.has(j));
        const clusterOfIIndex = clusters.indexOf(clusterOfI);
        const clusterOfJIndex = clusters.indexOf(clusterOfJ);
        console.warn(`** i ${i} [${points[i]}] (c: ${clusterOfIIndex}), j ${j} [${points[j]}] (c: ${clusterOfJIndex}) (${dist.toFixed(1)})**`);
        if (clusterOfIIndex === clusterOfJIndex) {
            console.warn(`i and j are in the same cluster. nothing to do.`);
        } else {
            const mergedCluster = new Set([...clusterOfI, ...clusterOfJ]);
            console.warn(`joining clusters #${clusterOfIIndex} with #${clusterOfJIndex}...`);
            clusters = clusters.filter(c => c !== clusterOfI && c !== clusterOfJ);
            clusters.push(mergedCluster);
        }
        //console.log(`clusters:\n${arrayOfSetsToString(clusters)}`);
    }
    console.log(`final clusters:\n${arrayOfSetsToString(clusters)}`);
    const clusterSizes = clusters.map(c => c.size);
    clusterSizes.sort((a, b) => b - a); // sort descending
    console.log(`clusterSizes: ${clusterSizes}`);
    const factorThreeLargest = clusterSizes.slice(0, 3).reduce((a, b) => a * b, 1);
    console.log(`factorThreeLargest: ${factorThreeLargest}`);
}

function part2() {
    console.log('\npart2');
    const N = points.length;
    console.log(`N: ${N}`);
    //console.log(`points:\n${points.map((p, i) => '#' + i + ' ' + p.join(',')).join('\n')}`);
    const perms = permutations2(N);
    console.log(`# perms: ${perms.length}`);
    //console.log(perms);
    let clusters = times(N).map((i) => new Set([i]));
    //console.log(`initial clusters:\n${arrayOfSetsToString(clusters)}`);
    const dists = perms.map(([i, j]) => ({i, j, dist: dist3(points[i], points[j]) }));
    dists.sort((a, b) => a.dist - b.dist);
    //console.log(dists);

    for (let {i, j, dist} of dists) {
        const clusterOfI = clusters.find(c => c.has(i));
        const clusterOfJ = clusters.find(c => c.has(j));
        const clusterOfIIndex = clusters.indexOf(clusterOfI);
        const clusterOfJIndex = clusters.indexOf(clusterOfJ);
        console.warn(`** i ${i} [${points[i]}] (c: ${clusterOfIIndex}), j ${j} [${points[j]}] (c: ${clusterOfJIndex}) (${dist.toFixed(1)})**`);
        if (clusterOfIIndex === clusterOfJIndex) {
            console.warn(`i and j are in the same cluster. nothing to do.`);
        } else {
            const mergedCluster = new Set([...clusterOfI, ...clusterOfJ]);
            console.warn(`joining clusters #${clusterOfIIndex} with #${clusterOfJIndex}...`);
            clusters = clusters.filter(c => c !== clusterOfI && c !== clusterOfJ);
            clusters.push(mergedCluster);
            if (clusters.length === 1) {
                console.warn(`all clusters merged!`);
                const xi = points[i][0];
                const xj = points[j][0];
                console.log(`xi: ${xi}, xj: ${xj}, xi*xj: ${xi * xj}`);
                break;
            }
        }
        //console.log(`clusters:\n${arrayOfSetsToString(clusters)}`);
    }
    console.log(`final clusters:\n${arrayOfSetsToString(clusters)}`);
}

analyze();
part1();
part2();
