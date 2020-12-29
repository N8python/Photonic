const neighbors = (tile) => {
    let neighbors = [
        [tile[0] - 1, tile[1]],
        [tile[0] + 1, tile[1]],
        [tile[0], tile[1] - 1],
        [tile[0], tile[1] + 1]
    ];
    neighbors = neighbors.filter(([x, y]) => {
        return x > 0 || x < canvas.width / TILE_SIZE || y > 0 || y < canvas.height / TILE_SIZE;
    });
    return neighbors;
};
const lightP = {
    0: 1, // dirt
    1: 3, // stone
    2: 1, // grass
    3: 2, // wood
    4: 1, // leaves
    5: 2, // water
    6: 1 // sand
}
const createSource = (tileX, tileY, {
    strength,
    level
}) => {
    return {
        sourceX: tileX,
        sourceY: tileY,
        strength,
        level,
        illuminated: [],
        toJSON() {
            return {
                sourceX: this.sourceX,
                sourceY: this.sourceY,
                strength: this.strength,
                level: this.level
            }
        },
        computeIlluminated() {
            const source = [this.sourceX, this.sourceY];
            const frontier = [source.toString()];
            const reached = new Set();
            const cameFrom = {};
            cameFrom[source.toString()] = null;
            reached.add(source.toString());
            while (frontier.length > 0) {
                let current = frontier.shift();
                current = current.split(",").map(x => +x);
                let stepDistance = 0;
                let counter = current.toString();
                while (cameFrom[counter] !== null) {
                    stepDistance += lightP[blockAt(+counter.split(",")[0], +counter.split(",")[1])];
                    counter = cameFrom[counter];
                }
                neighbors(current).forEach(next => {
                    const metroDist = stepDistance + 1;
                    if (!reached.has(next.toString()) && metroDist <= this.strength && blockAt(next[0], next[1]) !== undefined) {
                        //if (passables.includes(blockAt(next[0], next[1]))) {
                        frontier.push(next.toString());
                        //}
                        reached.add(next.toString());
                        cameFrom[next.toString()] = current.toString();
                    }
                });
            }
            this.illuminated = Array.from(reached).map(x => {
                const source = x.split(",").map(y => +y);
                let counter = source.toString();
                let stepDistance = 0;
                while (cameFrom[counter] !== null) {
                    stepDistance += lightP[blockAt(+counter.split(",")[0], +counter.split(",")[1])];
                    counter = cameFrom[counter];
                }
                source.push(this.level * (1 - (stepDistance) / (this.strength + 1)))
                return source;
            });
            //this.level * (1 - metroDist / this.strength)*/
        }
    };
}