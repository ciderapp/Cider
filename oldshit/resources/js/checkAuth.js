try {
    const preferences = ipcRenderer.sendSync('getStore');

    if (MusicKit.getInstance().isAuthorized) {
        let url = window.location.href;
        if (preferences.general.startupPage !== "browse") {
            if (preferences.general.startupPage.includes('library/')) {
                url = `${window.location.origin}/${preferences.general.startupPage}`;
            } else {
                url = `${window.location.origin}/${MusicKit.getInstance().storefrontId}/${preferences.general.startupPage}`;
            }
            window.location.href = url;
        }

        ipcRenderer.send('userAuthorized', url);
    }
} catch (e) {
    console.error("[JS] Error while trying to apply CheckAuth.js", e);
}