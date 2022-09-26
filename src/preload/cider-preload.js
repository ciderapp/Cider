global.ipcRenderer = require("electron").ipcRenderer;
console.info("Loaded Preload");

let cache = { playParams: { id: 0 }, status: null, remainingTime: 0 },
  playbackCache = { status: null, time: Date.now() };

const MusicKitInterop = {
  init: function () {
    /* MusicKit.Events.playbackStateDidChange */
    MusicKit.getInstance().addEventListener(MusicKit.Events.playbackStateDidChange, () => {
      const attributes = MusicKitInterop.getAttributes();
      if (!attributes) return;
      MusicKitInterop.updateMediaState(attributes);
      if (MusicKitInterop.filterTrack(attributes, true, false)) {
        global.ipcRenderer.send("playbackStateDidChange", attributes);
        global.ipcRenderer.send("wsapi-updatePlaybackState", attributes);
      }
    });

    /* MusicKit.Events.playbackProgressDidChange */
    MusicKit.getInstance().addEventListener(MusicKit.Events.playbackProgressDidChange, async () => {
      const attributes = MusicKitInterop.getAttributes();
      if (!attributes) return;
      // wsapi call
      ipcRenderer.send("wsapi-updatePlaybackState", attributes);
      // lastfm call
      if (app.mk.currentPlaybackProgress === app.cfg.connectivity.lastfm.scrobble_after / 100) {
        attributes.primaryArtist = app.cfg.connectivity.lastfm.remove_featured ? await this.fetchSongRelationships() : attributes.artistName;
        ipcRenderer.send("lastfm:scrobbleTrack", attributes);
      }
    });

    /* MusicKit.Events.playbackTimeDidChange */
    MusicKit.getInstance().addEventListener(MusicKit.Events.playbackTimeDidChange, () => {
      ipcRenderer.send("mpris:playbackTimeDidChange", MusicKit.getInstance()?.currentPlaybackTime * 1000 * 1000 ?? 0);
      const attributes = MusicKitInterop.getAttributes();
      if (!attributes) return;
      ipcRenderer.send("playbackTimeDidChange", attributes);
      MusicKitInterop.updatePositionState(attributes);
    });

    /* MusicKit.Events.nowPlayingItemDidChange */
    MusicKit.getInstance().addEventListener(MusicKit.Events.nowPlayingItemDidChange, async () => {
      if (window?.localStorage) {
        window.localStorage.setItem("currentTrack", JSON.stringify(MusicKit.getInstance().nowPlayingItem));
        window.localStorage.setItem("currentTime", JSON.stringify(MusicKit.getInstance().currentPlaybackTime));
        window.localStorage.setItem("currentQueue", JSON.stringify(MusicKit.getInstance().queue?._unplayedQueueItems));
      }

      const attributes = MusicKitInterop.getAttributes();
      if (!attributes) return;
      attributes.primaryArtist = app.cfg.connectivity.lastfm.remove_featured ? await this.fetchSongRelationships() : attributes.artistName;

      MusicKitInterop.updateMediaSession(attributes);
      global.ipcRenderer.send("nowPlayingItemDidChange", attributes);

      if (MusicKitInterop.filterTrack(attributes, false, true)) {
        global.ipcRenderer.send("lastfm:FilteredNowPlayingItemDidChange", attributes);
      } else if (attributes.name !== "no-title-found" && attributes.playParams.id !== "no-id-found") {
        global.ipcRenderer.send("lastfm:nowPlayingChange", attributes);
      }

      if (app.cfg.general.playbackNotifications && !document.hasFocus() && attributes.artistName && attributes.artwork && attributes.name) {
        global.ipcRenderer.send("playbackNotifications:create", attributes);
      }

      if (MusicKit.getInstance().nowPlayingItem) {
        await this.sleep(750);
        MusicKit.getInstance().playbackRate = app.cfg.audio.playbackRate;
      }
      console.debug("[cider:preload] nowPlayingItemDidChange");
    });

    /* MusicKit.Events.authorizationStatusDidChange */
    MusicKit.getInstance().addEventListener(MusicKit.Events.authorizationStatusDidChange, () => {
      global.ipcRenderer.send("authorizationStatusDidChange", MusicKit.getInstance().authorizationStatus);
    });

    /* MusicKit.Events.mediaPlaybackError */
    MusicKit.getInstance().addEventListener(MusicKit.Events.mediaPlaybackError, (e) => {
      console.warn(`[cider:preload] mediaPlaybackError] ${e}`);
    });

    /* MusicKit.Events.shuffleModeDidChange */
    MusicKit.getInstance().addEventListener(MusicKit.Events.shuffleModeDidChange, () => {
      global.ipcRenderer.send("shuffleModeDidChange", MusicKit.getInstance().shuffleMode);
    });

    /* MusicKit.Events.repeatModeDidChange */
    MusicKit.getInstance().addEventListener(MusicKit.Events.repeatModeDidChange, () => {
      global.ipcRenderer.send("repeatModeDidChange", MusicKit.getInstance().repeatMode);
    });
  },

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },

  async fetchSongRelationships({ id = this.getAttributes().songId, relationship = "primaryName" } = {}) {
    if (!id) return null;
    const res = await MusicKit.getInstance().api.v3.music("/v1/catalog/" + MusicKit.getInstance().storefrontId + `/songs/${id}`, {
      include: {
        songs: ["artists"],
      },
    });

    if (!res || !res.data) {
      console.warn("[cider:preload] fetchSongRelationships: no response");
      if (id === this.getAttributes().songId) {
        return this.getAttributes().artistName;
      }
    }
    if (!res.data.data.length) {
      console.error(`[cider:preload] fetchSongRelationships: Unable to locate song with id of ${id}`);
      if (id === this.getAttributes().songId) {
        return this.getAttributes().artistName;
      }
    }

    const songData = res.data.data[0];
    const artistData = songData.relationships.artists.data;
    const albumData = songData.relationships.albums.data;
    const primaryArtist = artistData[0];

    switch (relationship) {
      default:
      case "primaryName":
        if (artistData.length < 1) {
          console.error(`[cider:preload] fetchSongRelationships: Unable to find artists related to the song with id of ${id}`);
          return app.mk.nowPlayingItem.attributes.artistName;
        }
        return primaryArtist.attributes.name;

      case "primaryArtist":
        return primaryArtist;

      case "album":
        return albumData[0];
    }
  },

  getAttributes: function () {
    const mk = MusicKit.getInstance();
    const nowPlayingItem = mk.nowPlayingItem;
    const isPlayingExport = mk.isPlaying;
    const remainingTimeExport = mk.currentPlaybackTimeRemaining;
    const currentPlaybackProgress = mk.currentPlaybackProgress;
    const attributes = nowPlayingItem != null ? nowPlayingItem.attributes : {};

    attributes.songId = attributes.songId ?? attributes.playParams?.catalogId ?? attributes.playParams?.id;
    attributes.kind = nowPlayingItem?.type ?? attributes?.type ?? attributes.playParams?.kind ?? "";
    attributes.status = nowPlayingItem == null ? null : !!isPlayingExport;
    attributes.name = attributes?.name ?? "no-title-found";
    attributes.artwork = attributes?.artwork ?? { url: "" };
    attributes.artwork.url = (attributes?.artwork?.url ?? "").replace(`{f}`, "png");
    attributes.playParams = attributes?.playParams ?? { id: "no-id-found" };
    attributes.playParams.id = attributes?.playParams?.id ?? "no-id-found";
    attributes.url = {
      cider: `https://cider.sh/link?play/s/${nowPlayingItem?._songId ?? nowPlayingItem?.songId ?? "no-id-found"}`,
      appleMusic: attributes.websiteUrl ? attributes.websiteUrl : `https://music.apple.com/${mk.storefrontId}/song/${nowPlayingItem?._songId ?? nowPlayingItem?.songId ?? "no-id-found"}`,
      songLink: "https://song.link/i/" + attributes.songId,
    };
    if (attributes.playParams.id === "no-id-found") {
      attributes.playParams.id = nowPlayingItem?.id ?? "no-id-found";
    }
    attributes.albumName = attributes?.albumName ?? "";
    attributes.artistName = attributes?.artistName ?? "";
    attributes.genreNames = attributes?.genreNames ?? [];
    attributes.remainingTime = remainingTimeExport ? remainingTimeExport * 1000 : 0;
    attributes.durationInMillis = attributes?.durationInMillis ?? 0;
    attributes.currentPlaybackTime = mk?.currentPlaybackTime ?? 0;
    attributes.currentPlaybackProgress = currentPlaybackProgress ?? 0;
    attributes.startTime = Date.now();
    attributes.endTime = Math.round(attributes?.playParams?.id === cache.playParams.id ? Date.now() + attributes?.remainingTime : attributes?.startTime + attributes?.durationInMillis);

    if (attributes.name === "no-title-found") {
      return;
    }
    return attributes;
  },

  filterTrack: function (a, playbackCheck, mediaCheck) {
    if (a.name === "no-title-found" || a.playParams.id === "no-id-found") {
      return;
    } else if (mediaCheck && a.playParams.id === cache.playParams.id) {
      return;
    } else if (playbackCheck && a.status === playbackCache.status) {
      return;
    } else if (playbackCheck && !a.status && a.remainingTime === playbackCache.time) {
      /* Pretty much have to do this to prevent multiple runs when a song starts playing */
      return;
    }
    cache = a;
    if (playbackCheck) playbackCache = { status: a.status, time: a.remainingTime };
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
    if (app) {
      app.skipToNextItem();
    } else {
      MusicKit.getInstance()
        .skipToNextItem()
        .then((r) => console.debug(`[cider:preload] [next] Skipping to Next ${r}`));
    }
  },

  previous: () => {
    if (app) {
      app.skipToPreviousItem();
    } else {
      MusicKit.getInstance()
        .skipToPreviousItem()
        .then((r) => console.debug(`[cider:preload] [previous] Skipping to Previous ${r}`));
    }
  },

  initMediaSession: () => {
    if ("mediaSession" in navigator) {
      console.debug("[cider:preload] [initMediaSession] Media Session API supported");
      navigator.mediaSession.setActionHandler("play", () => {
        MusicKitInterop.play();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        MusicKitInterop.pause();
      });
      navigator.mediaSession.setActionHandler("stop", () => {
        MusicKit.getInstance().stop();
      });
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        if (details.seekOffset) {
          MusicKit.getInstance().seekToTime(Math.max(MusicKit.getInstance().currentPlaybackTime - details.seekOffset, 0));
        } else {
          MusicKit.getInstance().seekBackward();
        }
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        if (details.seekOffset) {
          MusicKit.getInstance().seekToTime(Math.max(MusicKit.getInstance().currentPlaybackTime + details.seekOffset, 0));
        } else {
          MusicKit.getInstance().seekForward();
        }
      });
      navigator.mediaSession.setActionHandler("seekto", ({ seekTime, fastSeek }) => {
        MusicKit.getInstance().seekToTime(seekTime);
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        MusicKitInterop.previous();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        MusicKitInterop.next();
      });
    } else {
      console.debug("[cider:preload] [initMediaSession] Media Session API not supported");
    }
  },

  updateMediaSession: (a) => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: a.name,
        artist: a.artistName,
        album: a.albumName,
        artwork: [
          {
            src: a.artwork.url.replace("/{w}x{h}bb", "/96x96bb").replace("/2000x2000bb", "/35x35bb"),
            sizes: "96x96",
            type: "image/jpeg",
          },
          {
            src: a.artwork.url.replace("/{w}x{h}bb", "/128x128bb").replace("/2000x2000bb", "/35x35bb"),
            sizes: "128x128",
            type: "image/jpeg",
          },
          {
            src: a.artwork.url.replace("/{w}x{h}bb", "/192x192bb").replace("/2000x2000bb", "/35x35bb"),
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src: a.artwork.url.replace("/{w}x{h}bb", "/256x256bb").replace("/2000x2000bb", "/35x35bb"),
            sizes: "256x256",
            type: "image/jpeg",
          },
          {
            src: a.artwork.url.replace("/{w}x{h}bb", "/384x384bb").replace("/2000x2000bb", "/35x35bb"),
            sizes: "384x384",
            type: "image/jpeg",
          },
          {
            src: a.artwork.url.replace("/{w}x{h}bb", "/512x512bb").replace("/2000x2000bb", "/35x35bb"),
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });
    }
  },

  updateMediaState: (a) => {
    if ("mediaSession" in navigator) {
      console.debug("[cider:preload] [updateMediaState] Updating Media State to " + a.status);
      switch (a.status) {
        default:
        case null:
          navigator.mediaSession.playbackState = "none";
          break;

        case false:
          navigator.mediaSession.playbackState = "paused";
          break;

        case true:
          navigator.mediaSession.playbackState = "playing";
          break;
      }
    }
  },

  updatePositionState: (a) => {
    if ("mediaSession" in navigator && a.currentPlaybackTime <= a.durationInMillis / 1000 && a.currentPlaybackTime >= 0) {
      navigator.mediaSession.setPositionState({
        duration: a.durationInMillis / 1000,
        playbackRate: app?.cfg?.audio?.playbackRate ?? 1,
        position: a.currentPlaybackTime,
      });
    }
  },
};

process.once("loaded", () => {
  console.debug("[cider:preload] IPC Listeners Created!");
  global.MusicKitInterop = MusicKitInterop;
});
