import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { merge } from 'lodash';
import { log, debug } from './logger';
import { environment } from './environment';
import { bold } from 'colors';

export class Config<T> {
    protected config: T = null
    protected readonly targetName: string
    protected readonly filename: string
    protected readonly defaultConfigPath: string
    protected readonly defaultConfig: T
    protected loaded: boolean = false

    constructor(targetName: string, filename: string) {
        this.targetName = targetName;
        this.filename = filename;
        this.defaultConfigPath = join(__dirname, '../config', this.targetName);
        this.defaultConfig = require(this.defaultConfigPath);
    }

    protected load(): void {
        const paths = [
            environment.configPath && environment.configPath,
            environment.configPath && join(environment.configPath, this.filename),
            join(environment.path, this.filename),
            join(process.cwd(), this.filename)
        ]

        paths.map((path: string) => this.loadConfigFromPath(path));
        this.loadDefaultConfig();
    }

    protected loadDefaultConfig(): void {
        if (this.loaded) {
            return;
        }

        this.config = this.defaultConfig;
        this.loaded = true;
        log.print(`Configuration for ${this.targetName}:`, bold('default'));
    }

    protected loadConfigFromPath(path: string): void {
        if (this.loaded) {
            return;
        }

        debug.print('Trying to load configuration from', path);

        if (this.isDefaultConfigPath(path) || !this.exists(path)) {
            return;
        }

        const config = require(path) as T;
        this.config = merge(this.defaultConfig, config);
        this.loaded = true;
        log.print(`Configuration for ${this.targetName}:`, bold(path));
    }

    protected isDefaultConfigPath(path: string): boolean {
        return path === this.defaultConfigPath;
    }

    protected exists(path: string): boolean {
        if (!existsSync(path)) {
            return false;
        }

        const stats = statSync(path);
        return stats.isFile();
    }

    get settings(): T {
        if (!this.loaded) {
            this.load();
        }

        return this.config;
    }
}
