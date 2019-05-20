import { existsSync } from 'fs';
import { basename } from 'path';

export interface IFile {
    exists: boolean
    name: string
    path: string
}

export function getFile(path: string): IFile {
    if (!existsSync(path)) {
        return {
            exists: false,
            name: null,
            path: null
        }
    }

    return {
        exists: true,
        name: basename(path),
        path
    }
}
