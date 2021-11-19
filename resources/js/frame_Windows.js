try {
    if (document.querySelector('.web-nav-window-controls') === null && document.getElementsByClassName('web-nav-window-controls').length === 0) {

        class ClassWatcher {

            constructor(targetNode, classToWatch, classAddedCallback, classRemovedCallback) {
                this.targetNode = targetNode;
                this.classToWatch = classToWatch;
                this.classAddedCallback = classAddedCallback;
                this.classRemovedCallback = classRemovedCallback;
                this.observer = null;
                this.lastClassState = targetNode.classList.contains(this.classToWatch);

                this.init();
            };

            init() {
                this.observer = new MutationObserver(this.mutationCallback);
                this.observe();
            }

            observe() {
                this.observer.observe(this.targetNode, { attributes: true })
            };

            disconnect() {
                this.observer.disconnect()
            };

            mutationCallback = mutationsList => {
                for(let mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        let currentClassState = mutation.target.classList.contains(this.classToWatch);
                        if(this.lastClassState !== currentClassState) {
                            this.lastClassState = currentClassState;
                            if(currentClassState) {
                                this.classAddedCallback();
                            }
                            else {
                                this.classRemovedCallback();
                            }
                        }
                    }
                }
            }
        }

        function UserAuthorized() { /* When user is authenticated (Signed In) and web-chrome appears */
            document.getElementsByClassName('web-nav-window-controls')[0].classList.add('web-chrome-window-controls');
            document.getElementsByClassName('web-main-drag')[0].style.zIndex = '1'; /* Hide the drag bar */
        }

        function UserUnauthorized() { /* When user is unauthenticated (Signed Out) and web-chrome display: none */
            if (document.getElementsByClassName('web-chrome-window-controls').length !== 0) {
                console.log(`Length: ${document.getElementsByClassName('web-chrome-window-controls').length}`);
                document.getElementsByClassName('web-chrome-window-controls')[0].classList.remove('web-chrome-window-controls');
            }
            document.getElementsByClassName('web-main-drag')[0].style.zIndex = '2'; /* Show the drag bar */
            document.getElementsByClassName('header-nav')[0].style.margin = '5px var(--bodyGutter) 0'
        }

        new ClassWatcher(document.body, 'not-authenticated', UserUnauthorized, UserAuthorized);

        document.getElementsByClassName('web-navigation')[0].insertAdjacentHTML('afterbegin', `
        <div class="web-main-drag">
        </div>
        <div class="web-nav-window-controls">
            <span id="minimize" onclick="ipcRenderer.send('minimize')"></span>
            <span id="maximize" onclick="ipcRenderer.send('maximize')"></span>
            <span id="close" onclick="ipcRenderer.send('close')"></span>
        </div>
        `);

        if ((document.getElementsByClassName('web-chrome')[0].style.display === 'none' || document.body.classList.contains('not-authenticated')) && document.getElementsByClassName('web-nav-window-controls').length > 0) {
            UserUnauthorized();
        } else {
            UserAuthorized();
        }

        /* Clean Up Search bar */
        if (document.getElementsByClassName('search-box dt-search-box web-navigation__search-box').length > 0) {
            document.getElementsByClassName('search-box dt-search-box web-navigation__search-box')[0].style.marginTop = '15px';
        }

        if (document.getElementById('web-navigation-container')) {
            document.getElementById('web-navigation-container').style.gridTemplateRows = 'auto auto 1fr auto'
        }
    }
} catch (e) {
    console.error("[CSS] Error while trying to apply frame_Windows.js", e);
}