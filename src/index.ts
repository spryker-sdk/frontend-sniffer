import runCollector from './collector';
import runSniffer from './sniffer';
import { set, get } from './environment';
import { debugEnvironment } from './log';

export const setEnvironment = set;
export const getEnvironment = get;
export const collect = async () => runCollector();
export const sniff = async () => runSniffer();

debugEnvironment();
