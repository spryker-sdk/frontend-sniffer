import { existsSync } from 'fs';
import { join } from 'path';
import { log, debug } from './log';
import { environment } from './environment';
import { bold } from 'colors';

export class Config<T> {
    protected config: T = null
    protected readonly target: string
    protected readonly filename: string
    protected loaded: boolean = false

    constructor(target: string, filename: string) {
        this.target = target;
        this.filename = filename;
    }

    load(): void {
        const projectPath = join(environment.projectPath, this.filename);
        const currentPath = join(process.cwd(), this.filename);
        const defaultPath = join(__dirname, '../config', this.filename);
        this.loaded = true;

        if (existsSync(projectPath)) {
            log.print(`Using project configuration for ${bold(this.target)}`);
            debug.print('Configuration path:', projectPath);
            this.config = require(projectPath) as T;
            return;
        }

        if (existsSync(currentPath)) {
            log.print(`Using custom configuration for ${bold(this.target)}`);
            debug.print('Configuration path:', currentPath);
            this.config = require(currentPath) as T;
            return;
        }

        log.print(`Using default configuration for ${bold(this.target)}`);
        debug.print('Configuration path:', defaultPath);
        this.config = require(defaultPath) as T;
        return;
    }

    get settings(): T {
        if (!this.loaded) {
            this.load();
        }

        return this.config;
    }
}
