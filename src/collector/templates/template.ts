import { basename, dirname, join } from 'path';
import { getFile, IFile } from '../file';
import { createHash } from 'crypto';
import { readdirSync } from 'fs';
import { extractCorrectTwigFileName, extractCorrectScssFileName } from '../components/component';

export interface ITemplate<W extends IFile = IFile, S extends IFile = IFile> {
    id: string
    namespace: string
    module: string
    type: string
    name: string
    files: {
        twig: W,
        sass: S
    }
}

export function getTemplate(path: string): ITemplate {
    const module = basename(join(path, '../../../..'));
    const type = basename(dirname(path)).slice(0, -1);
    const name = basename(path);
    const directoryFiles = readdirSync(path);

    return {
        id: createHash('md5').update(path).digest('hex'),
        namespace: 'SprykerShop',
        type,
        module,
        name,
        files: {
            twig: getFile(join(path, extractCorrectTwigFileName(`${name}.twig`, directoryFiles))),
            sass: getFile(join(path, extractCorrectScssFileName(`${name}.scss`, directoryFiles))),
        }
    }
}
