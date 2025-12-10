// Parse puzzle data
async function parseData(name) {
    const response = await fetch(`../puzzles/${name}.txt`);
    const data = await response.text();
    const lines = data.trim().split('\n');
    return lines.map(line => {
        const closeSq = line.indexOf(']');
        const openCurly = line.indexOf('{');
        const p1 = line.substring(1, closeSq);
        const p2 = line.substring(closeSq + 2, openCurly - 1);
        const p3 = line.substring(openCurly);
        const p11 = p1.split('').map(ch => ch === '#');
        const p22 = p2.replace(/[()]/g, '').split(' ').map(it => it.split(',').map(Number));
        const p33 = p3.substring(1, p3.length-1).split(',').map(Number);
        return [p11, p22, p33];
    });
}

// Convert a machine to LP format
function machineToLP(countersButtonsIncrease, countersGoal) {
    const numButtons = countersButtonsIncrease.length;
    const numCounters = countersGoal.length;

    // Objective: minimize sum of all button presses
    const objective = Array.from({length: numButtons}, (_, i) => `b${i}`).join(' + ');

    // Constraints: one per counter
    const constraints = [];
    for (let counter = 0; counter < numCounters; counter++) {
        const terms = [];
        for (let button = 0; button < numButtons; button++) {
            if (countersButtonsIncrease[button].includes(counter)) {
                terms.push(`b${button}`);
            }
        }
        if (terms.length > 0) {
            constraints.push(` counter${counter}: ${terms.join(' + ')} = ${countersGoal[counter]}`);
        }
    }

    // Bounds: all variables >= 0
    const bounds = Array.from({length: numButtons}, (_, i) => ` b${i} >= 0`).join('\n');

    // General: all variables are integers
    const general = ' ' + Array.from({length: numButtons}, (_, i) => `b${i}`).join(' ');

    return `Minimize
 obj: ${objective}
Subject To
${constraints.join('\n')}
Bounds
${bounds}
General
${general}
End`;
}

// Solve all machines
async function solveAll() {
    const data = await parseData('10a');  // Changed from '10a' to '10'
    const worker = new Worker("highs/worker.js");

    let machineIndex = 0;
    let totalPresses = 0;
    const results = [];

    function solveNext() {
        if (machineIndex >= data.length) {
            console.log('\n=== RESULTS ===');
            console.log(`Total machines: ${data.length}`);
            console.log(`Total button presses: ${totalPresses}`);
            return;
        }

        const [_, countersButtonsIncrease, countersGoal] = data[machineIndex];
        const lp = machineToLP(countersButtonsIncrease, countersGoal);

        if (machineIndex % 10 === 0) {
            console.log(`Processing machine ${machineIndex + 1}/${data.length}...`);
        }

        worker.postMessage(lp);
    }

    worker.onmessage = function ({ data: { solution, error } }) {
        if (solution && solution.Status === "Optimal") {
            const presses = Math.round(solution.ObjectiveValue);
            results.push(presses);
            totalPresses += presses;
            machineIndex++;
            solveNext();
        } else {
            console.error(`  Machine ${machineIndex + 1} - Error: ${error || 'No optimal solution'}`);
            results.push(0);
            machineIndex++;
            solveNext();
        }
    };

    worker.onerror = function (err) {
        console.error(`  Machine ${machineIndex + 1} - Worker error: ${err.message || err}`);
        results.push(0);
        machineIndex++;
        solveNext();
    };

    solveNext();
}

solveAll();
