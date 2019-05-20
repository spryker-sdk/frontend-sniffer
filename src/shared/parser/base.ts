import { IFile } from '../file';

export interface IParserLog {
    infos?: string[]
    warnings?: string[]
    errors?: string[]
}

export interface IParserOutput<T = any> {
    content: string,
    api: T,
    log?: IParserLog
}

export type TParser<T> = (file: string) => Promise<IParserOutput<T>>

export interface IParsedFile<T = any> extends IFile, IParserOutput<T> { }
