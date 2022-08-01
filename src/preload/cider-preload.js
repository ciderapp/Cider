global.ipcRenderer = require('electron').ipcRenderer;
console.info('Loaded Preload')

let cache = {playParams: {id: 0}, status: null, remainingTime: 0},
	playbackCache = {status: null, time: Date.now()};

const MusicKitInterop = {
	init: function () {
		/* MusicKit.Events.playbackStateDidChange */
		MusicKit.getInstance().addEventListener(MusicKit.Events.playbackStateDidChange, () => {
			const attributes = MusicKitInterop.getAttributes()
			if (MusicKitInterop.filterTrack(attributes, true, false)) {
				global.ipcRenderer.send('playbackStateDidChange', attributes)
				global.ipcRenderer.send('wsapi-updatePlaybackState', attributes);
			}
		});

		/* MusicKit.Events.playbackProgressDidChange */
		MusicKit.getInstance().addEventListener(MusicKit.Events.playbackProgressDidChange, async () => {
			const attributes = MusicKitInterop.getAttributes()
			// wsapi call
			ipcRenderer.send('wsapi-updatePlaybackState', attributes);
			// lastfm call
			if (app.mk.currentPlaybackProgress === (app.cfg.connectivity.lastfm.scrobble_after / 100)) {
				attributes.primaryArtist = (app.cfg.connectivity.lastfm.enabled && app.cfg.connectivity.lastfm.remove_featured) ? await this.fetchPrimaryArtist(attributes.artistName) : attributes.artistName;
				ipcRenderer.send('lastfm:scrobbleTrack', attributes);
			}
		});

		/* MusicKit.Events.playbackTimeDidChange */
		MusicKit.getInstance().addEventListener(MusicKit.Events.playbackTimeDidChange, () => {
			ipcRenderer.send('mpris:playbackTimeDidChange', (MusicKit.getInstance()?.currentPlaybackTime * 1000 * 1000) ?? 0);
		});

		/* MusicKit.Events.nowPlayingItemDidChange */
		MusicKit.getInstance().addEventListener(MusicKit.Events.nowPlayingItemDidChange, async () => {
			console.debug('[cider:preload] nowPlayingItemDidChange')
			const attributes = MusicKitInterop.getAttributes()
			attributes.primaryArtist = (app.cfg.connectivity.lastfm.enabled && app.cfg.connectivity.lastfm.remove_featured) ? await this.fetchPrimaryArtist(attributes.artistName) : attributes.artistName;

			if (MusicKitInterop.filterTrack(attributes, false, true)) {
				global.ipcRenderer.send('nowPlayingItemDidChange', attributes);
			} else if (attributes.name !== 'no-title-found' && attributes.playParams.id !== "no-id-found") {
				global.ipcRenderer.send('lastfm:nowPlayingChange', attributes);
			}

			if (app.cfg.general.playbackNotifications && !document.hasFocus() && attributes.artistName && attributes.artwork && attributes.name) {
				global.ipcRenderer.send('playbackNotifications:create', attributes);
			}

			if (MusicKit.getInstance().nowPlayingItem) {
				await this.sleep(750);
				MusicKit.getInstance().playbackRate = app.cfg.audio.playbackRate;
			}
		});

		/* MusicKit.Events.authorizationStatusDidChange */
		MusicKit.getInstance().addEventListener(MusicKit.Events.authorizationStatusDidChange, () => {
			global.ipcRenderer.send('authorizationStatusDidChange', MusicKit.getInstance().authorizationStatus)
		});

		/* MusicKit.Events.mediaPlaybackError */
		MusicKit.getInstance().addEventListener(MusicKit.Events.mediaPlaybackError, (e) => {
			console.warn(`[cider:preload] mediaPlaybackError] ${e}`);
		});

		/* MusicKit.Events.shuffleModeDidChange */
		MusicKit.getInstance().addEventListener(MusicKit.Events.shuffleModeDidChange, () => {
			global.ipcRenderer.send('shuffleModeDidChange', MusicKit.getInstance().shuffleMode)
		});

		/* MusicKit.Events.repeatModeDidChange */
		MusicKit.getInstance().addEventListener(MusicKit.Events.repeatModeDidChange, () => {
			global.ipcRenderer.send('repeatModeDidChange', MusicKit.getInstance().repeatMode)
		});
	},

	sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	},

	async fetchPrimaryArtist(artist) {
		if (app.mk.nowPlayingItem?.relationships?.artists) {
			const artist = await app.mk.api.artist(app.mk.nowPlayingItem.relationships.artists.data[0].id)
			return artist.attributes.name
		} else {
			return artist
		}
	},

	getAttributes: function () {
		const mk = MusicKit.getInstance()
		const nowPlayingItem = mk.nowPlayingItem;
		const isPlayingExport = mk.isPlaying;
		const remainingTimeExport = mk.currentPlaybackTimeRemaining;
		const currentPlaybackProgress = mk.currentPlaybackProgress;
		const attributes = (nowPlayingItem != null ? nowPlayingItem.attributes : {});

		attributes.songId = attributes.songId ?? attributes.playParams?.catalogId ?? attributes.playParams?.id
		attributes.status = isPlayingExport ?? null;
		attributes.name = attributes?.name ?? 'no-title-found';
		attributes.artwork = attributes?.artwork ?? {url: ''};
		attributes.artwork.url = (attributes?.artwork?.url ?? '').replace(`{f}`, "png");
		attributes.playParams = attributes?.playParams ?? {id: 'no-id-found'};
		attributes.playParams.id = attributes?.playParams?.id ?? 'no-id-found';
		attributes.url = {
			cider: `https://cider.sh/link?play/s/${nowPlayingItem?._songId ?? (nowPlayingItem?.songId ?? 'no-id-found')}`,
			appleMusic: attributes.websiteUrl ? attributes.websiteUrl : `https://music.apple.com/${mk.storefrontId}/song/${nowPlayingItem?._songId ?? (nowPlayingItem?.songId ?? 'no-id-found')}`
		}
		if (attributes.playParams.id === 'no-id-found') {
			attributes.playParams.id = nowPlayingItem?.id ?? 'no-id-found';
		}
		attributes.albumName = attributes?.albumName ?? '';
		attributes.artistName = attributes?.artistName ?? '';
		attributes.genreNames = attributes?.genreNames ?? [];
		attributes.remainingTime = remainingTimeExport
			? remainingTimeExport * 1000
			: 0;
		attributes.durationInMillis = attributes?.durationInMillis ?? 0;
		attributes.currentPlaybackTime = mk?.currentPlaybackTime ?? 0;
		attributes.currentPlaybackProgress = currentPlaybackProgress ?? 0;
		attributes.startTime = Date.now();
		attributes.endTime = Math.round(
			attributes?.playParams?.id === cache.playParams.id
				? Date.now() + attributes?.remainingTime
				: attributes?.startTime + attributes?.durationInMillis
		);
		return attributes;
	},

	filterTrack: function (a, playbackCheck, mediaCheck) {
		if (a.name === 'no-title-found' || a.playParams.id === "no-id-found") {
			return;
		} else if (mediaCheck && a.playParams.id === cache.playParams.id) {
			return;
		} else if (playbackCheck && a.status === playbackCache.status) {
			return;
		} else if (playbackCheck && !a.status && a.remainingTime === playbackCache.time) { /* Pretty much have to do this to prevent multiple runs when a song starts playing */
			return;
		}
		cache = a;
		if (playbackCheck) playbackCache = {status: a.status, time: a.remainingTime};
		return true;
	},

	play: () => {
		MusicKit.getInstance().play().catch(console.error);
	},

	pause: () => {
		MusicKit.getInstance().pause();
	},

	playPause: () => {
		if (MusicKit.getInstance().isPlaying) {
			MusicKit.getInstance().pause();
		} else if (MusicKit.getInstance().nowPlayingItem != null) {
			MusicKit.getInstance().play().catch(console.error);
		}
	},

	next: () => {
		// try {
		// 	app.prevButtonBackIndicator = false;
		// } catch (e) { }
		// if (MusicKit.getInstance().queue.nextPlayableItemIndex != -1 && MusicKit.getInstance().queue.nextPlayableItemIndex != null)
		// MusicKit.getInstance().changeToMediaAtIndex(MusicKit.getInstance().queue.nextPlayableItemIndex);
		MusicKit.getInstance().skipToNextItem().then(r => console.debug(`[cider:preload] [next] Skipping to Next ${r}`));
	},

	previous: () => {
		// if (MusicKit.getInstance().queue.previousPlayableItemIndex != -1 && MusicKit.getInstance().queue.previousPlayableItemIndex != null)
		// MusicKit.getInstance().changeToMediaAtIndex(MusicKit.getInstance().queue.previousPlayableItemIndex);
		MusicKit.getInstance().skipToPreviousItem().then(r => console.debug(`[cider:preload] [previous] Skipping to Previous ${r}`));
	}

}


process.once('loaded', () => {
	console.debug("[cider:preload] IPC Listeners Created!")
	global.MusicKitInterop = MusicKitInterop;
});
