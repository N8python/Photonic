const main = document.getElementById("main");
const loadScene = (sceneName) => {
    ({
        "Main Menu": mainMenu
    })[sceneName]();
}
const mainMenu = () => {
    main.innerHTML = `
    <img style="margin-left:204px;margin-top:6px;" width="600px" height="auto" src="assets/menu/title.png">
    `
        /*<br>
        <button style="width:300px; margin-left: 350px;" class="courier menu-button">Worlds</button>
        <br>
        <br>
        <button style="width:300px; margin-left: 350px;" class="courier menu-button">Settings</button>*/
    const worldButton = document.createElement("button");
    worldButton.style.width = "300px";
    worldButton.style.marginLeft = "354px";
    worldButton.classList.add("courier", "menu-button");
    worldButton.innerHTML = "Worlds";
    worldButton.onclick = worldMenu;
    const settingsButton = document.createElement("button");
    settingsButton.style.width = "300px";
    settingsButton.style.marginLeft = "354px";
    settingsButton.classList.add("courier", "menu-button");
    settingsButton.innerHTML = "Settings";
    settingsButton.onclick = settingsMenu;
    main.appendChild(document.createElement("br"))
    main.appendChild(worldButton);
    main.appendChild(document.createElement("br"))
    main.appendChild(document.createElement("br"))
    main.appendChild(settingsButton);
}
const worldMenu = () => {
    main.innerHTML = `
    <img style="margin-left:204px;margin-top:6px;" width="600px" height="auto" src="assets/menu/worldMenu.png">
    `
    const backButton = document.createElement("button");
    backButton.style.width = "300px";
    backButton.style.marginLeft = "354px";
    backButton.classList.add("courier", "menu-button");
    backButton.innerHTML = "Back";
    backButton.onclick = mainMenu;
    for (let i = 0; i < 3; i++) {
        const slot = document.createElement("div");
        slot.style.width = "400px";
        slot.style.border = "2px solid white";
        slot.style.marginBottom = "16px";
        slot.style.marginLeft = "304px";
        const title = document.createElement("h3");
        title.innerHTML = `Slot ${i + 1}:`;
        title.style.color = "white";
        title.classList.add("courier");
        title.style.marginLeft = "16px";
        title.style.marginTop = "8px";
        const openWorld = document.createElement("button");
        openWorld.style.width = "200px";
        openWorld.style.marginLeft = "16px";
        openWorld.style.marginBottom = "8px";
        openWorld.classList.add("courier", "menu-button");
        openWorld.innerHTML = localProxy.games[i] ? "Open World" : "Create World";
        openWorld.onclick = () => {
            if (localProxy.games[i]) {
                loadWorld(i)
            } else {
                initWorld(i);
            }
        }
        slot.appendChild(title);
        slot.appendChild(openWorld);
        if (localProxy.games[i]) {
            const deleteWorld = document.createElement("button");
            deleteWorld.style.width = "175px";
            openWorld.style.width = "175px";
            deleteWorld.style.marginLeft = "16px";
            deleteWorld.style.marginBottom = "8px";
            deleteWorld.classList.add("courier", "menu-button");
            deleteWorld.style.fontSize = "22px";
            deleteWorld.style.paddingTop = "3px";
            deleteWorld.innerHTML = "Delete World";
            deleteWorld.onclick = () => {
                Swal.fire({
                    title: 'Are you sure you want to delete your world?',
                    icon: 'warning',
                    text: "The world will be gone forever.",
                    showDenyButton: true,
                    confirmButtonText: `Yes`,
                    denyButtonText: `No`,
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire('Your world is gone!', '', 'error');
                        const games = localProxy.games;
                        games[i] = null;
                        localProxy.games = games;
                        openWorld.innerHTML = "Create World";
                        openWorld.style.width = "200px";
                        deleteWorld.remove();
                        levelStorageIndex = undefined;
                        location.reload();
                    } else if (result.isDenied) {
                        Swal.fire('Your world lives another day!', '', 'success')
                    }
                })
            }
            slot.appendChild(deleteWorld);
        }
        main.appendChild(slot);
    }
    main.appendChild(document.createElement("br"));
    main.appendChild(backButton);
}
const settingsMenu = () => {
    main.innerHTML = `
    <img style="margin-left:204px;margin-top:6px;" width="600px" height="auto" src="assets/menu/settings.png">
    `
    const backButton = document.createElement("button");
    backButton.style.width = "300px";
    backButton.style.marginLeft = "354px";
    backButton.classList.add("courier", "menu-button");
    backButton.innerHTML = "Back";
    backButton.onclick = mainMenu;
    const zoomLevel = document.createElement("select");
    Object.keys(zooms).forEach(key => {
        const opt = document.createElement("option");
        opt.innerHTML = key;
        opt.value = key;
        if (key === localProxy.zoomLevel) {
            opt.setAttribute("selected", "true")
        }
        zoomLevel.appendChild(opt);
    });
    zoomLevel.addEventListener("change", () => {
        localProxy.zoomLevel = zoomLevel.value;
    })
    const zoomLabel = document.createElement("span");
    zoomLabel.innerHTML = "Zoom Level: ";
    zoomLabel.style.color = "white";
    zoomLabel.classList.add("courier");
    zoomLabel.style.marginLeft = "365px";
    zoomLabel.style.fontSize = "21px";
    main.appendChild(document.createElement("br"));
    main.appendChild(zoomLabel);
    main.appendChild(zoomLevel);
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createElement("br"));
    main.appendChild(backButton);
}
const inGameSettings = () => {
    main.innerHTML = "";
    const resumeButton = document.createElement("button");
    resumeButton.style.width = "200px";
    resumeButton.style.marginLeft = "425px";
    resumeButton.style.marginTop = "250px";
    resumeButton.classList.add("courier", "menu-button");
    resumeButton.innerHTML = "Resume";
    resumeButton.onclick = () => {
        paused = false;
        main.innerHTML = "";
    };
    const exitButton = document.createElement("button");
    exitButton.style.width = "200px";
    exitButton.style.marginLeft = "425px";
    exitButton.classList.add("courier", "menu-button");
    exitButton.innerHTML = "Exit";
    exitButton.onclick = () => {
        paused = false;
        saveGame(levelStorageIndex);
        levelStorageIndex = undefined;
        scene = "start";
        worldMenu();
    }
    main.appendChild(resumeButton);
    main.appendChild(document.createElement("br"))
    main.appendChild(document.createElement("br"))
    main.appendChild(exitButton);
}
const initWorld = (i) => {
    zoomTo(localProxy.zoomLevel)
    main.innerHTML = "";
    const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    random.randomSeed(seed);
    random.noiseSeed(seed);
    scene = "play";
    chunks = [];
    for (let y = 0; y < (canvas.height / TILE_SIZE) / 16; y++) {
        for (let x = 0; x < (canvas.width / TILE_SIZE) / 16; x++) {
            chunks.push(Chunk({
                xPos: x * 16,
                yPos: y * 16
            }))
        }
    }
    player.x = 0;
    player.y = 0;
    saveGame(i);
    levelStorageIndex = i;
}
const loadWorld = (i) => {
    zoomTo(localProxy.zoomLevel);
    main.innerHTML = "";
    scene = "play";
    loadGame(i);
    saveGame(i);
    levelStorageIndex = i;
}