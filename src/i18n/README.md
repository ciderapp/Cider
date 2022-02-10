# Cider i18n Notices & Changelog

Some notes about Cider's i18n support.

- Localization files are stored in jsonc format aka "JSON with Comments"
- The default language is English.
- The default language is used for messages that are not translated.
- Try when possible to keep the messages the similar in length to the English ones.
- Most of the strings in the content area are provided and translated by Apple themselves, and do not need to be translated.
- The language Apple Music uses are dependent on the storefront region.


## Localization Notices

Several changes have been made to configuration options and will be listed below with the relevant locales that have
been modified, the ones not mentioned in the list need modifying.

* `settings.option.experimental.closeButtonBehaviour`: Changed to `close_button_hide` - Should be "Close Button Should Hide the Application". `.quit`, `.minimizeTaskbar` and `.minimizeTray` have been removed. Translations done for en_US.
* `action.update`: Added for `en_US`.
* `term.topResult`: "Top Result" - Added for `en_US`.
* `term.sharedPlaylists`: "Shared Playlists" - Added for `en_US`.
* `term.people`: "People" - Added for `en_US`.

Update 02/02/2022 17:16 UTC

* `term.newpreset.name`: Added for `en_US`.
* `term.addedpreset`: Added for `en_US`.
* `term.deletepreset.warn`: Added for `en_US`.
* `term.deletedpreset`: Added for `en_US`.
* `term.musicVideos`: Added for `en_US`.
* `term.stations`: Added for `en_US`.
* `term.curators`: Added for `en_US`.
* `term.appleCurators`: Added for `en_US`.
* `term.radioShows`: Added for `en_US`.
* `term.recordLabels`: Added for `en_US`.
* `term.videoExtras`: Added for `en_US`.
* `term.top`: Added for `en_US`.
* `action.newpreset`: Added for `en_US`.
* `action.deletepreset`: Added for `en_US`.

Update 04/02/2022 10:00 UTC

* `term.history`: Added for `en_US`.
* `action.copy`: Added for `en_US`.
* `settings.header.visual.theme`: Added for `en_US`.
* `settings.option.visual.theme.default`: Added for `en_US`.
* `settings.option.visual.theme.dark`: Added for `en_US`.
* `settings.option.experimental.copy_log`: Added for `en_US`.
* `settings.option.experimental.inline_playlists`: Added for `en_US`.

Update 05/02/2022 09:00 UTC

* `settings.header.audio.quality.hireslossless`: Added for `en_US`.
* `settings.header.audio.quality.hireslossless.description`: Added for `en_US`.
* `settings.header.audio.quality.lossless`: Added for `en_US`.
* `settings.header.audio.quality.lossless.description`: Added for `en_US`.
* `settings.option.audio.enableAdvancedFunctionality.ciderPPE`: Added for `en_US`.
* `settings.option.audio.enableAdvancedFunctionality.ciderPPE.description`: Added for `en_US`.

Update 06/02/2022 10:35 UTC

* `settings.header.audio.quality.hireslossless.description`: Brackets removed, handled in renderer.
* `settings.header.audio.quality.lossless.description`: Brackets removed, handled in renderer.
* `settings.header.audio.quality.high.description`: Added for `en_US`.
* `settings.header.audio.quality.auto`: Removed as default for MusicKit is 256.
* `settings.header.audio.quality.standard`: Replaced `settings.header.audio.quality.low` to match MusicKit naming.
* `settings.header.audio.quality.standard.description`: Added for `en_US`.

Update 08/02/2022 10:20 UTC

* `settings.option.general.updateCider`: Added for `en_US`.
* `settings.option.general.updateCider.branch`: Added for `en_US`.
* `settings.option.general.updateCider.branch.description`: Added for `en_US`.
* `settings.option.general.updateCider.branch.main`: Added for `en_US`.
* `settings.option.general.updateCider.branch.develop`: Added for `en_US`.
* `settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength`: Added for `en_US`.
* `settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.description`: Added for `en_US`.
* `settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.standard`: Added for `en_US`.
* `settings.option.audio.enableAdvancedFunctionality.ciderPPEStrength.aggressive`: Added for `en_US`.
* `settings.warn.audio.enableAdvancedFunctionality.ciderPPE.compatibility`: Added for `en_US`.
* `settings.warn.audio.enableAdvancedFunctionality.audioSpatialization.compatibility`: Added for `en_US`.
* `term.requestError`: Added for `en_US`.
* `term.song.link.generate`: Added for `en_US`.

Update 10/02/2022 05:58 UTC

* `term.sortBy.dateAdded`: Added for `en_US`.
