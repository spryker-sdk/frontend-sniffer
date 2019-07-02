import { existsSync } from 'fs';
import { isAbsolute, resolve } from 'path';
import { log, error, debug } from './logger';
import { bold } from 'colors';

type TCoreLevel = 'core';
type TProjectLevel = 'project';
export const coreLevel: string = 'core';
export const projectLevel: string = 'project';

interface IEnvironment {
    path: string
    configPath: string
    excludeSniffer: boolean
    only: number
    debugMode: boolean
    levelRestriction: TProjectLevel | TCoreLevel
}

export class Environment {
    protected variables: IEnvironment = {
        path: process.cwd(),
        configPath: process.cwd(),
        excludeSniffer: false,
        only: null,
        debugMode: false,
        levelRestriction: null
    }

    protected check(): boolean {
        if (!this.variables.path) {
            error.print('Variable "path" is not set');
            return false;
        }

        if (!existsSync(this.variables.path)) {
            error.print(`Variable "path" is set but its value does not exist in the filesystem:\n${this.variables.path}`);
            return false;
        }

        log.print(`Running on ${bold(this.variables.path)}`);
        return true;
    }

    protected convertPathsToFullPaths(): void {
        if (!isAbsolute(this.variables.path)) {
            this.variables.path = resolve(this.variables.path);
        }

        if (!!this.variables.configPath && !isAbsolute(this.variables.configPath)) {
            this.variables.configPath = resolve(this.variables.configPath);
        }
    }

    update(variables: Partial<IEnvironment>): boolean {
        this.variables = {
            ...this.variables,
            ...variables
        }

        this.convertPathsToFullPaths();
        debug.print(this.variables);

        return this.check();
    }

    get path(): string {
        return this.variables.path;
    }

    get configPath(): string {
        return this.variables.configPath;
    }

    get excludeSniffer(): boolean {
        return this.variables.excludeSniffer;
    }

    get isOnly(): boolean {
        return !!this.only;
    }

    get only(): number {
        return this.variables.only;
    }

    get debugMode(): boolean {
        return this.variables.debugMode;
    }

    get isAllowedLevel(): boolean {
        const allowedLevelsPaths = [projectLevel, coreLevel];
        const requestedLevel = this.variables.levelRestriction;

        return allowedLevelsPaths.some(level => requestedLevel === level);
    }

    get levelRestriction(): TProjectLevel | TCoreLevel {
        return this.variables.levelRestriction;
    }
}

export const environment = new Environment();
