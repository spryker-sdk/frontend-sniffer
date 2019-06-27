import { forkJoin } from 'rxjs';
import { getObservable as getApplicationObservable } from './application';
import { getObservable as getStylesObservable, IStyleFilesResult } from './styles';
import { getObservable as getComponentsObservable, IParsedComponentResult } from './components';
import { IApplicationFile } from './application/parser';
import { IStyleFile } from './styles/parser';
import { IParsedComponent } from './components/parser';
import { info } from '../logger';

export type TCollectorObjectFields = IStyleFilesResult | IParsedComponentResult;

export type TCollectorObservableOutput = {
    applicationFiles: IApplicationFile[]
    styleFiles: IStyleFilesResult
    components: IParsedComponentResult
};

export interface ICollectorOutput {
    applicationFiles: IApplicationFile[]
    styleFiles: {
        project?: IStyleFile[]
        vendor?: IStyleFile[]
    }
    components: {
        project?: IParsedComponent[]
        vendor?: IParsedComponent[]
    }
}

export const collect = (): Promise<ICollectorOutput> => new Promise<any>((resolve, reject) => {
    info.print('\nRunning collector...');

    return forkJoin({
        applicationFiles: getApplicationObservable(),
        styleFiles: getStylesObservable(),
        components: getComponentsObservable()
    }).subscribe((observableOutput: TCollectorObservableOutput) => resolve({
        applicationFiles: observableOutput.applicationFiles,
        styleFiles: observableOutput.styleFiles,
        components: observableOutput.components
    }));
});
