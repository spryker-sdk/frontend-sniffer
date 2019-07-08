import { forkJoin } from 'rxjs';
import { getObservable as getApplicationObservable } from './application';
import { getObservable as getStylesObservable, IStyleFilesResult } from './styles';
import { getObservable as getComponentsObservable, IParsedComponentResult } from './components';
import { getObservable as getViewsObservable, IParsedViewResult } from './views';
import { IApplicationFile } from './application/parser';
import { IStyleFile } from './styles/parser';
import { IParsedComponent } from './components/parser';
import { IParsedView } from './views/parser';
import { info } from '../logger';

export type TCollectorObjectFields = IStyleFilesResult | IParsedComponentResult;

export type TCollectorObservableOutput = {
    applicationFiles: IApplicationFile[]
    styleFiles: IStyleFilesResult
    components: IParsedComponentResult
    views: IParsedViewResult;
};

export interface ICollectorOutput {
    applicationFiles: IApplicationFile[]
    styleFiles: {
        project?: IStyleFile[]
        core?: IStyleFile[]
    }
    components: {
        project?: IParsedComponent[]
        core?: IParsedComponent[]
    }
    views: {
        project?: IParsedView[]
        core?: IParsedView[]
    }
}

export const collect = (): Promise<ICollectorOutput> => new Promise<any>((resolve, reject) => {
    info.print('\nRunning collector...');

    return forkJoin({
        applicationFiles: getApplicationObservable(),
        styleFiles: getStylesObservable(),
        components: getComponentsObservable(),
        views: getViewsObservable(),
    }).subscribe((observableOutput: TCollectorObservableOutput) => resolve({
        applicationFiles: observableOutput.applicationFiles,
        styleFiles: observableOutput.styleFiles,
        components: observableOutput.components,
        views: observableOutput.views,
    }));
});
