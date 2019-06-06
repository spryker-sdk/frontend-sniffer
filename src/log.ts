import { bold } from 'colors';
import { get } from './environment';
import { debug } from './shared/log';

export function debugEnvironment() {
    const environment = get();

    if (!environment.debug) {
        return;
    }

    const environmentDebugMessage = 'Environment:' + Object
        .keys(environment)
        .map((key: string) => `\n- ${key}: ${bold(`${environment[key]}`)}`)
        .join('');

    debug.print(environmentDebugMessage);
}
