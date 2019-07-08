import { createHash } from 'crypto';
import { join, basename } from 'path';
import { IFile, IType, getFile, getType } from '../file';

export interface IView<W extends IFile = IFile> {
    id: string
    namespace: string
    path: string
    name: string
    module: string
    file: {
        twig: W
        type: string
    }
}

export function getView(path: string): IView {
    const name = basename(path);
    const pathToFile = join(path, `${name}.twig`);

    return {
        id: createHash('md5').update(path).digest('hex'),
        namespace: 'SprykerShop',
        path,
        name,
        module: basename(join(path, '../../../..')),
        file: {
            twig: getFile(pathToFile),
            ...getType(pathToFile),
        }
    }
}
