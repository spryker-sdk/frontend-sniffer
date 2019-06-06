import { result } from 'lodash'
import { yellow, dim, red, green, bold, cyan } from 'colors';
import { get as environment } from '../environment';

export interface ILogger {
    print: (...args: any[]) => void
}

export const debug: ILogger = {
    print: (...args: any[]) => {
        if (environment().debug) {
            console.debug(dim('[DEBUG]'), ...args.map((arg: any) => dim(arg)))
        }
    }
}

export const log: ILogger = {
    print: (...args: any[]) => console.log(...args)
}

export const info: ILogger = {
    print: (...args: any[]) => console.info(...args.map((arg: any) => cyan(arg)))
}

export const warn: ILogger = {
    print: (...args: any[]) => console.warn(...args.map((arg: any) => yellow(arg)))
}

export const error: ILogger = {
    print: (...args: any[]) => console.error(...args.map((arg: any) => red(arg)))
}

export const success: ILogger = {
    print: (...args: any[]) => console.info(...args.map((arg: any) => green(arg)))
}

export const createDebugger = <T>(message: string, ...paths: string[]) => (input: T): T => {
    if (!environment().debug) {
        return input;
    }

    if (!paths || paths.length === 0) {
        debug.print(bold(message), input);
        return input;
    }

    debug.print(message, ...paths.map((path: string) => bold(result(input, path, 'N/A'))));
    return input;
}

export const createLogger = <T>(message: string, ...paths: string[]) => (input: T): T => {
    if (!paths || paths.length === 0) {
        log.print(bold(message), input);
        return input;
    }

    log.print(message, ...paths.map((path: string) => bold(result(input, path, 'N/A'))));
    return input;
}
