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

export function enumerate(arr) {
    return arr.map((v, i) => [i, v]);
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

    isCell(row, col, v) {
        return this.data[row][col] === v;
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

    row(rIdx) {
        return this.data[rIdx];
    }

    column(cIdx) {
        return this.data.map(row => row[cIdx]);
    }

    subMatrix(r0, c0, r1, c1) {
        const m2 = new Matrix(r1 - r0, c1 - c0);
        for (let row = r0; row < r1; ++row) {
            for (let col = c0; col < c1; ++col) {
                m2.set(row - r0, col - c0, this.get(row, col));
            }
        }
        return m2;
    }

    forEach(fn) {
        for (let [row, col] of this.positions()) {
            fn([row, col], this.get(row, col));
        }
    }

    forEachRowIndex(fn) {
        for (let row = 0; row < this.rows; ++row) {
            fn(row) // , this.row(row));
        }
    }

    forEachColIndex(fn) {
        for (let col = 0; col < this.cols; ++col) {
            fn(col) // , this.column(col));
        }
    }
    
    transpose() {
        const m2 = new Matrix(this.cols, this.rows);
        for (let [row, col] of this.positions()) {
            m2.set(col, row, this.get(row, col));
        }
        return m2;
    }

    invertRows() {
        const m2 = new Matrix(this.rows, this.cols);
        for (let [row, col] of this.positions()) {
            m2.set(this.rows - row - 1, col, this.get(row, col));
        }
        return m2;
    }

    invertColumns() {
        const m2 = new Matrix(this.rows, this.cols);
        for (let [row, col] of this.positions()) {
            m2.set(row, this.cols - col - 1, this.get(row, col));
        }
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

export class SetOf {
    constructor(serializeKeyFn, deserializeKeyFn) {
        this.set = new Set();
        this.serializeKeyFn = serializeKeyFn || JSON.stringify;
        this.deserializeKeyFn = deserializeKeyFn || JSON.parse;
    }

    add(data) {
        const key = this.serializeKeyFn(data);
        this.set.add(key);
    }

    forEach(fn) {
        for (let key of this.set.keys()) {
            fn(this.deserializeKeyFn(key));
        }
    }

    map(fn) {
        const s2 = new SetOf(this.serializeKeyFn, this.deserializeKeyFn);
        for (let key of this.set.keys()) {
            const data = this.deserializeKeyFn(key);
            const data2 = fn(data);
            s2.add(data2);
        }
        return s2;
    }

    has(data) {
        const key = this.serializeKeyFn(data);
        return this.set.has(key);
    }

    numKeys() {
        return this.set.size;
    }

    getArray() {
        return Array.from(this.set).map(key => this.deserializeKeyFn(key));
    }

    // TODO: confirm correctness
    clone() {
        const s2 = new SetOf(this.serializeKeyFn, this.deserializeKeyFn);
        for (let key of this.set.keys()) {
            s2.set.add(key);
        }
        return s2;
    }

    emptyClone() {
        return new SetOf(this.serializeKeyFn, this.deserializeKeyFn);
    }
}


export class HistogramOf {
    constructor(serializeKeyFn, deserializeKeyFn) {
        this.map = new Map();
        this.serializeKeyFn = serializeKeyFn;
        this.deserializeKeyFn = deserializeKeyFn
    }

    inc(data) {
        const key = this.serializeKeyFn(data);
        const value = this.map.get(key) || 0;
        this.map.set(key, value + 1);
    }

    add(data, deltaValue) {
        const key = this.serializeKeyFn(data);
        const value = this.map.get(key) || 0;
        this.map.set(key, value + deltaValue);
    }

    get(data) {
        const key = this.serializeKeyFn(data);
        return this.map.get(key) || 0;
    }

    doesKeyExist(data) {
        const key = this.serializeKeyFn(data);
        return this.map.has(key);
    }

    forEach(fn) {
        for (let [key, value] of this.map.entries()) {
            fn(this.deserializeKeyFn(key), value);
        }
    }

    numKeys() {
        return this.map.size;
    }

    sum() {
        let sum = 0;
        for (let value of this.map.values()) sum += value;
        return sum;
    }

    // TODO confirm correctness
    clone() {
        const h2 = new HistogramOf(this.serializeKeyFn, this.deserializeKeyFn);
        for (let [key, value] of this.map.entries()) {
            h2.map.set(key, value);
        }
        return h2;
    }

    emptyClone() {
        return new HistogramOf(this.serializeKeyFn, this.deserializeKeyFn);
    }
}
