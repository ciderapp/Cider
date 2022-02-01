import { _electron as electron } from "playwright";
import { test, expect } from "@playwright/test";
import { join } from "path";
import * as fs from "fs";

test("Launch electron app", async () => {

	const aa = fs.readdirSync(join(__dirname, "../../"))

	console.log(aa)
	console.log(__dirname)

	const electronApp = await electron.launch({ args: [join(__dirname, "../main")] });

	const appPath = await electronApp.evaluate(async ({ app }) => {
		// This runs in the main Electron process, parameter here is always
		// the result of the require('electron') in the main app script.
		return app.getAppPath();
	});
	console.log(`cwd: ${appPath}`);



	const windowState: { isVisible: boolean, isDevToolsOpened: boolean, isCrashed: boolean } = await electronApp.evaluate(async ({ BrowserWindow, app }) => {
		const win = BrowserWindow.getAllWindows()[0];

		console.log(win)

		const getState = (win: Electron.BrowserWindow) => ({
			isVisible: win.isVisible(),
			isDevToolsOpened: win.webContents.isDevToolsOpened(),
			isCrashed: win.webContents.isCrashed()
		})

		return new Promise((resolve) => {
			if (win && win.isVisible()) {
				resolve(getState(win))
			} else if (win) {
				win.once("ready-to-show", () => setTimeout(() => resolve(getState(win))));
			} else {
				app.once("browser-window-created", (_e: Event, window: Electron.BrowserWindow) => setTimeout(() => resolve(getState(window))));
			}
		})

	})

	console.log(windowState)

	expect(windowState.isVisible).toBeTruthy();
	expect(windowState.isDevToolsOpened).toBeFalsy();
	expect(windowState.isCrashed).toBeFalsy();

	await electronApp.close();
});
