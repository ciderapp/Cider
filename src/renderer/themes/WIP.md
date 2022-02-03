# Themes (WIP)

## Making a theme
* If one does not already exist, create a new theme directory in the user data folder.
  * **Windows:** `%appdata%/Cider/themes`
  * **Mac:** `~/Library/Application Support/Cider/themes`
  * **Linux:** `~/.config/Cider/themes`
* Create a `theme.less` file with the name of the theme.
* In Cider, select the theme in the settings.
* To enable hot reloading for the theme, open the DevTools and enter `less.watch()` in the console.

## Resources
* The default styles.less can be found in: [src/renderer/style.less](https://github.com/ciderapp/Cider/tree/main/src/renderer/style.less)
* [Less.js documentation](https://lesscss.org/)