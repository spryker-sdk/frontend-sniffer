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

export type TParser<T, I = any> = (file: string) => Promise<IParserOutput<T, I>>

export interface IParsedFile<T = any, I = any> extends IFile, IParserOutput<T, I> { }
