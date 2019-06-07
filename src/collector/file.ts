import { existsSync } from 'fs';
import { basename } from 'path';
import { environment } from '../environment';

export interface IFile {
    exists: boolean
    name: string
    path: string
    relativePath: string
}

export function getFile(path: string): IFile {
    if (!existsSync(path)) {
        return {
            exists: false,
            name: null,
            path: null,
            relativePath: null
        }
    }

    return {
        exists: true,
        name: basename(path),
        path,
        relativePath: path.replace(environment.projectPath, '')
    }
}
