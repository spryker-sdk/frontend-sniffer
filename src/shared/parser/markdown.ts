import { promisify } from 'util';
import { readFile } from 'fs';
import { IParserOutput, TParser } from './base';
import * as showdown from 'showdown';

const read = promisify(readFile);
const markdownConverter = new showdown.Converter();

export const parse: TParser<void> = async (file: string): Promise<IParserOutput<void>> => {
    if (!file) {
        return null;
    }

    try {
        const content = await read(file, { encoding: 'utf8' });

        return {
            content: markdownConverter.makeHtml(content),
            api: null
        }
    } catch (error) {
        return {
            content: null,
            api: null,
            log: {
                errors: [error.stack]
            }
        }
    }
}
