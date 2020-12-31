p5.disableFriendlyErrors = true;

function xmur3(str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}
let seed = xmur3("apple")();
let paused = false;
const settings = document.getElementById("settings");
const canvas = document.getElementById("canvas");
let zoom = 1;
canvas.style.width = canvas.width + "px";
canvas.style.height = canvas.height + "px";
const zooms = {
    "Low": 1,
    "Medium Low": 1.2,
    "Medium": 1.4,
    "Medium High": 1.6,
    "High": 2
}
const zoomTo = (factor) => {
    if (typeof factor === "string") {
        factor = zooms[factor];
    }
    zoom = factor;
    canvas.width = 1008 / factor;
    canvas.height = 704 / factor;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    /*blockMap = {
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
    };*/
}
const ctx = canvas.getContext("2d");
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
/*for (let tile = 0; tile <= Math.max(...Object.keys(blockMap)); tile++) {
    for (let lightLevel = 0; lightLevel <= 100; lightLevel += 10) {
        ctx.filter = `brightness(${lightLevel}%)`;
        ctx.drawImage(blockMap[tile].default, 0, 0);
        blockMap[tile][lightLevel] = ctx.getImageData(0, 0, 16, 16);
    }
}*/
const TILE_SIZE = 16;
let chunks = [];
let lights = [];
let entities = [];
let selectedTile = undefined;
/*function setup() {
    createCanvas(0, 0);
    randomSeed(seed);
    noiseSeed(seed);
}*/
const random = new p5(p => {
    p.setup = () => {
        p.createCanvas(0, 0);
    }
});
random.randomSeed(seed);
random.noiseSeed(seed);
const generateLightCache = () => {
    const lightList = lights.flatMap(light => light.illuminated);
    const lightsToReturn = [];
    lightList.forEach(light => {
        const otherLight = lightsToReturn.find(([x, y]) => light[0] === x && light[1] === y);
        if (otherLight) {
            if (light[2] > otherLight[2]) {
                otherLight[2] = light[2];
            }
        } else {
            lightsToReturn.push(light);
        }
    });
    return lightsToReturn;
} /*Array.from(new Set(lights.flatMap(light => light.illuminated.map(x => x.toString())))).map(x => x.split(",").map(y => +y));*/
let lightCache = generateLightCache();
const keysPressed = {};
/*for (let y = 0; y < canvas.height / TILE_SIZE; y++) {
    blocks[y] = [];
    for (let x = 0; x < canvas.width / TILE_SIZE; x++) {
        blocks[y][x] = 0;
    }
}*/
for (let y = 0; y < (canvas.height / TILE_SIZE) / 16; y++) {
    for (let x = 0; x < (canvas.width / TILE_SIZE) / 16; x++) {
        chunks.push(Chunk({
            xPos: x * 16,
            yPos: y * 16
        }))
    }
}
let scene = "start";
let levelStorageIndex;
let tick = 0;
loadScene("Main Menu");
const statIcons = {
    health: document.getElementById("health"),
    food: document.getElementById("food"),
    water: document.getElementById("waterImg")
}
const craftingArrow = document.getElementById("craftingArrow");
let crafting = Array(6);
const statColors = {
    health: "rgb(255, 0, 0)",
    food: "rgb(255, 0, 255)",
    water: "rgb(0, 0, 255)"
}
const gameInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (scene === "play") {
        const stats = ["health", "food", "water"];
        stats.forEach((stat, i) => {
            ctx.drawImage(statIcons[stat], 2.5, 2.5 + 25 * i, 16, 16);
            ctx.fillStyle = statColors[stat];
            ctx.fillRect(2.5 + 16 + 4, 2.5 + 25 * i, 100 * player[stat] / player["max" + stat[0].toUpperCase() + stat.slice(1)], 16);
            ctx.strokeStyle = "white";
            ctx.strokeRect(2.5 + 16 + 4, 2.5 + 25 * i, 100, 16);
        });
        for (let i = 0; i < 16; i++) {
            ctx.strokeStyle = "white";
            if (player.inventory[i] && player.inventory[i].item) {
                player.inventory[i].item.draw(6.5, 2.5 + 75 + 24 * i, 24, 24);
                if (player.inventory[i].amount > 1) {
                    ctx.font = "12px monospace";
                    ctx.fillStyle = "white";
                    ctx.fillText(player.inventory[i].amount, 6.5 + 15 - (player.inventory[i].amount > 9 ? 7 : 0), 2.5 + 75 + 24 * i + 21);
                }
            }
            //if (i === player.inventorySelected) {
            //} else {
            ctx.strokeRect(6.5, 2.5 + 75 + 24 * i, 24, 24);
            //}
        }
        for (let i = 0; i < 6; i++) {
            ctx.strokeStyle = "white";
            ctx.strokeRect(6.5 + 24, 2.5 + 75 + 24 * i, 24, 24);
        }
        for (let i = 0; i < 6; i++) {
            ctx.strokeStyle = "white";
            if (crafting[i] && crafting[i].item) {
                crafting[i].item.draw(6.5 + 24, 2.5 + 75 + 24 * i, 24, 24);
                if (crafting[i].amount > 1) {
                    ctx.font = "12px monospace";
                    ctx.fillStyle = "white";
                    ctx.fillText(crafting[i].amount, 6.5 + 24 + 15 - (crafting[i].amount > 9 ? 7 : 0), 2.5 + 75 + 24 * i + 21);
                }
            }
            //if (i === player.inventorySelected) {
            //} else {
            ctx.strokeRect(6.5, 2.5 + 75 + 24 * i, 24, 24);
            //}
        }
        ctx.drawImage(craftingArrow, 6.5 + 24 + 4, 2.5 + 75 + 24 * 6 + 4, 16, 16);
        ctx.strokeRect(6.5 + 24, 2.5 + 75 + 24 * 7, 24, 24);
        const recipe = findRecipeMatch();
        if (recipe) {
            recipe[1][0].draw(6.5 + 24, 2.5 + 75 + 24 * 7, 24, 24);
            if (recipe[1][1] > 1) {
                ctx.font = "12px monospace";
                ctx.fillStyle = "white";
                ctx.fillText(recipe[1][1], 6.5 + 24 + 15 - (recipe[1][1] > 9 ? 7 : 0), 2.5 + 75 + 24 * 7 + 21);
            }
        }
        ctx.lineWidth = 3;
        ctx.strokeRect(6.5 + 0.75, 2.5 + 75 + 24 * (player.inventorySelected) + 1.5, 24 - 1.5, 24 - 1.5);
        ctx.lineWidth = 1;
        ctx.save();
        ctx.translate(canvas.width / 2 - player.x * 16, canvas.height / 2 - player.y * 16);
        chunks.forEach(chunk => {
            if (chunk.loaded) {
                chunk.render();
            }
        });
        Chunk.loadChunks();
        if (selectedTile) {
            ctx.strokeStyle = "white";
            ctx.strokeRect(selectedTile.x * TILE_SIZE, selectedTile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            if (mouseDown && !passables.includes(blockAt(selectedTile.x, selectedTile.y))) {
                //if (selectedTile.breakProgress < 1) {
                let breakSpeed = (blockToughness[blockAt(selectedTile.x, selectedTile.y)] ? blockToughness[blockAt(selectedTile.x, selectedTile.y)] : 0.01);
                if (player.water < 25) {
                    breakSpeed /= 2;
                }
                if (player.water < 12) {
                    breakSpeed /= 2;
                }
                if (player.water === 0) {
                    breakSpeed /= 2;
                }
                if (toolBoost[itemToString(player.item)]) {
                    breakSpeed *= toolBoost[itemToString(player.item)].amount;
                }
                selectedTile.breakProgress += breakSpeed;
                //} else if (selectedTile.breakProgress =)
                if (selectedTile.breakProgress >= 1) {
                    const blockVal = blockAt(selectedTile.x, selectedTile.y);
                    if (blockBreakMap[blockVal]) {
                        blockBreakMap[blockVal].forEach(breakMap => {
                            if (breakMap.length === 2) {
                                if (Math.random() < breakMap[0]) {
                                    entities.push(ItemEntity({
                                        sprite: breakMap[1],
                                        x: selectedTile.x,
                                        y: selectedTile.y
                                    }));
                                }
                            } else if (breakMap.length === 3) {
                                const amount = Math.floor(random.random(breakMap[0], breakMap[1] + 1));
                                entities.push(ItemEntity({
                                    sprite: breakMap[2],
                                    x: selectedTile.x,
                                    y: selectedTile.y,
                                    amount
                                }));
                            }
                        })
                    } else {
                        entities.push(ItemEntity({
                            sprite: blockItems[blockVal],
                            x: selectedTile.x,
                            y: selectedTile.y
                        }));
                    }
                    setBlock(selectedTile.x, selectedTile.y, 0);
                    selectedTile = undefined;
                }
            } else {
                selectedTile.breakProgress = 0;
            }
            if (selectedTile && mouseDown && blockAt(selectedTile.x, selectedTile.y) === 5) {
                if (player.water < player.maxWater) {
                    player.water += 0.1;
                }
            }
            if (selectedTile) {
                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.globalAlpha = 0.375;
                ctx.fillRect(
                    selectedTile.x * TILE_SIZE + TILE_SIZE / 2 - (TILE_SIZE * selectedTile.breakProgress / 2),
                    selectedTile.y * TILE_SIZE + TILE_SIZE / 2 - (TILE_SIZE * selectedTile.breakProgress / 2),
                    TILE_SIZE * selectedTile.breakProgress,
                    TILE_SIZE * selectedTile.breakProgress);
                ctx.globalAlpha = 1;
            }
            if (selectedTile && !(selectedTile.x >= (player.x - 3) && selectedTile.x <= (player.x + 2) && selectedTile.y >= (player.y - 3) && selectedTile.y <= (player.y + 2))) {
                selectedTile = undefined;
            }
        }
        entities.forEach(entity => {
            entity.draw();
        })
        player.draw();
        if (!paused) {
            player.move();
        }
        ctx.restore();
        tick++;
        if (tick % 30 === 0) {
            saveGame(levelStorageIndex);
        }
        settings.style.display = "block";
    } else {
        settings.style.display = "none";
    }

}, 30);

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

    return {
        x: (evt.clientX - rect.left) * scaleX - (canvas.width / 2 - player.x * 16), // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY - (canvas.height / 2 - player.y * 16) // been adjusted to be relative to element
    }
}

function pureMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(),
        scaleX = canvas.width / rect.width,
        scaleY = canvas.height / rect.height;

    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    }
}
let mouseDown = false;
canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    const { x: mouseX, y: mouseY } = pureMousePos(canvas, e);
    for (let i = 0; i < 16; i++) {
        if (mouseX > 6.5 && mouseX < 6.5 + 24 && mouseY > (2.5 + 75 + 24 * i) && mouseY < (2.5 + 75 + 24 * i) + 24) {
            if (e.button === 2) {
                const item = player.inventory[player.inventorySelected];
                if (item.item !== torch) {
                    if (!player.inventory[i]) {
                        player.inventory[i] = { item: item.item, amount: 1 };
                        item.amount--;
                    } else if (item.item === player.inventory[i].item && !unstackables.includes(item.item)) {
                        player.inventory[i].amount++;
                        item.amount--;
                    }
                    if (item.amount === 0) {
                        player.inventory[player.inventorySelected] = undefined;
                    }
                }
            } else {
                player.inventorySelected = i;
            }
        }
    }
    for (let i = 0; i < 6; i++) {
        if (mouseX > 6.5 + 24 && mouseX < 6.5 + 48 && mouseY > (2.5 + 75 + 24 * i) && mouseY < (2.5 + 75 + 24 * i) + 24) {
            if (e.button !== 2) {
                if (crafting[i]) {
                    player.placeInInventory(crafting[i].item, crafting[i].amount);
                    crafting[i] = undefined;
                }
            } else {
                const item = player.inventory[player.inventorySelected];
                if (item.item !== torch) {
                    if (!crafting[i]) {
                        crafting[i] = { item: item.item, amount: 1 };
                        item.amount--;
                    } else if (crafting[i].item === item.item && !unstackables.includes(item.item)) {
                        crafting[i].amount++;
                        item.amount--;
                    }
                    if (item.amount === 0) {
                        player.inventory[player.inventorySelected] = undefined;
                    }
                }
            }
        }
    }
    if (mouseX > 6.5 + 24 && mouseX < 6.5 + 48 && mouseY > (2.5 + 75 + 24 * 7) && mouseY < (2.5 + 75 + 24 * 7) + 24) {
        const recipe = findRecipeMatch();
        if (recipe) {
            player.placeInInventory(recipe[1][0], recipe[1][1]);
            recipe[0].forEach(([item, amount]) => {
                for (let i = 0; i < 6; i++) {
                    const craftItem = crafting[i];
                    if (craftItem && craftItem.item === item) {
                        craftItem.amount -= amount;
                        if (craftItem.amount < 0) {
                            amount += -craftItem.amount;
                            craftItem.amount = 0;
                        }
                    }
                    if (amount <= 0) {
                        break;
                    }
                    if (craftItem && craftItem.amount === 0) {
                        crafting[i] = undefined;
                    }
                }
            })
        }
    }
    if (e.button === 2) {
        const items = player.inventory[player.inventorySelected];
        if (selectedTile && blockItems.includes(items.item) && blockAt(selectedTile.x, selectedTile.y) !== blockItems.indexOf(items.item) && passables.includes(blockAt(selectedTile.x, selectedTile.y))) {
            items.amount -= 1;
            setBlock(selectedTile.x, selectedTile.y, blockItems.indexOf(items.item));
            if (items.amount === 0) {
                player.inventory[player.inventorySelected] = undefined;
            }
        }
    }
});
window.addEventListener("unload", () => {
    crafting.forEach(c => {
        player.placeInInventory(c.item, c.amount);
    });
})
canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
})
canvas.addEventListener("mouseup", () => {
    mouseDown = false;
});
canvas.addEventListener("mousemove", (e) => {
        const { x: mouseX, y: mouseY } = getMousePos(canvas, e);
        const tileX = Math.floor(mouseX / TILE_SIZE);
        const tileY = Math.floor(mouseY / TILE_SIZE);
        if (tileX >= (player.x - 3) && tileX <= (player.x + 2) && tileY >= (player.y - 3) && tileY <= (player.y + 2)) {
            let startX = Math.floor(player.x);
            let startY = Math.floor(player.y);
            let pathfindTick = 0;
            while (startX !== tileX || startY !== tileY) {
                if (startX === tileX || pathfindTick % 2 === 1) {
                    if (startY < tileY) {
                        startY += 1;
                    } else if (startY > tileY) {
                        startY -= 1;
                    }
                } else if (startY === tileY || pathfindTick % 2 === 0) {
                    if (startX < tileX) {
                        startX += 1;
                    } else if (startX > tileX) {
                        startX -= 1;
                    }
                }
                if (!passables.includes(blockAt(startX, startY))) {
                    break;
                }
                pathfindTick++;
            }
            selectedTile = {
                x: startX,
                y: startY,
                breakProgress: (selectedTile && startX === selectedTile.x && startY === selectedTile.y) ? selectedTile.breakProgress : 0
            }
        } else {
            selectedTile = undefined;
        }
    })
    /*canvas.addEventListener("mousedown", (e) => {
        const { x: mouseX, y: mouseY } = getMousePos(canvas, e);
        //if (mouseX > 0 && mouseX < canvas.width && mouseY > 0 && mouseY < canvas.height) {
        const tileX = Math.floor(mouseX / TILE_SIZE);
        const tileY = Math.floor(mouseY / TILE_SIZE);
        if (keysPressed[1]) {
            setBlock(tileX, tileY, 1);
            lights.forEach(source => {
                source.computeIlluminated();
            });
            lightCache = generateLightCache();
        }
        if (keysPressed[2]) {
            const source = createSource(tileX, tileY, {
                strength: 5,
                level: 1
            })
            source.computeIlluminated();
            lights.push(source);
            lightCache = generateLightCache();
            createLightSource(tileX, tileY, {
                strength: 5,
                level: 1
            })
        }
        //}
    });*/
    /*canvas.addEventListener("mousemove", (e) => {
        if (mouseDown) {
            const { x: mouseX, y: mouseY } = getMousePos(canvas, e);
            //if (chunks.some(chunk)) {
            const tileX = Math.floor(mouseX / TILE_SIZE);
            const tileY = Math.floor(mouseY / TILE_SIZE);
            if (keysPressed[1]) {
                setBlock(tileX, tileY, 1);
                lights.forEach(source => {
                    source.computeIlluminated();
                });
                lightCache = generateLightCache();
            }
            //}
        }
    })*/
document.addEventListener("keydown", (e) => {
    if (!paused) {
        keysPressed[e.key] = true;
    }
    if (e.key.toLowerCase() === "r" && player.inventorySelected !== 0) {
        const itemsToThrow = player.inventory[player.inventorySelected];
        if (itemsToThrow) {
            entities.push(ItemEntity({
                sprite: itemsToThrow.item,
                amount: itemsToThrow.amount,
                x: player.x + (4 * Math.sign(Math.random() - 0.5)),
                y: player.y + (4 * Math.sign(Math.random() - 0.5)),
                thrownOut: true
            }))
            player.inventory[player.inventorySelected] = undefined;
        }
    }
});
document.addEventListener("keyup", (e) => {
    keysPressed[e.key] = false;
});
settings.addEventListener("click", () => {
    if (paused === true) {
        paused = false;
        main.innerHTML = "";
    } else if (paused === false) {
        paused = true;
        inGameSettings();
    }
})