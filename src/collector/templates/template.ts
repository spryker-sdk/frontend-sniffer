import { basename, dirname, join } from 'path';
import { getFile, IFile } from '../file';
import { createHash } from 'crypto';

export interface ITemplate extends IFile {
    id: string
    namespace: string
    module: string
    type: string
}

export function getTemplate(path: string): ITemplate {
    const module = basename(join(path, '../../../..'));
    const type = basename(dirname(path)).slice(0, -1);

    return {
        ...getFile(path),
        id: createHash('md5').update(path).digest('hex'),
        namespace: 'SprykerShop',
        type,
        module
    }
}
