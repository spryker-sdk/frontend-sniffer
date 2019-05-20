import { combineLatest } from 'rxjs';
import application from './global/application';
import style from './global/style';
import component from './component';
import { IApplicationFile } from './global/application/api';
import { IStyleSection } from './global/style/section';
import { IParsedComponent } from './component/api';

export interface IResults {
    applicationFiles: IApplicationFile[]
    styleSections: IStyleSection[]
    components: IParsedComponent[]
}

export const run = (): Promise<IResults> => new Promise((resolve) => {
    combineLatest(
        application,
        style,
        component
    ).subscribe(([
        applicationFiles,
        styleSections,
        components
    ]) => resolve({
        applicationFiles,
        styleSections,
        components
    }))
})


export const run2 = (): Promise<any> => new Promise((resolve) => {
    combineLatest(
        // application,
        style,
        component
    ).subscribe(o => console.dir(o, {depth: null}))
})
