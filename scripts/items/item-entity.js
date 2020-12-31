function ItemEntity({
    sprite,
    x,
    y,
    angle,
    xOffset,
    yOffset,
    amount = 1,
    thrownOut = false
}) {
    angle = (angle === undefined) ? Math.PI / 4 * random.random(-1, 1) : angle;
    xOffset = (xOffset === undefined) ? random.random(8) : xOffset;
    yOffset = (yOffset === undefined) ? random.random(8) : yOffset;
    let targetX;
    let targetY;
    if (thrownOut) {
        targetX = x;
        targetY = y;
        x = player.x;
        y = player.y;
    }
    let beingPickedUp = false;
    return {
        draw() {
            if (thrownOut) {
                x += (targetX - x) / 10;
                y += (targetY - y) / 10;
                if (random.dist(x, y, targetX, targetY) < 0.1) {
                    x = targetX;
                    y = targetY;
                    thrownOut = false;
                }
            }
            ctx.save();
            ctx.translate(x * 16 + xOffset, y * 16 + yOffset);
            ctx.rotate(angle);
            const light = lightCache.find(([sourceX, sourceY]) => Math.floor(x) === sourceX && Math.floor(y) === sourceY);
            const lightLevel = light ? FULLBRIGHT ? 100 : Math.round(light[2] * 100) : 0;
            if (lightLevel > 0) {
                ctx.filter = `brightness(${lightLevel}%)`;
                sprite.draw(0, 0, 12, 12);
                ctx.filter = "none";
            }
            ctx.restore();
            if (random.dist(x * 16 + xOffset, y * 16 + yOffset, player.x * 16, player.y * 16) < 48 && !thrownOut) {
                beingPickedUp = true;
            }
            if (random.dist(x * 16 + xOffset, y * 16 + yOffset, player.x * 16, player.y * 16) < 8) {
                entities.splice(entities.indexOf(this), 1);
                player.placeInInventory(sprite, amount);
            }
            if (beingPickedUp) {
                xOffset += ((player.x * 16) - (x * 16 + xOffset)) / 10;
                yOffset += ((player.y * 16) - (y * 16 + yOffset)) / 10;
            }
        },
        toJSON() {
            return {
                x,
                y,
                angle,
                xOffset,
                yOffset,
                block: blockItems.includes(sprite) ? blockItems.indexOf(sprite) : itemToString(sprite),
                amount,
                kind: "ItemEntity"
            }
        }
    }
}
ItemEntity.fromJSON = ({ x, y, angle, xOffset, yOffset, block, amount }) => {
    return ItemEntity({
        x,
        y,
        sprite: Number.isInteger(block) ? blockItems[block] : stringToItem[block],
        angle: angle,
        amount,
        xOffset: xOffset,
        yOffset: yOffset
    })
}