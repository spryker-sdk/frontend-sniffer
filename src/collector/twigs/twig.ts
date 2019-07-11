import { createHash } from 'crypto';
import { join, basename } from 'path';
import { IFile, getFile, getType } from '../file';

export interface ITwig<W extends IFile = IFile> {
    id: string
    namespace: string
    path: string
    name: string
    module: string
    type: string
    file: {
        twig: W
    }
}

export function getTwig(path: string): ITwig {
    const name = basename(path);
    const pathToFile = join(path, `${name}.twig`);

    return {
        id: createHash('md5').update(path).digest('hex'),
        namespace: 'SprykerShop',
        path,
        name,
        module: basename(join(path, '../../../..')),
        ...getType(pathToFile),
        file: {
            twig: getFile(pathToFile),
        }
    }
}
