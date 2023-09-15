import { isAbsolute, join } from 'path';
import { async as fastGlob, Options } from 'fast-glob'
import { EntryItem } from 'fast-glob/out/types'
import { from, merge, of, Observable } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { environment } from './environment';

export interface IScanSettings {
    dirs: string[]
    patterns: string[]
    options: Options
}

const getFullPath = (dir: string): string => isAbsolute(dir) ? dir : join(environment.path, dir)
const createOptionsFor = (dir: string, options: Options): Options => ({ ...options, cwd: dir })

export function scan(settings: IScanSettings): Observable<string> {
    const observables: Observable<EntryItem[]>[] = settings.dirs
        .map(getFullPath)
        .map((dir: string): Promise<EntryItem[]> => fastGlob(settings.patterns, createOptionsFor(dir, settings.options)))
        .map((promise: Promise<EntryItem[]>): Observable<EntryItem[]> => from(promise))

    return merge(...observables)
        .pipe(
            mergeMap((entries: EntryItem[]) => of(...entries as string[]))
        )
}
