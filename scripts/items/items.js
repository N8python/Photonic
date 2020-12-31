const torch1 = document.getElementById("torch1");
const torch2 = document.getElementById("torch2");
const torch3 = document.getElementById("torch3");
const appleImg = document.getElementById("apple");
const twigImg = document.getElementById("twig");
const branchImg = document.getElementById("branch");
const pebbleImg = document.getElementById("pebble");
const rockImg = document.getElementById("rock");
const handaxeImg = document.getElementById("handaxe");
const torch = Sprite({
    frames: [torch1, torch2, torch3],
    startFrame: 0
});
torch.createAnimation("idle", [0, 1, 2], {
    timeStep: 0.25
});
const apple = Sprite({
    frames: [appleImg],
    startFrame: 0
});
const twig = Sprite({
    frames: [twigImg],
    startFrame: 0
});
const branch = Sprite({
    frames: [branchImg],
    startFrame: 0
});
const pebble = Sprite({
    frames: [pebbleImg],
    startFrame: 0
});
const rock = Sprite({
    frames: [rockImg],
    startFrame: 0
});
const handaxe = Sprite({
    frames: [handaxeImg],
    startFrame: 0
});
const blockItems = [];
Object.values(blockMap).forEach(block => {
    blockItems.push(Sprite({
        frames: [block.default],
        startFrame: 0
    }))
})
const stringToItem = {
    "Torch": torch,
    "Apple": apple,
    "Twig": twig,
    "Branch": branch,
    "Pebble": pebble,
    "Rock": rock,
    "Handaxe": handaxe
}
Object.values(blockMap).forEach((block, i) => {
    stringToItem[i] = blockItems[i];
});
const itemToString = (item) => {
    switch (item) {
        case torch:
            return "Torch";
        case apple:
            return "Apple";
        case twig:
            return "Twig";
        case branch:
            return "Branch";
        case pebble:
            return "Pebble";
        case rock:
            return "Rock";
        case handaxe:
            return "Handaxe";
        default:
            if (blockItems.includes(item)) {
                return blockItems.indexOf(item);
            }
    }
}
const blockBreakMap = {
    1: [
        [0.05, blockItems[1]],
        [0, 3, pebble],
        [0, 1, rock]
    ],
    3: [
        [0.1, blockItems[3]],
        [0, 4, twig],
        [0, 2, branch]
    ],
    4: [
        [0.25, blockItems[4]],
        [0, 2, twig],
        [0.15, apple]
    ]
}

const recipes = [
    [
        [
            [twig, 4]
        ],
        [branch, 1]
    ],
    [
        [
            [branch, 4]
        ],
        [blockItems[3], 1]
    ],
    [
        [
            [blockItems[3], 1],
            [rock, 1]
        ],
        [branch, 4]
    ],
    [
        [
            [branch, 1],
            [pebble, 1]
        ],
        [twig, 4]
    ],
    [
        [
            [pebble, 4]
        ],
        [rock, 1]
    ],
    [
        [
            [rock, 4]
        ],
        [blockItems[1], 1]
    ],
    [
        [
            [blockItems[1], 1],
            [branch, 1]
        ],
        [rock, 4]
    ],
    [
        [
            [rock, 1],
            [twig, 1]
        ],
        [pebble, 4]
    ],
    [
        [
            [rock, 3],
            [branch, 1],
            [twig, 2]
        ],
        [handaxe, 1]
    ],
];
const toolBoost = {
    "Handaxe": {
        amount: 1.5
    }
}
const unstackables = [handaxe, torch];
const reduceCraftingInventory = () => {
    const inv = [];
    for (let i = 0; i < 6; i++) {
        const item = crafting[i];
        if (item) {
            const invSpace = inv.find(x => x[0] === item.item);
            if (invSpace) {
                invSpace[1] += item.amount;
            } else {
                inv.push([item.item, item.amount])
            }
        }
    }
    return inv;
}
const findRecipeMatch = () => {
    const inv = reduceCraftingInventory();
    return recipes.find(recipe => {
        const ingredients = recipe[0];
        if (inv.length === ingredients.length) {
            return ingredients.every(([sprite, amt]) => {
                const theItem = inv.find(x => x[0] === sprite);
                if (theItem) {
                    return theItem[1] >= amt;
                }
                return false;
            });
        }
        return false;
    });
}