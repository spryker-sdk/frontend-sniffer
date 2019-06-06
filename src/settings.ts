import { existsSync } from 'fs';
import { join } from 'path';
import { info } from './shared/log';

const SETTINGS_FILENAME = 'frontend-sniffer.settings';

const cwd = process.cwd();
const settingFile = join(cwd, `${SETTINGS_FILENAME}.js`);
const defaultSettings = require(`../${SETTINGS_FILENAME}.default.js`);

const settings: any = ((): any => {
    if (!existsSync(settingFile)) {
        info.print(`No ${SETTINGS_FILENAME}.js found in the current folder.\nDefault configuration will be used.`);
        return defaultSettings;
    }

    const settings = require(settingFile);

    return {
        ...defaultSettings,
        ...settings,
        cwd
    }
})()

export default settings;
