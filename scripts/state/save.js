if (!localProxy.games) {
    localProxy.games = [];
}
if (!localProxy.zoomLevel) {
    localProxy.zoomLevel = "Low";
}
const gameState = () => {
    return {
        chunks: chunks.map(chunk => chunk.toJSON()),
        player: player.toJSON(),
        crafting: crafting.map((item) => {
            if (item === undefined) {
                return null;
            } else {
                return {
                    item: itemToString(item.item),
                    amount: item.amount
                }
            }
        }),
        entities: entities.map(entity => entity.toJSON()),
        seed
    }
}
const saveGame = (idx) => {
    const games = localProxy.games;
    games[idx] = gameState();
    localProxy.games = games;
}