import { IScanSettings } from '../scanner';
import { Config } from '../config';

export interface ISnifferConfig {
    scan: IScanSettings
    enable: string[]
}

export const config = new Config<ISnifferConfig>('sniffer', 'frontend-sniffer.config.js');
