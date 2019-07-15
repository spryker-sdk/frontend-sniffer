import { basename, dirname, join } from 'path';
import { getFile, IFile } from '../file';
import { createHash } from 'crypto';
import { readdirSync } from 'fs';
import { extractCorrectTwigFileName } from '../components/component';

export interface ITemplate<W extends IFile = IFile> {
    id: string
    namespace: string
    module: string
    type: string
    name: string
    files: {
        twig: W
    }
}

export function getTemplate(path: string): ITemplate {
    const module = basename(join(path, '../../../..'));
    const type = basename(dirname(path)).slice(0, -1);
    const name = basename(path);
    const directoryFiles = readdirSync(path);
    const pathToFile = join(path, extractCorrectTwigFileName(`${name}.twig`, directoryFiles));

    return {
        id: createHash('md5').update(path).digest('hex'),
        namespace: 'SprykerShop',
        type,
        module,
        name,
        files: {
            twig: getFile(pathToFile)
        }
    }
}
