const matchesIdle1 = document.getElementById("matchesIdle1");
const matchesIdle2 = document.getElementById("matchesIdle2");
const matchesIdle3 = document.getElementById("matchesIdle3");
const matchesWalkRight1 = document.getElementById("matchesWalkRight1");
const matchesWalkRight2 = document.getElementById("matchesWalkRight2");
const matchesWalkRight3 = document.getElementById("matchesWalkRight3");
const matchesWalkRight4 = document.getElementById("matchesWalkRight4");
const matchesWalkRight5 = document.getElementById("matchesWalkRight5");
const matchesWalkRight6 = document.getElementById("matchesWalkRight6");
const matchesWalkRight7 = document.getElementById("matchesWalkRight7");
const matchesWalkRight8 = document.getElementById("matchesWalkRight8");
let oldInventorySelected;
const player = {
    x: 5,
    y: 5,
    health: 100,
    maxHealth: 100,
    food: 100,
    maxFood: 100,
    water: 100,
    maxWater: 100,
    exhaustion: 0,
    orientation: "right",
    item: torch,
    inventory: [{ item: torch, amount: 1 }].concat(Array(15).fill(undefined)),
    inventorySelected: 0,
    source: undefined,
    sprite: Sprite({
        frames: [matchesIdle1, matchesIdle2, matchesIdle3, matchesWalkRight1, matchesWalkRight2, matchesWalkRight3, matchesWalkRight4, matchesWalkRight5, matchesWalkRight6, matchesWalkRight7, matchesWalkRight8],
        startFrame: 0
    }),
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            orientation: this.orientation,
            item: itemToString(this.item),
            health: this.health,
            maxHealth: this.maxHealth,
            food: this.food,
            maxFood: this.maxFood,
            water: this.water,
            maxWater: this.maxWater,
            exhaustion: this.exhaustion,
            inventory: this.inventory.map((item) => {
                if (item === undefined) {
                    return null;
                } else {
                    return {
                        item: itemToString(item.item),
                        amount: item.amount
                    }
                }
            }),
            inventorySelected: this.inventorySelected
        }
    },
    placeInInventory(sprite, amount = 1) {
        for (let a = 0; a < amount; a++) {
            let itemIndex = this.inventory.findIndex((item) => item !== undefined && item.item === sprite && item.amount < 99);
            if (itemIndex >= 0) {
                this.inventory[itemIndex].amount++;
            } else {
                let freeIndex = 0;
                for (let i = 0; i < 16; i++) {
                    if (this.inventory[i] === undefined) {
                        freeIndex = i;
                        break;
                    }
                }
                if (freeIndex === 0) {
                    return false;
                } else {
                    this.inventory[freeIndex] = { item: sprite, amount: 1 };
                }
            }
        };
        return true;
    },
    createSource() {
        const xTarget = (this.orientation === "left" ? -2 : 1);
        if (this.item === torch) {
            this.source = createSource(this.x + xTarget, this.y - 1, {
                strength: 10,
                level: 1
            });
            this.source.computeIlluminated();
            lights.push(this.source);
            lightCache = generateLightCache();
        } else if (this.item !== torch) {
            this.source = createSource(this.x + xTarget, this.y - 1, {
                strength: 4,
                level: 1
            });
            this.source.computeIlluminated();
            lights.push(this.source);
            lightCache = generateLightCache();
        }
    },
    draw() {
        if (this.inventory[this.inventorySelected] === undefined) {
            this.inventorySelected = 0;
        }
        this.item = this.inventory[this.inventorySelected].item;
        this.exhaustion += 1;
        if (this.exhaustion > 5000) {
            let seed = Math.random();
            if (seed < 0.75 && this.water > 0) {
                this.water -= 1;
                this.exhaustion -= 250;
            } else if (this.food > 0) {
                this.food -= 1;
                this.exhaustion -= 500;
            }
        }
        if (this.water === 0 && this.health > 0) {
            if (Math.random() < 0.00125) {
                this.health -= 1;
            }
        }
        if (this.water === 0 && this.health > 0) {
            if (Math.random() < 0.025) {
                this.health -= 1;
            }
        }
        ctx.save();
        ctx.translate(this.x * 16, this.y * 16);
        if (this.orientation === "left") {
            ctx.scale(-1, 1);
        }
        this.sprite.draw(-16, -16, 32, 32);
        ctx.restore();
        if (this.item) {
            this.item.playAnimation("idle");
            ctx.save();
            ctx.translate((this.x * 16) + (this.orientation === "left" ? -32 : 12) + this.item.width, (this.y * 16) - 8 + this.item.height);
            if (selectedTile && selectedTile.breakProgress > 0) {
                this.exhaustion += 5;
                if (this.orientation === "left") {
                    ctx.rotate(-Math.PI / 6 + (Math.PI / 6 * Math.sin(tick / 5)))
                } else if (this.orientation === "right") {
                    ctx.scale(-1, 1);
                    ctx.translate(12, 0);
                    ctx.rotate(-Math.PI / 6 + (Math.PI / 6 * Math.sin(tick / 5)));
                }
            }
            this.item.draw(-this.item.width, -this.item.height, blockItems.includes(this.item) ? 16 : 20, blockItems.includes(this.item) ? 16 : 20);
            ctx.restore();
            const xTarget = (this.orientation === "left" ? -2 : 1)
            if (!this.source) {
                this.source = createSource(this.x + xTarget, this.y - 1, {
                    strength: (this.item === torch) ? 10 : 4,
                    level: 1
                });
                this.source.computeIlluminated();
                lights.push(this.source);
                lightCache = generateLightCache();
            } else if (this.item === torch) {
                if (Math.abs(this.source.sourceX - (this.x + xTarget)) > 1 || Math.abs(this.source.sourceY - (this.y - 1)) > 1 || this.inventorySelected !== oldInventorySelected) {
                    this.source.sourceX = Math.round(this.x + xTarget);
                    this.source.sourceY = Math.round(this.y - 1);
                    this.source.strength = 10;
                    this.source.computeIlluminated();
                    lightCache = generateLightCache();
                }
            } else if (this.item !== torch) {
                if (Math.abs(this.source.sourceX - (this.x + xTarget)) > 1 || Math.abs(this.source.sourceY - (this.y - 1)) > 1 || this.inventorySelected !== oldInventorySelected) {
                    this.source.sourceX = Math.round(this.x + xTarget);
                    this.source.sourceY = Math.round(this.y - 1);
                    this.source.strength = 4;
                    this.source.computeIlluminated();
                    lightCache = generateLightCache();
                }
            }
        }
        oldInventorySelected = this.inventorySelected
            /*ctx.fillStyle = "red";
            ctx.fillRect(this.x * 16 - 16, this.y * 16 - 16, 5, 5);
            ctx.fillRect(this.x * 16 + 16, this.y * 16 - 16, 5, 5);
            ctx.fillRect(this.x * 16 + 16, this.y * 16 + 16, 5, 5);
            ctx.fillRect(this.x * 16 - 16, this.y * 16 + 16, 5, 5);*/
    },
    move() {
        let speed = 0.1;
        if ([blockAt(Math.floor(this.x), Math.floor(this.y)), blockAt(Math.floor(this.x), Math.floor(this.y + 1)), blockAt(Math.floor(this.x + 1), Math.floor(this.y + 1)), blockAt(Math.floor(this.x + 1), Math.floor(this.y))].includes(5)) {
            speed = 0.05;
        }
        if (this.food < 25) {
            speed = 0.075;
        }
        if (this.food < 12) {
            speed = 0.05;
        }
        if (this.food === 0) {
            speed = 0.0375;
        }
        if (keysPressed["ArrowRight"]) {
            this.orientation = "right";
            if (passables.includes(blockAt(Math.floor(this.x) + 1, Math.floor(this.y) - 1)) && passables.includes(blockAt(Math.floor(this.x) + 1, Math.floor(this.y) + 1)) && passables.includes(blockAt(Math.floor(this.x) + 1, Math.floor(this.y)))) {
                this.x += speed;
                this.exhaustion += 2;
            } else if (Number.isInteger(this.y) && passables.includes(blockAt(Math.round(this.x) + 1, this.y)) && passables.includes(blockAt(Math.round(this.x) + 1, this.y - 1))) {
                this.x += speed;
                this.exhaustion += 2;
            }
            this.sprite.playAnimation("walkRight");
        } else if (keysPressed["ArrowLeft"]) {
            this.orientation = "left";
            if (passables.includes(blockAt(Math.floor(this.x) - 1, Math.floor(this.y) - 1)) && passables.includes(blockAt(Math.floor(this.x) - 1, Math.floor(this.y) + 1)) && passables.includes(blockAt(Math.floor(this.x) - 1, Math.floor(this.y)))) {
                this.x -= speed;
                this.exhaustion += 2;
            } else if (Number.isInteger(this.y) && passables.includes(blockAt(Math.round(this.x) - 2, this.y)) && passables.includes(blockAt(Math.round(this.x) - 2, this.y - 1))) {
                this.x -= speed;
                this.exhaustion += 2;
            }
            this.sprite.playAnimation("walkRight");
        } else {
            this.sprite.playAnimation("idle");
        }
        if (keysPressed["ArrowUp"]) {
            if (passables.includes(blockAt(Math.floor(this.x - 1), Math.floor(this.y - 1))) && passables.includes(blockAt(Math.floor(this.x) + 1, Math.floor(this.y - 1))) && passables.includes(blockAt(Math.floor(this.x), Math.floor(this.y - 1)))) {
                this.y -= speed;
                this.exhaustion += 2;
            } else if (Number.isInteger(this.x) && passables.includes(blockAt(this.x, Math.round(this.y) - 2)) && passables.includes(blockAt(this.x - 1, Math.round(this.y) - 2))) {
                this.y -= speed;
                this.exhaustion += 2;
            }
        } else if (keysPressed["ArrowDown"]) {
            if (passables.includes(blockAt(Math.floor(this.x) - 1, Math.floor(this.y) + 1)) && passables.includes(blockAt(Math.floor(this.x) + 1, Math.floor(this.y) + 1)) && passables.includes(blockAt(Math.floor(this.x), Math.floor(this.y + 1)))) {
                this.y += speed;
                this.exhaustion += 2;
            } else if (Number.isInteger(this.x) && passables.includes(blockAt(this.x, Math.round(this.y) + 1)) && passables.includes(blockAt(this.x - 1, Math.round(this.y) + 1))) {
                this.y += speed;
                this.exhaustion += 2;
            }
        }
        if (!Number.isInteger(this.x) && !keysPressed["ArrowRight"] && !keysPressed["ArrowLeft"]) {
            if (this.x - Math.floor(this.x) < 0.5) {
                this.x -= speed;
                this.exhaustion += 2;
            } else {
                this.x += speed;
                this.exhaustion += 2;
            }
            this.x = Math.round(this.x * (1 / speed)) / (1 / speed);
        }
        if (!Number.isInteger(this.y) && !keysPressed["ArrowUp"] && !keysPressed["ArrowDown"]) {
            if (this.y - Math.floor(this.y) < 0.5) {
                this.y -= speed;
                this.exhaustion += 2;
            } else {
                this.y += speed;
                this.exhaustion += 2;
            }
            this.y = Math.round(this.y * (1 / speed)) / (1 / speed);
        }
    }
}
player.sprite.createAnimation("idle", [0, 1, 0, 2], {
    timeStep: 0.2
})
player.sprite.createAnimation("walkRight", [3, 4, 5, 6, 7, 8, 9, 10], {
    timeStep: 0.05
})
player.sprite.playAnimation("walkRight");