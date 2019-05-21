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

export const analyze = (): Promise<IResults> => new Promise((resolve) => {
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
