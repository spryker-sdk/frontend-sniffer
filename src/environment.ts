import { existsSync } from 'fs';
import { isAbsolute, resolve } from 'path';
import { log, error, debug } from './log';
import { bold } from 'colors';

interface IEnvironment {
    projectPath: string
    excludeSniffer: boolean
    collectOnly: number
    debugMode: boolean
}

export class Environment {
    protected variables: IEnvironment = {
        projectPath: process.cwd(),
        excludeSniffer: false,
        collectOnly: null,
        debugMode: false
    }

    protected check(): boolean {
        if (!this.variables.projectPath) {
            error.print('Enviroment variable "projectPath" is not set');
            return false;
        }

        if (!existsSync(this.variables.projectPath)) {
            error.print(`Enviroment variable "projectPath" is set but its value does not exist in the filesystem:\n${this.variables.projectPath}`);
            return false;
        }

        log.print(`Project path:\n${bold(this.variables.projectPath)}`);
        return true;
    }

    protected convertToFullProjectPath(): void {
        if (isAbsolute(this.variables.projectPath)) {
            return;
        }

        this.variables.projectPath = resolve(this.variables.projectPath);
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

    get projectPath(): string {
        return this.variables.projectPath;
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
