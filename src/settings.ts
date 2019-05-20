import { existsSync } from 'fs';
import { join } from 'path';
import { yellow } from 'colors';

const SETTINGS_FILENAME = 'frontend-sniffer';

const cwd = process.cwd();
const settingFile = join(cwd, `${SETTINGS_FILENAME}.js`);
const defaultSettings = require(`../${SETTINGS_FILENAME}.default.js`);

function loadSettings(): any {
    if (!existsSync(settingFile)) {
        console.warn(yellow(`No ${SETTINGS_FILENAME}.js found in the current folder.`));
        console.warn(yellow(`Default configuration will be used.`));
        return defaultSettings;
    }

    const settings = require(settingFile);

    return {
        ...defaultSettings,
        ...settings
    }
}

export default loadSettings();
