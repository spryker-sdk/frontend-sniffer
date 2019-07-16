import { basename, dirname, join } from 'path';
import { getFile, IFile } from '../file';
import { createHash } from 'crypto';
import { readdirSync } from 'fs';
import { extractCorrectTwigFileName } from '../components/component';
import { TLevelRestriction } from '../../environment';

export interface IView<W extends IFile = IFile> {
    id: string
    namespace: string
    module: string
    type: string
    name: string
    level: TLevelRestriction
    files: {
        twig: W
    }
}

export function getView(level: TLevelRestriction, path: string): IView {
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
        level,
        files: {
            twig: getFile(join(path, extractCorrectTwigFileName(`${name}.twig`, directoryFiles)))
        }
    }
}
