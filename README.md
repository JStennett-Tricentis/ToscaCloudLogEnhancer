# Tosca Cloud Log Enhancer Browser Extension

## Overview

Tosca Cloud Log Enhancer is a browser extension for Chrome and Firefox designed to improve the readability of Tosca Cloud logs by adding color-coded formatting.

## Features

- Color-coded log lines (Succeeded, Failed, Info)
- Toggle on/off functionality
- Improved log readability
- Performance optimized with debouncing
- Cross-browser support (Chrome and Firefox)

## Examples

### BEFORE

![Original logs](./src/images/originalLogs.png)

### AFTER

![Enhanced logs](./src/images/enhancedLogs.png)

## Compatibility

- Chrome Browser
- Firefox Browser
- Tosca Cloud

## Installation Instructions

### Chrome Installation (Developer Mode)

1. **Clone or Download the Project**

   ```bash
   git clone https://github.com/JStennett-Tricentis/ToscaCloudLogEnhancer.git
   ```

2. **Open Chrome Extension Management**
   - Open the Chrome Browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

    ![Developer mode toggle](./src/images/developerMode.png)

3. **Load Unpacked Extension**
   - Click "Load unpacked" (button in top left)

    ![Load unpacked button](./src/images/loadUnpacked.png)

   - Select the `/chrome` directory containing the Chrome `manifest.json`

### Firefox Installation (Developer Mode)

1. **Clone or Download the Project** (if not already done)

   ```bash
   git clone https://github.com/JStennett-Tricentis/ToscaCloudLogEnhancer.git
   ```

2. **Open Firefox Add-ons Debug Page**
   - Open Firefox Browser
   - Navigate to `about:debugging#/runtime/this-firefox`

3. **Load Temporary Add-on**
   - Click "Load Temporary Add-on"
   - Navigate to the project's `/firefox` directory
   - Select and open the `manifest.json` file directly

   > **Important**: You must select the manifest.json file itself, not the directory. Firefox requires selecting a specific file to load the extension.
   >
   > **Note**: Firefox temporary add-ons will be removed when Firefox is closed. You'll need to reload the extension each time you restart the browser.

## Development Setup

### Project Structure

```bash
ToscaCloudLogEnhancer/
│
├── chrome/                 # Chrome extension files
│   ├── manifest.json       # Chrome extension configuration (Manifest v3)
│   ├── popup.html          # Extension popup interface
│   ├── popup.js            # Popup interaction logic
│   ├── popup.css           # Popup styling
│   ├── content.js          # Log enhancement script
│   └── icons/              # Extension icons
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
├── firefox/                # Firefox extension files
│   ├── manifest.json       # Firefox extension configuration (Manifest v2)
│   ├── popup.html          # Extension popup interface
│   ├── popup.js            # Popup interaction logic
│   ├── popup.css           # Popup styling
│   ├── content.js          # Log enhancement script
│   └── icons/              # Extension icons
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
├── src/images/             # Documentation images
│   ├── developerMode.png
│   ├── enhancedLogs.png
│   ├── extensionIcon.png
│   ├── loadUnpacked.png
│   ├── originalLogs.png
│   ├── toscaLogEnhancer.png
│   ├── update.png
│
├── CLAUDE.md               # Development guidelines
└── README.md               # Project documentation
```

### Local Development

#### Chrome Development

1. Make changes to source files in the `chrome` directory
2. Reload the extension in `chrome://extensions/`:
   - Click the "Update" button on the extension card

   ![Update extension button](./src/images/update.png)

#### Firefox Development

1. Make changes to source files in the `firefox` directory
2. Reload the extension in `about:debugging#/runtime/this-firefox`:
   - Click the "Reload" button next to the extension entry

## Usage

1. Navigate to Tosca Cloud test run log results page.
    - Ex: `https://[TENANT].tricentis.com/_portal/space/[WORKSPACE]/runs/[RUN ID]/results/[TEST CASE ID]?tab=logs`

2. Click the extension icon.

    ![Extension icon](./src/images/extensionIcon.png)

3. Use the toggle switch to enable/disable log enhancement.

    ![Tosca Log Enhancer Toggle](./src/images/toscaLogEnhancer.png)

## Troubleshooting

- Check browser console for any error messages
- Verify extension is enabled in your browser's extensions page
- If the toggle doesn't work, reload the page and try again
- If the extension doesn't find logs, try refreshing the page

## Known Limitations

- Requires manual installation until store submission
- Firefox version uses temporary add-on installation (must be reinstalled after browser restart)
- Limited ability to detect DOM changes in heavily optimized applications

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
