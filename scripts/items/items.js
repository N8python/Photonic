const torch1 = document.getElementById("torch1");
const torch2 = document.getElementById("torch2");
const torch3 = document.getElementById("torch3");
const torch = Sprite({
    frames: [torch1, torch2, torch3],
    startFrame: 0
});
torch.createAnimation("idle", [0, 1, 2], {
    timeStep: 0.25
});
const blockItems = [];
Object.values(blockMap).forEach(block => {
    blockItems.push(Sprite({
        frames: [block.default],
        startFrame: 0
    }))
})
const stringToItem = {
    "Torch": torch
}
Object.values(blockMap).forEach((block, i) => {
    stringToItem[i] = blockItems[i];
});
const itemToString = (item) => {
    switch (item) {
        case torch:
            return "Torch";
        default:
            if (blockItems.includes(item)) {
                return blockItems.indexOf(item);
            }
    }
}