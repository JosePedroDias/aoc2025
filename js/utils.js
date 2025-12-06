export function times(n) {
    return Array(n).fill(0).map((_, i) => i);
}

export function fetchPuzzle(name) {
    return fetch(`../puzzles/${name}.txt`)
        .then(res => res.text())
        .then(data => data.trim());
}
