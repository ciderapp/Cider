import { CiderCache } from "./cidercache.js";

async function spawnMica() {
  if (typeof window.micaSpawned !== "undefined") {
    return;
  } else {
    window.micaSpawned = true;
  }
  const micaDiv = document.createElement("div");
  const blurIterations = 6;
  micaDiv.id = "micaEffect";
  micaDiv.style.position = "fixed";
  micaDiv.style.top = "0";
  micaDiv.style.left = "0";
  micaDiv.style.right = "0";
  micaDiv.style.bottom = "0";
  micaDiv.style.zIndex = -1;

  let lastScreenX;
  let lastScreenY;
  let lastScreenWidth;
  let lastScreenHeight;

  let regen = true;
  let imgSrc = await ipcRenderer.sendSync("get-wallpaper", {
      blurAmount: 256
  });

//   let micaCache = await CiderCache.getCache("mica-cache");
//   if (!micaCache) {
//     micaCache = {
//       path: "",
//       data: "",
//     };
//   }
//   if (micaCache.path == imgSrc.path) {
//     regen = false;
//     imgSrc = micaCache;
//   }
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let img = new Image();
  micaDiv.style.backgroundImage = `url(${imgSrc.data})`;
  document.body.appendChild(micaDiv);

  function onScreenMove(cb) {
    function detectScreenMove() {
      if (lastScreenY !== window.screenY || lastScreenX !== window.screenX) {
        lastScreenY = window.screenY;
        lastScreenX = window.screenX;
        cb();
      }
      // window size change
      if (
        lastScreenWidth !== window.innerWidth ||
        lastScreenHeight !== window.innerHeight
      ) {
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
  return true;
}

export { spawnMica };
