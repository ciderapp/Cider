# Cider i18n Notices & Changelog

Some notes about Cider's i18n support.

- Localization files are stored in `json` format aka `JavaScript Object Notation`.
- The default language is English.
- The default language is used for messages that are not translated.
- Try when possible to keep the messages the similar in length to the English ones.
- Most of the strings in the content area are provided and translated by Apple themselves, and do not need to be translated.
- The language Apple Music uses are dependent on the storefront region.

# Multiple Plural Forms

Multiple plural forms can be supported as below:

The keys and its meanings are here: https://github.com/prantlf/fast-plural-rules/blob/master/docs/languages.md#supported-languages

For example, English is in Plural rule #1 and has 2 keys ```one``` and ```other```

Russian is in Plural rule #7 (3 forms): ```one```, ```few``` and ```other```

How it is implemented for English:

```
 "term.track": {
    "one` : "track",
    "other" : "tracks"
  },
```


## Localization Notices

Several changes have been made to configuration options and will be listed below with the relevant locales that have been modified, the ones not mentioned in the list need modifying.

* `settings.option.experimental.closeButtonBehaviour`: Changed to `close_button_hide` - Should be `Close Button Should Hide the Application`. `.quit`, `.minimizeTaskbar` and `.minimizeTray` have been removed. Translations done for en_US.
* `action.update`: Added for `en_US`
* `term.topResult`: `Top Result` - Added for `en_US`
* `term.sharedPlaylists`: `Shared Playlists` - Added for `en_US`
* `term.people`: `People` - Added for `en_US`

Update 02/02/2022 17:16 UTC

* `term.newpreset.name`: Added for `en_US`
* `term.addedpreset`: Added for `en_US`
* `term.deletepreset.warn`: Added for `en_US`
* `term.deletedpreset`: Added for `en_US`
* `term.musicVideos`: Added for `en_US`
* `term.stations`: Added for `en_US`
* `term.curators`: Added for `en_US`
* `term.appleCurators`: Added for `en_US`
* `term.radioShows`: Added for `en_US`
* `term.recordLabels`: Added for `en_US`
* `term.videoExtras`: Added for `en_US`
* `term.top`: Added for `en_US`
* `action.newpreset`: Added for `en_US`
* `action.deletepreset`: Added for `en_US`

Update 04/02/2022 10:00 UTC

* `term.history`: Added for `en_US`
* `action.copy`: Added for `en_US`
* `settings.header.visual.theme`: Added for `en_US`
* `settings.option.visual.theme.default`: Added for `en_US`
* `settings.option.visual.theme.dark`: Added for `en_US`
* `settings.option.experimental.copy_log`: Added for `en_US`
* `settings.option.experimental.inline_playlists`: Added for `en_US`

Update 05/02/2022 09:00 UTC

* `settings.header.audio.quality.hireslossless`: Added for `en_US`
* `settings.header.audio.quality.hireslossless.description`: Added for `en_US`
* `settings.header.audio.quality.lossless`: Added for `en_US`
* `settings.header.audio.quality.lossless.description`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.ciderPPE`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.ciderPPE.description`: Added for `en_US`

Update 06/02/2022 10:35 UTC

* `settings.header.audio.quality.hireslossless.description`: Brackets removed, handled in renderer
* `settings.header.audio.quality.lossless.description`: Brackets removed, handled in renderer
* `settings.header.audio.quality.high.description`: Added for `en_US`
* `settings.header.audio.quality.auto`: Removed as default for MusicKit is 256
* `settings.header.audio.quality.standard`: Replaced `settings.header.audio.quality.low` to match MusicKit naming
* `settings.header.audio.quality.standard.description`: Added for `en_US`

Update 08/02/2022 10:20 UTC

* `settings.option.general.updateCider`: Added for `en_US`
* `settings.option.general.updateCider.branch`: Added for `en_US`
* `settings.option.general.updateCider.branch.description`: Added for `en_US`
* `settings.option.general.updateCider.branch.main`: Added for `en_US`
* `settings.option.general.updateCider.branch.develop`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.description`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.standard`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.aggressive`: Added for `en_US`
* `settings.warn.audio.enableAdvancedFunctionality.ciderPPE.compatibility`: Added for `en_US`
* `settings.warn.audio.enableAdvancedFunctionality.audioSpatialization.compatibility`: Added for `en_US`
* `term.requestError`: Added for `en_US`
* `term.song.link.generate`: Added for `en_US`

Update 10/02/2022 05:58 UTC

* `term.sortBy.dateAdded`: Added for `en_US`

Update 12/02/2022 12:00 UTC

* Added support for multiple plural forms. [Details](#multiple-plural-forms)
* `term.version`: Added for `en_US`
* `settings.option.visual.theme.github.download`: Added for `en_US`
* `settings.prompt.visual.theme.github.URL`: Added for `en_US`
* `settings.notyf.visual.theme.install.success`: Added for `en_US`
* `settings.notyf.visual.theme.install.error`: Added for `en_US`
* `term.defaultPresets`: Added for `en_US`
* `term.userPresets`: Added for `en_US`

Update 16/02/2022 21:45 UTC

* `term.audioControls`: Added for `en_US`
* `settings.option.audio.volumeStep`: Added for `en_US`
* `settings.option.audio.maxVolume`: Added for `en_US`

Update 17/02/2022 10:00 UTC

+ `settings.header.debug`: Added for `en_US`
+ `settings.option.debug.copy_log`: Replaces `settings.option.experimental.copy_log`
+ `settings.option.debug.openAppData`: Added for `en_US`
+ `action.open`: Added for `en_US`

Update 19/02/2022 21:00 UTC

* `term.noVideos`: Added for `en_US`
* `term.plugin`: Added for `en_US`
* `term.pluginMenu`: Added for `en_US`
* `term.replay`: Added for `en_US`
* `term.uniqueAlbums`: Added for `en_US`
* `term.uniqueArtists`: Added for `en_US`
* `term.uniqueSongs`: Added for `en_US`
* `term.topArtists`: Added for `en_US`
* `term.listenedTo`: Added for `en_US`
* `term.times`: Added for `en_US`
* `term.topAlbums`: Added for `en_US`
* `term.plays`: Added for `en_US`
* `term.topGenres`: Added for `en_US`
* `action.install`: Added for `en_US`
* `settings.option.general.resumebehavior`: Added for `en_US`
* `settings.option.general.resumebehavior.description`: Added for `en_US`
* `settings.option.general.resumebehavior.locally`: Added for `en_US`
* `settings.option.general.resumebehavior.locally.description`: Added for `en_US`
* `settings.option.general.resumebehavior.history`: Added for `en_US`
* `settings.option.general.resumebehavior.history.description`: Added for `en_US`
* `settings.option.audio.audioLab`: Added for `en_US`
* `settings.option.audio.audioLab.description`: Added for `en_US`
* `settings.warn.audioLab.withoutAF`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.analogWarmth`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.analogWarmth.description`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.analogWarmthIntensity`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.analogWarmthIntensity.description`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.analogWarmthIntensity.smooth`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.analogWarmthIntensity.warm`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.description`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile.description`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile.standard`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile.audiophile`: Added for `en_US`
* `settings.header.visual.theme.github.page`: Added for `en_US`
* `settings.option.visual.theme.github.explore`: Added for `en_US`
* `settings.option.visual.theme.github.install.confirm`: Added for `en_US`
* `settings.option.experimental.unknownPlugin`: Added for `en_US`
* `settings.option.experimental.unknownPlugin.description`: Added for `en_US`

Update 25/02/2022 15:30 UTC

* `action.moveToTop`: Changed to `Move out of Folder` instead of `Move to top`

Update 27/02/2022 18:30 UTC

* `settings.notyf.updateCider.update-not-available`: Added for `en_US`
* `settings.notyf.updateCider.update-timeout`: Added for `en_US`
* `settings.notyf.updateCider.update-downloaded`: Added for `en_US`
* `settings.notyf.updateCider.update-error`: Added for `en_US`

Update 28/02/2022 13:00 UTC

* `term.time.days`: Added for `en_US`
* `term.time.day`: Added for `en_US`

Update 10/03/2022 14:00 UTC

* `settings.header.window`: Added for `en_US`
* `settings.header.window.description`: Added for `en_US`
* `settings.option.window.openOnStartup`: Added for `en_US`
* `settings.option.window.openOnStartup.hidden`: Added for `en_US`

Update 20/03/2022 00:01 UTC

* `term.creditDesignedBy`: Added for `en_US`

Update 29/03/2022 04:00 UTC

* `settings.option.audio.enableAdvancedFunctionality.ciderPPE.description`: Changed for `en_US` (Deleted for all language files)

Update 06/04/2022 08:30 UTC

* `settings.option.general.customizeSidebar`: Added for `en_US`
* `settings.option.general.customizeSidebar.customize`: Added for `en_US`
* `settings.option.window.useNativeTitleBar`: Added for `en_US`
* `settings.option.window.windowControlStyle.right`: Added for `en_US`
* `settings.option.window.windowControlStyle.left`: Added for `en_US`

Update 06/04/2022 16:45 UTC

* `settings.option.visual.windowStyle`: Added for `en_US`

Update 06/04/2022 18:45 UTC

* `action.cast.chromecast`: Added for `en_US`
* `action.cast.todevices`: Added for `en_US`
* `action.cast.stop`: Added for `en_US`
* `action.cast.airplay`: Added for `en_US`
* `action.cast.airplay.underdevelopment`: Added for `en_US`
* `action.cast.scan`: Added for `en_US`
* `action.cast.scanning`: Added for `en_US`

Update 07/04/2022 14:30 UTC

* `term.cast`: Added for `en_US`

Update 08/04/2022 08:00 UTC

* `action.createNew`: Added for `en_US`

Update 09/04/2022 11:00 UTC

* `term.disablePrivateSession`: Added for `en_US`

Update 10/04/2022 07:30 UTC

* `settings.option.visual.uiscale`: Added for `en_US`

Update 11/04/2022 13:45 UTC

* `action.openArtworkInBrowser`: Added for `en_US`

Update 09/04/2022 13:45 UTC

* `action.tray.show`: Changed for `en_US` (Deleted for all language files)

Update 14/04/2022 14:30 UTC

* `term.variables`: Added for `en_US`
* `settings.option.connectivity.discordRPC.clientName`: Added for `en_US`
* `settings.option.connectivity.discordRPC.detailsFormat`: Added for `en_US`
* `settings.option.connectivity.discordRPC.stateFormat`: Added for `en_US`
* `settings.header.connectivity.discordRPC.cider`: Removed from `en_US`
* `settings.header.connectivity.discordRPC.appleMusic`: Removed from `en_US`

Update 16/04/2022 9:30 UTC

* `settings.header.connect`: Added for `en_US`

Update 22/04/2022 13:00 UTC

* `settings.option.general.keybindings`: Added for `en_US`
* `settings.option.general.keybindings.open`: Added for `en_US`

Update 22/04/2022 16:00 UTC

* `settings.option.visual.theme.github.openfolder`: Added for `en_US`

Update 24/04/2022 19:00 UTC

* `settings.option.audio.changePlaybackRate`: Added for `en_US`
* `settings.option.audio.playbackRate`: Added for `en_US`
* `settings.option.audio.playbackRate.change`: Added for `en_US`

Update 25/04/2022 00:21 UTC

* `settings.description.search`: Added for `en_US`
* `settings.description.albums`: Added for `en_US`
* `settings.description.artists`: Added for `en_US`
* `settings.description.browse`: Added for `en_US`
* `settings.description.private`: Added for `en_US`
* `settings.description.remote`: Added for `en_US`
* `settings.description.audio`: Added for `en_US`
* `settings.description.plugins`: Added for `en_US`
* `settings.description.cast`: Added for `en_US`
* `settings.description.settings`: Added for `en_US`
* `settings.description.developer`: Added for `en_US`

Update 28/04/2022 21:45 UTC

* `settings.option.general.resumetabs`: Added for `en_US`
* `settings.option.general.resumetabs.description`: Added for `en_US`
* `settings.option.general.resumetabs.dynamic`: Added for `en_US`
* `settings.option.general.resumetabs.dynamic.description`: Added for `en_US`
* `term.dynamic`: Added for `en_US`

Update 29/04/2022 00:00 UTC
* `menubar.options.about`: Added for `en_US`
* `menubar.options.settings`: Added for `en_US`
* `menubar.options.quit`: Added for `en_US`
* `menubar.options.view`: Added for `en_US`
* `menubar.options.reload`: Added for `en_US`
* `menubar.options.forcereload`: Added for `en_US`
* `menubar.options.toggledevtools`: Added for `en_US`
* `menubar.options.window`: Added for `en_US`
* `menubar.options.minimize`: Added for `en_US`
* `menubar.options.toggleprivate`: Added for `en_US`
* `menubar.options.webremote`: Added for `en_US`
* `menubar.options.audio`: Added for `en_US`
* `menubar.options.plugins`: Added for `en_US`
* `menubar.options.control`: Added for `en_US`
* `menubar.options.next`: `Added for `en_US`
* `menubar.options.previous`: Added for `en_US`
* `menubar.options.volumeup`: Added for `en_US`
* `menubar.options.volumedown`: Added for `en_US`
* `menubar.options.browse`: Added for `en_US`
* `menubar.options.artists`: Added for `en_US`
* `menubar.options.search`: Added for `en_US`
* `menubar.options.albums`: Added for `en_US`
* `menubar.options.cast`: Added for `en_US`
* `menubar.options.account`: Added for `en_US`
* `menubar.options.accountsettings`: Added for `en_US`
* `menubar.options.signout`: Added for `en_US`
* `menubar.options.support`: Added for `en_US`
* `menubar.options.discord`: Added for `en_US`
* `menubar.options.github`: Added for `en_US`
* `menubar.options.report`: Added for `en_US`
* `menubar.options.bug`: Added for `en_US`
* `menubar.options.feature`: Added for `en_US`
* `menubar.options.trans`: Added for `en_US`
* `menubar.options.license`: Added for `en_US`
* `menubar.options.conf`: Added for `en_US`

Update 08/05/2022 00:29 UTC

* `settings.option.visual.theme.github.available`: Added for `en_US`
* `settings.option.visual.theme.github.applied`: Added for `en_US`

Update 09/05/2022 01:50 UTC

* `menubar.options.listennow`: Added for `en_US`
* `menubar.options.recentlyAdded`: Added for `en_US`
* `menubar.options.songs`: Added for `en_US`
* `settings.description.listnow`: Added for `en_US`
* `settings.description.recentAdd`: Added for `en_US`
* `settings.description.songs`: Added for `en_US`
* `settings.option.general.keybindings.pressCombination`: Added for `en_US`
* `settings.option.general.keybindings.pressEscape`: Added for `en_US`
* `settings.option.visual.theme.github.available`: Added for `en_US`
* `settings.option.visual.theme.github.applied`: Added for `en_US`

Update 09/05/2022 19:30 UTC

* `settings.option.audio.enableAdvancedFunctionality.audioSpatialization`: Deleted for all language files
* `settings.option.audio.enableAdvancedFunctionality.audioSpatialization.description`: Deleted for all language files

Update 12/05/2022 19:00 UTC

* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.NATURAL_STANDARD`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.NATURAL_HIGH`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.NATURAL_PLUS`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile.standard`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile.soundstage`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile.separation`: Added for `en_US`

Update 12/05/2022 22:50 UTC

* `settings.option.audio.dbspl.display`: Added for `en_US`
* `settings.option.audio.dbspl.description`: Added for `en_US`
* `settings.option.audio.dbfs.calibration`: Added for `en_US`
* `settings.option.audio.dbfs.description`: Added for `en_US`

Update 14/05/2022 02:00 UTC

* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.NATURAL_HIGH`: Deleted for all language files
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.NATURAL_STANDARD`: Renamed for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.NATURAL_PLUS`: Renamed for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.E68_1`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.E68_2`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.E168_1`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.Z3600`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.Z8500A`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.Z8500B`: Added for `en_US`
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.Z8500C`: Added for `en_US`

Update 18/05/2022 14:20 UTC

* `action.tray.playpause`: Added for `en_US`,
* `action.tray.next`: Added for `en_US`,
* `action.tray.previous`: Added for `en_US`,

Update 22/05/2022 03:53 UTC
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile.diffused`: Added for `en_US`

Update 22/05/2022 14:32 UTC

* `notification.connectionError`: Deleted for all language files
* `settings.button.visual.theme.github.openfolder`: Deleted for all language files
* `settings.header.audio.quality.auto`: Deleted for all language files
* `settings.header.audio.quality.enhanced`: Deleted for all language files
* `settings.header.audio.quality.low`: Deleted for all language files
* `settings.header.connectivity.discordRPC.appleMusic`: Deleted for all language files
* `settings.header.connectivity.discordRPC.cider`: Deleted for all language files
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.NATURAL_HIGH`: Deleted for all language files
* `settings.option.audio.enableAdvancedFunctionality.audioSpatialization`: Deleted for all language files
* `settings.option.audio.enableAdvancedFunctionality.audioSpatialization.description`: Deleted for all language files
* `settings.option.experimental.closeButtonBehaviour`: Deleted for all language files
* `settings.option.experimental.closeButtonBehaviour.minimizeTaskbar`: Deleted for all language files
* `settings.option.experimental.closeButtonBehaviour.minimizeTray`: Deleted for all language files
* `settings.option.experimental.closeButtonBehaviour.quit`: Deleted for all language files
* `settings.option.experimental.close_button_hide`: Deleted for all language files
* `settings.option.experimental.copy_log`: Deleted for all language files
* `term.spacializedAudioSetting`: Deleted for all language files
* `term.updateCider`: Deleted for all language files

Update 24/05/2022 20:30 UTC

* `settings.option.visual.transparent.description`: Updated in `el_GR`, `en_OWO`, `en_US`, `es_ES`, `es_MX`, `hu_HU`, `in_ID`, `ja_JP`, `ko_KR`, `nl_NL`, `tr_TR`, please verify if it is correct

Update 24/05/2022 21:15 UTC

* `settings.option.general.updateCider`: Deleted for all language files 
* `settings.option.general.updateCider.branch`: Deleted for all language files 
* `settings.option.general.updateCider.branch.description`: Deleted for all language files
* `settings.option.general.updateCider.branch.main`: Deleted for all language files 
* `settings.option.general.updateCider.branch.develop`: Deleted for all language files
* `settings.notyf.updateCider.update-error`: Deleted for all language files

Update 30/5/2022 05:35 UTC

* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.BSCBM`: Added to `en_US`
* `settings.option.audio.enableAdvancedFunctionality.atmosphereRealizerMode.CUDDLE`: Added to `en_US`
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile.bplk`: Added to `en_US`
* `settings.option.audio.enableAdvancedFunctionality.tunedAudioSpatialization.profile.hw2k`: Added to `en_US`
* `settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.adaptive`: Added to `en_US`
* `settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.legacy`: Added to `en_US`

Update 03/06/2022 11:40 UTC

* `settings.option.connectivity.discordRPC.reload`: Added to `en_US`
* `settings.option.connectivity.discordRPC.reconnectedToUser`: Added to `en_US`

Update 04/06/2022 03:00 UTC

* `term.cast`: Added to `en_US`
*  `term.playpause`: Added to `en_US`
*  `term.reload`: Added to `en_US`
*  `term.toggleprivate`: Added to `en_US`
*  `term.webremote`: Added to `en_US`
*  `term.cast2`: Added to `en_US`
*  `term.quit`: Added to `en_US`
*  `menubar.options.zoom`: Added to `en_US`
*  `term.zoomin`: Added to `en_US`
*  `term.zoomout`: Added to `en_US`
*  `term.zoomreset`: Added to `en_US`
*  `term.fullscreen`: Added to `en_US`
*  `settings.option.general.keybindings.library`: Added to `en_US`
*  `settings.option.general.keybindings.session`: Added to `en_US`
*  `settings.option.general.keybindings.control`: Added to `en_US`
*  `settings.option.general.keybindings.interface`: Added to `en_US`
*  `settings.option.general.keybindings.advanced`: Added to `en_US`

*  `action.tray.quit`: Deleted for all language files
*  `action.tray.playpause`: Deleted for all language files
*  `action.tray.next`: Deleted for all language files
*  `action.tray.previous`: Deleted for all language files
*  `menubar.options.about`: Deleted for all language files
*  `menubar.options.settings`: Deleted for all language files
*  `menubar.options.quit`: Deleted for all language files
*  `menubar.options.toggleprivate`: Deleted for all language files
*  `menubar.options.webremote`: Deleted for all language files
*  `menubar.options.audio`: Deleted for all language files
*  `menubar.options.next`: Deleted for all language files
*  `menubar.options.previous`: Deleted for all language files
*  `menubar.options.browse`: Deleted for all language files
*  `menubar.options.artists`: Deleted for all language files
*  `menubar.options.search`: Deleted for all language files
*  `menubar.options.albums`: Deleted for all language files
*  `menubar.options.cast`: Deleted for all language files
*  `menubar.options.accountsettings`: Deleted for all language files
*  `menubar.options.discord`: Deleted for all language files
*  `menubar.options.github`: Deleted for all language files,
*  `menubar.options.listennow`: Deleted for all language files
*  `menubar.options.recentlyAdded`: Deleted for all language files
*  `menubar.options.songs`: Deleted for all language files
*  `settings.option.general.keybindings.open`: Deleted for all language files
*  `menubar.options.playpause`: Deleted for all language files
Update 10/06/2022 20:00 UTC

* `settings.option.visual.purplePodcastPlaybackBar`: Added to `en_US`

Update 14/06/2022 14:10 UTC

* `term.themeManaged`: Added to `en_US`

