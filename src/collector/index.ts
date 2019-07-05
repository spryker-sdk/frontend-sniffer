import { combineLatest } from 'rxjs';
import { getObservable as getApplicationObservable } from './application';
import { getObservable as getStylesObservable } from './styles';
import { getObservable as getComponentsObservable } from './components';
import { getObservable as getViewsObservable } from './views';
import { IApplicationFile } from './application/parser';
import { IStyleFile } from './styles/parser';
import { IParsedComponent } from './components/parser';
import { IParsedView } from './views/parser';
import { info } from '../logger';
import { config } from './config';

export type TCollectorObservableOutput = [IApplicationFile[], IStyleFile[], IParsedComponent[], IParsedView[]];

export interface ICollectorOutput {
    applicationFiles: IApplicationFile[]
    styleFiles: IStyleFile[]
    components: IParsedComponent[]
    views: IParsedView[]
}

export const collect = (): Promise<ICollectorOutput> => new Promise<ICollectorOutput>((resolve, reject) => {
    info.print('\nRunning collector...');

    return combineLatest(
        getApplicationObservable(),
        getStylesObservable(),
        getComponentsObservable(),
        getViewsObservable()
    ).subscribe((observableOutput: TCollectorObservableOutput) => resolve({
        applicationFiles: observableOutput[0],
        styleFiles: observableOutput[1],
        components: observableOutput[2],
        views: observableOutput[3],
    }))
})
