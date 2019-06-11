import { existsSync } from 'fs';
import { isAbsolute, resolve } from 'path';
import { log, error, debug } from './log';
import { bold } from 'colors';

interface IEnvironment {
    path: string
    excludeSniffer: boolean
    collectOnly: number
    debugMode: boolean
}

export class Environment {
    protected variables: IEnvironment = {
        path: process.cwd(),
        excludeSniffer: false,
        collectOnly: null,
        debugMode: false
    }

    protected check(): boolean {
        if (!this.variables.path) {
            error.print('Enviroment variable "path" is not set');
            return false;
        }

        if (!existsSync(this.variables.path)) {
            error.print(`Enviroment variable "path" is set but its value does not exist in the filesystem:\n${this.variables.path}`);
            return false;
        }

        log.print(`Target path: ${bold(this.variables.path)}`);
        return true;
    }

    protected convertToFullProjectPath(): void {
        if (isAbsolute(this.variables.path)) {
            return;
        }

        this.variables.path = resolve(this.variables.path);
    }

    update(variables: Partial<IEnvironment>): boolean {
        this.variables = {
            ...this.variables,
            ...variables
        }

        this.convertToFullProjectPath();
        debug.print(this.variables);

        return this.check();
    }

    get path(): string {
        return this.variables.path;
    }

    get excludeSniffer(): boolean {
        return this.variables.excludeSniffer;
    }

    get isCollectOnly(): boolean {
        return !!this.collectOnly;
    }

    get collectOnly(): number {
        return this.variables.collectOnly;
    }

    get debugMode(): boolean {
        return this.variables.debugMode;
    }
}

export const environment = new Environment();
