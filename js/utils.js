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

////

export function times(n) {
    return Array(n).fill(0).map((_, i) => i);
}

export class Matrix {
    constructor(rows, cols, fill = undefined) {
        this.rows = rows;
        this.cols = cols;
        this.data = Array(rows).fill(0).map(() => Array(cols).fill(fill));
    }

    get(row, col) {
        return this.data[row][col];
    }

    set(row, col, value) {
        this.data[row][col] = value;
    }

    positions() {
        const res = [];
        for (let row = 0; row < this.rows; ++row) {
            for (let col = 0; col < this.cols; ++col) {
                res.push([row, col]);
            }
        }
        return res;
    }

    neightbors4(row, col) {
        const n = [];
        if (row > 0) n.push([row - 1, col]);
        if (row < this.rows - 1) n.push([row + 1, col]);
        if (col > 0) n.push([row, col - 1]);
        if (col < this.cols - 1) n.push([row, col + 1]);
        return n;
    }

    neightbors8(row, col) {
        const n = [];
        for (let r = row - 1; r <= row + 1; ++r) {
            for (let c = col - 1; c <= col + 1; ++c) {
                if (r === row && c === col) continue;
                if (r < 0 || r >= this.rows) continue;
                if (c < 0 || c >= this.cols) continue;
                n.push([r, c]);
            }
        }
        return n;
    }

    mapPositions(positions) {
        return positions.map(([row, col]) => this.get(row, col));
    }

    toString() {
        return this.data.map(row => row.join('')).join('\n');
    }

    clone() {
        const m2 = new Matrix(this.rows, this.cols);
        m2.data = structuredClone(this.data);
        return m2;
    }
}

export function matrixFromLines(lines) {
    const rows = lines.length;
    const cols = lines[0].length;
    const m = new Matrix(rows, cols);
    lines.forEach((line, row) => {
        line.split('').forEach((cell, col) => {
            m.set(row, col, cell);
        });
    });
    return m;
}
