import { combineLatest, Observable } from 'rxjs';
import applicationCollectorObservable from './application';
import stylesCollectorObservable from './styles';
import componentsCollectorObservable from './components';
import { IApplicationFile } from './application/parser';
import { IStyleFile } from './styles/parser';
import { IParsedComponent } from './components/parser';
import { printHeading } from './log';

export type TCollectorObservableOutput = [IApplicationFile[], IStyleFile[], IParsedComponent[]];

export interface ICollectorOutput {
    applicationFiles: IApplicationFile[]
    styleFiles: IStyleFile[]
    components: IParsedComponent[]
}

export function getObservable(): Observable<TCollectorObservableOutput> {
    printHeading();

    return combineLatest(
        applicationCollectorObservable,
        stylesCollectorObservable,
        componentsCollectorObservable
    )
}

export const parseCollectorObservableOutput = (observableOutput: TCollectorObservableOutput): ICollectorOutput => ({
    applicationFiles: observableOutput[0],
    styleFiles: observableOutput[1],
    components: observableOutput[2]
})

export default (): Promise<ICollectorOutput> => new Promise<ICollectorOutput>((resolve) => getObservable()
    .subscribe((observableOutput: TCollectorObservableOutput) => resolve(parseCollectorObservableOutput(observableOutput)))
)
