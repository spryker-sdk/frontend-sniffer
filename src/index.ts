import { combineLatest } from 'rxjs';
import application from './global/application';
import style from './global/style';
import component from './component';
import { IApplicationFile } from './global/application/api';
import { IStyleFile } from './global/style/api';
import { IParsedComponent } from './component/api';

export interface IResults {
    applicationFiles: IApplicationFile[]
    styleFiles: IStyleFile[]
    components: IParsedComponent[]
}

export const analyze = (): Promise<IResults> => new Promise((resolve) => {
    combineLatest(
        application,
        style,
        component
    ).subscribe(([
        applicationFiles,
        styleFiles,
        components
    ]) => resolve({
        applicationFiles,
        styleFiles,
        components
    }))
})

// export const analyze = (): Promise<IResults> => new Promise((resolve) => {
//     combineLatest(
//         // application,
//         style,
//         // component
//     ).subscribe(([
//         // applicationFiles,
//         styleFiles,
//         // components
//     ]) => {
//         console.dir(styleFiles, {depth: 2});
//         return resolve()
//     })
// })
