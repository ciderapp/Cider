async function spawnMica() {
    if(typeof window.micaSpawned !== "undefined") {
        return
    }else{
        window.micaSpawned = true
    }
    const micaDiv = document.createElement('div');
    const blurIterations = 6
    micaDiv.id = 'micaEffect';
    micaDiv.style.position = "fixed"
    micaDiv.style.top = "0"
    micaDiv.style.left = "0"
    micaDiv.style.right = "0"
    micaDiv.style.bottom = "0"
    micaDiv.style.zIndex = -1

    let lastScreenX;
    let lastScreenY;
    let lastScreenWidth;
    let lastScreenHeight;

    let imgSrc = await ipcRenderer.sendSync("get-wallpaper")
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let img = new Image();
    img.src = imgSrc;
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        for (let i = 0; i < blurIterations; i++) {
            StackBlur.canvasRGB(canvas, 0, 0, img.width, img.height, 128);
        }
        let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        micaDiv.style.backgroundImage = `url(${canvas.toDataURL()})`;
        document.body.appendChild(micaDiv);
        // on animation finished set animation to unset
        micaDiv.addEventListener('animationend', function () {
            micaDiv.style.opacity = '1';
            micaDiv.style.animation = 'unset';
        })
    }


    function onScreenMove(cb) {
        function detectScreenMove() {
            if (lastScreenY !== window.screenY || lastScreenX !== window.screenX) {
                lastScreenY = window.screenY;
                lastScreenX = window.screenX;
                cb();
            }
            // window size change
            if (lastScreenWidth !== window.innerWidth || lastScreenHeight !== window.innerHeight) {
                lastScreenWidth = window.innerWidth;
                lastScreenHeight = window.innerHeight;
                cb();
            }
            if (true) {
                requestAnimationFrame(detectScreenMove);
            }
        }

        if (true) {
            requestAnimationFrame(detectScreenMove);
        }
    }

    onScreenMove(function () {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const ratio = windowWidth / windowHeight;
        const x = window.screenX;
        const y = window.screenY;
        micaDiv.style.backgroundSize = `${screenWidth}px ${screenHeight}px`;
        // micaDiv.style.backgroundPosition = `-${x}px -${y}px`;
        if (x < 0) {
            micaDiv.style.backgroundPosition = `${screenWidth + x}px -${y}px`;
        } else {
            micaDiv.style.backgroundPosition = `-${x}px -${y}px`;
        }
    });
    return true
}

export {spawnMica}