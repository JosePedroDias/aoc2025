export function times(n) {
    return Array(n).fill(0).map((_, i) => i);
}

export function fetchPuzzle2(name) {
    import('fs').then(fs => {
        const data = fs.readFileSync(`../puzzles/${name}.txt`).toString().trim();
        return data;
    });
}

export function fetchPuzzle(name) {
    return fetch(`../puzzles/${name}.txt`)
        .then(res => res.text())
        .then(data => data.trim());
}
