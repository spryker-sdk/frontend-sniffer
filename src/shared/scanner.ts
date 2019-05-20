import { async as glob } from 'fast-glob'
import { from, merge, of, Observable } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { EntryItem } from 'fast-glob/out/types/entries'

const getOptions = (options: any, cwd: string) => ({
    ...options,
    cwd
})

export function scan(dirs: string[], patterns: string[], options: any = {}): Observable<EntryItem> {
    const observables: Observable<EntryItem[]>[] = dirs
        .map((dir: string): Promise<EntryItem[]> => glob(patterns, getOptions(options, dir)))
        .map((promise: Promise<EntryItem[]>): Observable<EntryItem[]> => from(promise))

    return merge(...observables)
        .pipe(
            mergeMap((entries: EntryItem[]) => of(...entries))
        )
}
