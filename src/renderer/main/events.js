const Events = {
    InitEvents() {
        const app = window.app
        // Key binds
        document.addEventListener('keydown', function (e) {
            if (e.keyCode === 70 && e.ctrlKey) {
                app.$refs.searchInput.focus()
                app.$refs.searchInput.select()
            }
        });

// add event listener for when window.location.hash changes
        window.addEventListener("hashchange", function () {
            app.appRoute(window.location.hash)
        });

        // Key bind to unjam MusicKit in case it fails: CTRL+F10

        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey && event.keyCode == 121) {
                try {
                    app.mk._services.mediaItemPlayback._currentPlayer.stop()
                } catch (e) {
                }
                try {
                    app.mk._services.mediaItemPlayback._currentPlayer.destroy()
                } catch (e) {
                }
            }
        });

        window.addEventListener("mouseup", (e) => {
            if (e.button === 3) {
                e.preventDefault()
                app.navigateBack()
            } else if (e.button === 4) {
                e.preventDefault()
                app.navigateForward()
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey && event.keyCode == 122) {
                try {
                    ipcRenderer.send('detachDT', '')
                } catch (e) {
                }
            }
        });

        // Hang Timer
        app.hangtimer = setTimeout(() => {
            if (confirm("Cider is not responding. Reload the app?")) {
                window.location.reload()
            }
        }, 10000)

// Refresh Focus
        function refreshFocus() {
            if (document.hasFocus() == false) {
                app.windowFocus(false)
            } else {
                app.windowFocus(true)
            }
            setTimeout(refreshFocus, 200);
        }

        app.getHTMLStyle()

        refreshFocus();
    }
}

export {Events}