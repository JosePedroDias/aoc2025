function fetchData(name) {
    return fetch(`../puzzles/${name}.txt`)
        .then(res => res.text())
        .then(data => {
            let lines = data.split('\n');
            if (lines[lines.length - 1] === '') lines.pop();
            return lines.map(line => {
                const dir = line[0];
                const delta = parseInt(line.slice(1));
                return [dir, delta];
            });
        });
}

const items = await fetchData('01a');

function analyze() {
    const dirs = new Set();
    const deltaLimits = [Infinity, -Infinity]; // MISTAKE: assume abs(delta) < 100!
    items.forEach(([dir, delta]) => {
        dirs.add(dir);
        deltaLimits[0] = Math.min(deltaLimits[0], delta);
        deltaLimits[1] = Math.max(deltaLimits[1], delta);
    });
    console.warn(`dirs:        ${[...dirs]}`);
    console.warn(`deltaLimits: ${deltaLimits}`);
}

function times(n) {
    return Array(n).fill(0).map((_, i) => i);
}

function part1() {
    let p = 50;
    let zeroes = 0;
    items.forEach(([dir, delta]) => {
        if (dir === 'R') p = (p + delta)       % 100;
        else             p = (p - delta + 100) % 100;
        if (p === 0) zeroes++;
    });
    console.log(`part1 | p: ${p}, zeroes: ${zeroes}`);
}

function part2() {
    let p = 50;
    let zeroes = 0;
    items.forEach(([dir, delta]) => {
        times(delta).forEach(() => {
            if (dir == 'R') p += 1;
            else            p -= 1;
            p = (p + 100) % 100;
            if (p === 0) ++zeroes;
        });
    });
    console.log(`part2 | p: ${p}, zeroes: ${zeroes}`);
}

analyze();
part1();
part2();
