# Responsible Cooking Alliance

An application for cooking influencers to assess the compliance of their content with the national nutrition guidelines and promote of sustainability practices. A component of [DietWise](https://dietwise.eu/).

This project builds a browser plugin for Firefox and Chrome.

## Development

Browser plugins are not the usual case of front-end development. Here are a few words on how to set up your development environment.

Start with the usual routine procedure, install Node (latest LTS, 24.x for now) `npm install`.

Take a look at the build scripts:

- `clean`: As the name implies, cleans all derived artifacts.
- `dev`: Runs the application as a "normal" web app, with hot code replacements and all. Open it in a browser using the address indicated in the command line. Most of the code takes care of running in a "normal" browser without access to the special plugin APIs, but functionality will be limited. Use this only for quick verification of the functionality.
- `build-xxx`: (`xxx` = `chrome` | `firefox`) Build the plugins for the respective browser. Use this build command to build a production version of the plugin.
- `build-xxx-with-sourcemaps`: Build the plugins, include source maps. Use this build command to build a debug version of the plugin.
- `build-xxx-watch`: Builds the plugin directory but also watches for code changes. This is the most powerful option for development. See below for how to run the plugin in the respective browser.
- `build-all`: Runs both `build-xxx` commands.
- `test`: Run the tests in watch mode (Vitest).
- `coverage`: Execute a coverage test run.

The following environment variables parameterize the build:

- `VITE_AUTH_SERVER_HOST`: The location of the OAuth2 server together with the `realms/dietwise` suffix
- `VITE_API_SERVER_HOST`: The location of the API server - base URL, without the `api/vX` suffix

Example usage:

```bash
VITE_API_SERVER_HOST=https://dietwise.eu VITE_AUTH_SERVER_HOST=https://idm.dietwise.eu/realms/dietwise npm run build-all
```

### How to run the plugin in Chrome

- Go to `chrome://extensions/`
- Enable "Developer mode" using the toggle (presently at the top-right corner of the configuration screen)
- Click "Load unpacked" (from the buttons under the title "Extensions")
- Select the `dist-chrome/` folder under this project; this is created when running any of the `build-chrome*` scripts.
	- The extension should appear in the list; verify that there are no errors!
	- Keep the "Extensions" view open, you will be needing it
- Navigate to a cooking site, open a recipe page
	- Open the plugin; initially it is hidden, so click the puzzle piece icon on the top-right of your toolbar, select the "Responsible Cooking Alliance" extension (optionally pin it for your convenience) and click it to open the side panel
	- Now if you go back to the "Extensions" page, and click "Details" on the extension, there will be links labeled as "Inspect views". Click on "index.html" and you have the usual browser console, but for the opened RCA plugin sidebar! You can do the same by right-clicking on the opened extension and selecting "Inspect".
- Whenever you make a change in the application files, you have to go back and reload the extension!

### How to run the plugin in Firefox

- Register the redirect URL returned by `browser.identity.getRedirectURL()` in the OAuth2 client configuration. The Firefox manifest pins the development add-on id to `responsible-cooking-alliance@dietwise.eu` so this URL remains stable across temporary installs. Use `node -e "console.log(require('crypto').createHash('sha1').update('responsible-cooking-alliance@dietwise.eu').digest('hex'))"` to compute. See [ref in MDV](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity#getting_the_redirect_url).
- Go to `about:addons` and make sure "Extensions" is selected from the tabs on the left
- Click the "Tools for all add-ons" icon button (top-right, icon is a gear), select "Debug Add-ons"
- In the new page, click "Load Temporary Add-on..." and select the *manifest.json* file from the `dist-firefox/` folder
	- The extension is now loaded and appears in the list; it also opens automatically
	- Clicking "Inspect" opens the browser's development tools
- Navigate to a cooking site, open a recipe page, play
- Whenever you make a change in the application files, you have to go back and reload the extension!
