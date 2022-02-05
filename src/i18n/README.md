# Cider i18n

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