const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'mandatory-object-comma';
    }

    test(data) {
        const { formatMessage, addError } = this.outcome;

        this.filterModulesData(data, 'twig').forEach(twigFileData => {
            const {files, type, name} = twigFileData;
            const {twig} = files;
            const {content} = twig;
            const {path, api} = twig;
            const stringsBetweenBrackets = [];
            const betweenBlocksReg = /^\}[\s]{0,}\{$/i;
            const twigVariableReg = /\{\{[a-zA-Z0-9 _\=\.\"\%\':\/\_\-\~\,\(\)\?\|\[\]\n\r]{1,}\}\}/gi;
            const twigVariables = content.match(twigVariableReg);
            const clearArrayFromBlocksData = stringsArray => stringsArray.filter(
                string => !string.includes('{%') && !string.includes('%}') && !betweenBlocksReg.test(string));

            const findStringBetweenBrackets = (string, stringsBetweenBrackets) => {
                const reg = /(\[|\]|\{|\})[a-zA-Z0-9 _\=\.\"\%\':\-\~\,\(\)\?\n\r]{1,}(\[|\]|\{|\})/i;
                const result = string.match(reg);

                if (!Array.isArray(result)) {
                    return;
                }

                const stringBetweenBrackets = result[0];
                const symbolsCount = stringBetweenBrackets.length;
                const index = string.indexOf(stringBetweenBrackets);
                const stringAfterBracketsPair = string.slice(index + symbolsCount - 1);

                stringsBetweenBrackets.push(stringBetweenBrackets);

                if (!stringAfterBracketsPair) {
                    return;
                };

                findStringBetweenBrackets(stringAfterBracketsPair, stringsBetweenBrackets);
            };

            const changeTwigVariablesToUnicode = (content, variables) => {
                let modifiedContent = content;

                if (Array.isArray(variables)) {
                    variables.forEach(variable => {
                        const changedStringSymbolLength = 2;

                        modifiedContent = modifiedContent.replace(
                            variable, `&#123;&#123;${variable.slice(
                                changedStringSymbolLength,(-1)*changedStringSymbolLength)}&#125;&#125;`);
                    })
                }

                return modifiedContent;
            };

            const createFirstLevelObjectData = data => {
                const firstLevelObjects = [];
                let partOfStringObject = '';

                data.forEach( str => {
                    partOfStringObject = partOfStringObject ? partOfStringObject + str.slice(1) : str;

                    const openingCurlyBrackets = str.match(/\{/g);
                    const openingSquareBrackets = str.match(/\[/g);
                    const closingCurlyBrackets = str.match(/\}/g);
                    const closingSquareBrackets = str.match(/\]/g);
                    const countOfOpeningCurlyBracket = openingCurlyBrackets ? openingCurlyBrackets.length : 0;
                    const countOfOpeningSquareBracket = openingSquareBrackets ? openingSquareBrackets.length : 0;
                    const countOfClosingCurlyBracket = closingCurlyBrackets ? closingCurlyBrackets.length : 0;
                    const countOfClosingSquareBracket = closingSquareBrackets ? closingSquareBrackets.length : 0;

                    if (countOfOpeningCurlyBracket !== countOfClosingCurlyBracket ||
                        countOfOpeningSquareBracket !==  countOfClosingSquareBracket) {
                        return;
                    }

                    firstLevelObjects.push(partOfStringObject);
                    partOfStringObject = '';
                });

                return firstLevelObjects;
            };

            const modifiedContent = changeTwigVariablesToUnicode(content, twigVariables);

            findStringBetweenBrackets(modifiedContent, stringsBetweenBrackets);

            const dataArray = clearArrayFromBlocksData(stringsBetweenBrackets);
            const firstLevelObjects = createFirstLevelObjectData(dataArray);

            console.log(path);
            console.log(firstLevelObjects);

        })
    }
};
