function Sprite({
    frames,
    startFrame
}) {
    let currFrame = startFrame;
    let animations = {};
    let timeStep = 0;
    let lastTimeUpdate = Date.now();
    let currAnimation = undefined;
    return {
        draw(x, y, width, height) {
            if (currAnimation) {
                const idx = Math.floor(timeStep / currAnimation.timeStep) % currAnimation.frameList.length;
                currFrame = currAnimation.frameList[idx];
            }
            const img = frames[currFrame];
            ctx.drawImage(img, x, y, width ? width : img.width, height ? height : img.height);
            timeStep += (Date.now() - lastTimeUpdate) / 1000;
            lastTimeUpdate = Date.now();
        },
        createAnimation(name, frameList, { timeStep }) {
            animations[name] = {
                frameList,
                timeStep
            }
        },
        playAnimation(name) {
            currAnimation = animations[name];
        },
        get width() {
            return frames[0].width;
        },
        get height() {
            return frames[0].height;
        }
    }
}