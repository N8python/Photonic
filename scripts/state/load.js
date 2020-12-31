const loadGame = (idx) => {
    const state = localProxy.games[idx];
    loadState(state);
}
const loadState = (state) => {
    player.x = state.player.x;
    player.y = state.player.y;
    player.orientation = state.player.orientation;
    player.item = stringToItem[state.player.item];
    player.health = state.player.health;
    player.maxHealth = state.player.maxHealth;
    player.food = state.player.food;
    player.maxFood = state.player.maxFood;
    player.water = state.player.water;
    player.maxWater = state.player.maxWater;
    player.exhaustion = state.player.exhaustion;
    player.inventory = state.player.inventory.map((item) => {
        if (item === null) {
            return undefined;
        }
        return {
            item: stringToItem[item.item],
            amount: item.amount
        }
    });
    player.inventorySelected = state.player.inventorySelected;
    lights = [];
    chunks = state.chunks.map(({ xPos, yPos, blocks, lights }) => {
        return Chunk({
            xPos,
            yPos,
            blocks,
            lights
        });
    });
    chunks.forEach(chunk => {
        chunk.unload();
    });
    entities = state.entities.map(entity => {
        if (entity.kind === "ItemEntity") {
            return ItemEntity.fromJSON(entity);
        }
    });
    state.crafting.map((item) => {
        if (item === null) {
            return undefined;
        }
        return {
            item: stringToItem[item.item],
            amount: item.amount
        }
    }).forEach(item => {
        if (item) {
            player.placeInInventory(item.item, item.amount);
        }
    })
    player.createSource();
    seed = state.seed;
    random.randomSeed(seed);
    random.noiseSeed(seed);
}