import { fetchPuzzle, SetOf } from './utils.js';

async function parseData(name) {
    const data = await fetchPuzzle(name);
    const lines = data.split('\n');
    return lines.map(line => {
        const closeSq = line.indexOf(']');
        const openCurly = line.indexOf('{');

        const p1 = line.substring(1, closeSq);
        const p2 = line.substring(closeSq + 2, openCurly - 1);
        const p3 = line.substring(openCurly);
        //console.table({p1, p2, p3});

        const p11 = p1.split('').map(ch => ch === '#');
        const p22 = p2.replace(/[()]/g, '').split(' ').map(it => it.split(',').map(Number));
        const p33 = p3.substring(1, p3.length-1).split(',').map(Number);
        //console.log({p11, p22, p33});

        return [p11, p22, p33];
    });
}

const data = await parseData('10a');
console.log(data);

function analyze() {
    console.warn('count:', data.length);
    console.warn('p1 max length:', Math.max(...data.map(l => l[0].length)));
    console.warn('p2 max length:', Math.max(...data.map(l => l[1].length)));
    console.warn('p2 max it count:', Math.max(...data.map(l => l[1]).map(l => l.length)));
    console.warn('p3 max length:', Math.max(...data.map(l => l[2].length)));
}

function part1() {
    console.warn('\npart1');

    function solveLine(lightsGoal, whatButtonsToggle, _) {
        //console.warn({lightsGoal, whatButtonsToggle});

        const numButtons = whatButtonsToggle.length;
        
        const lights = lightsGoal.map(_ => false);
        
        function pressButton(i, lights) {
            const toggles = whatButtonsToggle[i];
            const newLights = [...lights];
            toggles.forEach(t => newLights[t] = !newLights[t]);
            return newLights;
        }

        function isDone(lights) {
            return lights.every((l, i) => l === lightsGoal[i]);
        }

        let froms = new SetOf();
        froms.add(lights);

        let numClicks = 0;
        while (true) {
            ++numClicks;
            const nextFroms = new SetOf();
            //console.log('froms', froms.getArray());
            for (let from of froms.getArray()) {
                //console.log(`  from ${from}`);
                for (let i = 0; i < numButtons; ++i) {
                    const to = pressButton(i, from);
                    //console.log(`    pressing #${i} resulted in ${to}`);
                    if (isDone(to)) {
                        console.log(`    DONE (${numClicks})!`);
                        return numClicks;
                    }
                    nextFroms.add(to);
                }
            }
            froms = nextFroms;
        }
    }

    let totalClicks = 0;
    for (let [lightsGoal, whatButtonsToggle, joltageReqs] of data) {
        totalClicks += solveLine(lightsGoal, whatButtonsToggle, joltageReqs);
    }
    console.log(totalClicks);
}

function part2() {
    console.log('\npart2');

    function solveLine(_, countersButtonsIncrease, countersGoal) {
        //console.warn({countersButtonsIncrease, countersGoal});

        const numButtons = countersButtonsIncrease.length;
        
        const counters = countersGoal.map(_ => 0);
        
        function pressButton(i, counters) {
            const increases = countersButtonsIncrease[i];
            const newCounters = [...counters];
            increases.forEach(t => ++newCounters[t]);
            return newCounters;
        }

        function isDone(counters) {
            return counters.every((l, i) => l === countersGoal[i]);
        }

        function isOver(counters) {
            return counters.some((l, i) => l > countersGoal[i]);
        }

        let froms = new SetOf();
        froms.add(counters);

        let numClicks = 0;
        while (true) {
            ++numClicks;
            const nextFroms = new SetOf();
            console.log(`clicks: ${numClicks}, from size: ${froms.size}`);
            //console.log('froms', froms.getArray());
            for (let from of froms.getArray()) {
                //console.log(`  from ${from}`);
                for (let i = 0; i < numButtons; ++i) {
                    const to = pressButton(i, from);
                    //console.log(`    pressing #${i} resulted in ${to}`);
                    if (isDone(to)) {
                        console.log(`    DONE (${numClicks})!`);
                        return numClicks;
                    }
                    if (isOver(to)) {
                        //console.log(`    OVER X`);
                    } else {
                        nextFroms.add(to);
                    }
                }
            }
            froms = nextFroms;
        }
    }

    let totalClicks = 0;
    for (let [lightsGoal, whatButtonsToggle, joltageReqs] of data) {
        totalClicks += solveLine(lightsGoal, whatButtonsToggle, joltageReqs);
    }
    console.log(totalClicks);
}

//analyze();
//part1();
part2();
