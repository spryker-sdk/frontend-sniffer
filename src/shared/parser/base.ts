import { IFile } from '../file';

export interface IParserLog {
    infos?: string[]
    warnings?: string[]
    errors?: string[]
}

export interface IParserOutput<E = any, I = any> {
    content: string
    api: {
        external: E
        internal: I
    }
    log?: IParserLog
}

export type TParser<T> = (file: string) => Promise<IParserOutput<T>>

export interface IParsedFile<T = any> extends IFile, IParserOutput<T> { }
