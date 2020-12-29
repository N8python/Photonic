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
        entities: entities.map(entity => entity.toJSON()),
        seed
    }
}
const saveGame = (idx) => {
    const games = localProxy.games;
    games[idx] = gameState();
    localProxy.games = games;
}