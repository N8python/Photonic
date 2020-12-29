const CHUNK_SIZE = 16;
let FULLBRIGHT = false;
let SHOW_CHUNK_BORDERS = false;
const dirt = document.getElementById("dirt");
const grass = document.getElementById("grass");
const stone = document.getElementById("stone");
const wood = document.getElementById("wood");
const leaves = document.getElementById("leaves");
const water = document.getElementById("water");
const sand = document.getElementById("sand");
const passables = [0, 2, 5, 6];
let blockMap = {
    0: {
        default: dirt
    },
    1: {
        default: stone
    },
    2: {
        default: grass
    },
    3: {
        default: wood
    },
    4: {
        default: leaves
    },
    5: {
        default: water
    },
    6: {
        default: sand
    }
};
let blockToughness = {
    1: 0.005,
    3: 0.01,
    4: 0.05
}

function Chunk({
    xPos,
    yPos,
    blocks: blockList,
    lights: lightList
}) {
    let quadrant = 0;
    if (xPos >= 0 && yPos >= 0) {
        quadrant = 0;
    } else if (xPos < 0 && yPos >= 0) {
        quadrant = 1;
    } else if (xPos < 0 && yPos < 0) {
        quadrant = 2;
    } else if (xPos >= 0 && yPos < 0) {
        quadrant = 3;
    }
    const noiseFactor = 4;
    let blocks = blockList;
    if (!blockList) {
        blocks = [];
        const trees = Math.floor((random.noise(xPos, yPos, quadrant / noiseFactor) ** 2) * 5);
        const treeList = [];
        for (let i = 0; i < trees; i++) {
            treeList.push([Math.round(random.random(2, 13)), Math.round(random.random(2, 13))])
        }
        for (let y = 0; y < CHUNK_SIZE; y++) {
            blocks[y] = [];
            for (let x = 0; x < CHUNK_SIZE; x++) {
                const blockSeed = random.noise((xPos + x) / 12, (yPos + y) / 12, quadrant / noiseFactor);
                if (blockSeed < 0.26) {
                    blocks[y][x] = 1;
                } else if (blockSeed < 0.5) {
                    blocks[y][x] = 0;
                } else if (blockSeed < 0.74) {
                    blocks[y][x] = 2;
                } else {
                    blocks[y][x] = 1;
                }
                const waterProb = random.noise((xPos + x) / 25, (yPos + y) / 25, quadrant / noiseFactor);
                if (waterProb > 0.7) {
                    blocks[y][x] = 5;
                } else if (waterProb > 0.65 && passables.includes(blocks[y][x])) {
                    blocks[y][x] = 6;
                }
                //blocks[y][x] = < 0.5 ? 0 : 2;
            }
        }
        treeList.forEach(([x, y]) => {
            if (blocks[y][x] !== 5) {
                blocks[y][x] = 3;
                blocks[y][x + 1] = 3;
                blocks[y + 1][x + 1] = 3;
                blocks[y + 1][x] = 3;
                blocks[y - 1][x] = 4;
                blocks[y - 1][x + 1] = 4;
                blocks[y][x + 2] = 4;
                blocks[y + 1][x + 2] = 4;
                blocks[y][x - 1] = 4;
                blocks[y + 1][x - 1] = 4;
                blocks[y + 2][x] = 4;
                blocks[y + 2][x + 1] = 4;
            }
        });
    }
    const myLights = [];
    if (lightList) {
        lightList.forEach(light => {
            myLights.push(createSource(light.sourceX, light.sourceY, {
                strength: light.strength,
                level: light.level
            }));
        })
    }
    let loaded = true;
    return {
        load() {
            loaded = true;
            this.addLights();
        },
        unload() {
            loaded = false;
            this.removeLights();
        },
        removeLights() {
            myLights.forEach(light => {
                lights.splice(lights.indexOf(light), 1)
            });
            lightCache = generateLightCache();
        },
        addLights() {
            myLights.forEach(light => {
                light.computeIlluminated();
            })
            lights.push(...myLights);
            lightCache = generateLightCache();
        },
        withinBounds(x, y) {
            return x >= xPos && x < xPos + TILE_SIZE && y >= yPos && y < yPos + TILE_SIZE;
        },
        get loaded() {
            return loaded;
        },
        blocks,
        lights: myLights,
        get xPos() {
            return xPos;
        },
        get yPos() {
            return yPos;
        },
        setBlock(blockX, blockY, val) {
            blocks[blockY - yPos][blockX - xPos] = val;
        },
        blockAt(blockX, blockY) {
            return blocks[blockY - yPos][blockX - xPos];
        },
        createLight(lightX, lightY, args) {
            const light = createSource(lightX, lightY, args);
            light.computeIlluminated();
            myLights.push(light);
            lights.push(light);
            lightCache = generateLightCache();
        },
        render() {
            blocks.forEach((row, y) => {
                y = yPos + y;
                row.forEach((tile, x) => {
                    x = xPos + x;
                    if (FULLBRIGHT) {
                        ctx.drawImage(blockMap[tile].default, x * TILE_SIZE, y * TILE_SIZE);
                    } else {
                        const light = lightCache.find(([sourceX, sourceY]) => x === sourceX && y === sourceY);
                        if (light) {
                            const lightLevel = FULLBRIGHT ? 100 : Math.round(light[2] * 100);
                            if (!blockMap[tile][lightLevel]) {
                                ctx.filter = `brightness(${lightLevel}%)`;
                                ctx.drawImage(blockMap[tile].default, x * TILE_SIZE, y * TILE_SIZE);
                                ctx.filter = "brightness(100%)";
                                blockMap[tile][lightLevel] = ctx.getImageData(x * TILE_SIZE + canvas.width / 2 - Math.round(player.x * 16), y * TILE_SIZE + canvas.height / 2 - Math.round(player.y * 16), TILE_SIZE, TILE_SIZE);
                            } else {
                                ctx.putImageData(blockMap[tile][lightLevel], x * TILE_SIZE + canvas.width / 2 - Math.round(player.x * 16), y * TILE_SIZE + canvas.height / 2 - Math.round(player.y * 16), 0, 0, TILE_SIZE, TILE_SIZE);
                            }
                        }
                    }
                    /*if (tile === 0) {
                        ctx.fillStyle = "rgb(0, 0, 0)";
                        const light = lightCache.find(([sourceX, sourceY]) => x === sourceX && y === sourceY);
                        if (light) {
                            ctx.fillStyle = `rgb(${255 * light[2]}, ${255 * light[2]}, ${255 * light[2]})`;
                        }
                    }
                    if (tile === 1) {
                        ctx.fillStyle = "#964B00";
                        const light = lightCache.find(([sourceX, sourceY]) => x === sourceX && y === sourceY);
                        if (light) {
                            ctx.fillStyle = `rgb(${150 * light[2]}, ${75 * light[2]}, ${0 * light[2]})`;
                        } else {
                            ctx.fillStyle = "rgb(0, 0, 0)";
                        }
                    }*/
                    //ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                });
            });
            if (SHOW_CHUNK_BORDERS) {
                ctx.strokeStyle = "white";
                ctx.strokeRect(xPos * 16, yPos * 16, 16 * 16, 16 * 16);
            }
        },
        toJSON() {
            return {
                xPos,
                yPos,
                blocks,
                lights: myLights.map(light => light.toJSON())
            }
        }
    }
}
Chunk.loadChunks = () => {
    const chunksLoaded = [];
    const left = Math.floor(-(canvas.width / 2 - player.x * 16) / (16 * TILE_SIZE));
    const top = Math.floor(-(canvas.height / 2 - player.y * 16) / (16 * TILE_SIZE));
    for (let y = top; y < top + (canvas.height / TILE_SIZE) / 16 + 1; y++) {
        for (let x = left; x < left + (canvas.width / TILE_SIZE) / 16 + 1; x++) {
            const theChunk = chunks.find(chunk => (chunk.xPos / 16) === x && (chunk.yPos / 16) === y);
            if (!theChunk) {
                chunks.push(Chunk({
                    xPos: x * 16,
                    yPos: y * 16
                }))
            } else if (!theChunk.loaded) {
                theChunk.load();
            }
            chunksLoaded.push(theChunk);
        }
    }
    chunks.filter(chunk => !chunksLoaded.includes(chunk)).forEach(chunk => {
        if (chunk.loaded) {
            chunk.unload();
        }
    })
}
const blockAt = (x, y) => {
    const chunk = chunks.find(chunk => chunk.withinBounds(x, y));
    if (chunk) {
        return chunk.blockAt(x, y);
    } else {
        return undefined;
    }
}
const setBlock = (x, y, val) => {
    const chunk = chunks.find(chunk => chunk.withinBounds(x, y));
    chunk.setBlock(x, y, val);
}
const createLightSource = (x, y, args) => {
    const chunk = chunks.find(chunk => chunk.withinBounds(x, y));
    chunk.createLight(x, y, args);
}