import { IScanSettings } from '../scanner';
import { Config } from '../config';

export interface ICollectorConfig {
    core: {
        scan: {
            application: IScanSettings
            styles: IScanSettings
            components: IScanSettings
            views: IScanSettings
        }
    }

    project: {
        scan: {
            application: IScanSettings
            styles: IScanSettings
            components: IScanSettings
            views: IScanSettings
        }
    }
}

export const config = new Config<ICollectorConfig>('collector', 'frontend-sniffer.collector.config.js');
