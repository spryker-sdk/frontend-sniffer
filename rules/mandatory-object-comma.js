const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'mandatory-object-comma';
    }

    test(data) {
        const { formatMessage, addError } = this.outcome;

        this.filterModulesData(data, 'twig').forEach(twigFileData => {
            const { files, type, name } = twigFileData;
            const { twig } = files;
            const { content, path } = twig;
            const emptySpaceBetweenBlocksRegExp = /^\}[\s]{0,}\{$/i;
            const twigVariableRegExp = /\{\{[a-zA-Z0-9 _\=\.\"\%\':\/\_\-\~\,\(\)\?\|\[\]\n\r]{1,}\}\}/gi;
            const twigVariables = content.match(twigVariableRegExp);
            const clearArrayFromBlocksData = stringsArray => stringsArray.filter(
                string => !string.includes('{%') && !string.includes('%}') && !emptySpaceBetweenBlocksRegExp.test(string));

            const createStringsBetweenBracketsListArray = string => {
                const stringsBetweenBracketsList = [];
                const findStringBetweenBrackets = (string, stringsBetweenBracketsList) => {
                    const regExp = /(\[|\]|\{|\})[a-zA-Z0-9 _\=\.\"\%\':\|\-\~\,\(\)\?\n\r]{1,}(\[|\]|\{|\})/i;
                    const result = string.match(regExp);

                    if (!Array.isArray(result)) {
                        return;
                    }

                    const stringBetweenBrackets = result[0];
                    const symbolsCount = stringBetweenBrackets.length;
                    const index = string.indexOf(stringBetweenBrackets);
                    const stringAfterBracketsPair = string.slice(index + symbolsCount - 1);

                    stringsBetweenBracketsList.push(stringBetweenBrackets);

                    if (!stringAfterBracketsPair) {
                        return;
                    };

                    findStringBetweenBrackets(stringAfterBracketsPair, stringsBetweenBracketsList);
                };

                findStringBetweenBrackets(string, stringsBetweenBracketsList);

                return stringsBetweenBracketsList;
            }

            const changeTwigVariablesToUnicode = (content, variables) => {
                if (!Array.isArray(variables)) {
                    return content;
                }

                return variables.reduce((accumulator, currentValue) => {
                    const changedStringSymbolLength = 2;
                    const modifiedVariablesContent = `&#123;&#123;${currentValue.slice(
                        changedStringSymbolLength,(-1)*changedStringSymbolLength)}&#125;&#125;`;

                    return content.replace(currentValue, modifiedVariablesContent);
                }, content);
            };

            const createFirstLevelObjectData = data => {
                const firstLevelObjects = [];
                const getLength = substrings => substrings ? substrings.length : 0;
                let partOfStringObject = '';

                data.forEach( str => {
                    partOfStringObject = partOfStringObject ? partOfStringObject + str.slice(1) : str;

                    const openingCurlyBrackets = partOfStringObject.match(/\{/g);
                    const openingSquareBrackets = partOfStringObject.match(/\[/g);
                    const closingCurlyBrackets = partOfStringObject.match(/\}/g);
                    const closingSquareBrackets = partOfStringObject.match(/\]/g);
                    const openingCurlyBracketLength = getLength(openingCurlyBrackets);
                    const openingSquareBracketLength = getLength(openingSquareBrackets);
                    const closingCurlyBracketLength = getLength(closingCurlyBrackets);
                    const closingSquareBracketLength = getLength(closingSquareBrackets);

                    if (openingCurlyBracketLength !== closingCurlyBracketLength ||
                        openingSquareBracketLength !== closingSquareBracketLength) {
                        return;
                    }

                    firstLevelObjects.push(partOfStringObject);
                    partOfStringObject = '';
                });

                return firstLevelObjects;
            };

            const checkCommaAfterLastObjectsParameter = objectStrings => {
                const commaAfterLastParameterRegExp = /[a-zA-Z0-9\]\}]{1}[' ']{0,}[\r]{0,1}[' ']{0,}[\n]{1,}[' ']{0,}[\]|\}]{1,}/g;

                objectStrings.forEach(objectString => {
                    if (!commaAfterLastParameterRegExp.test(objectString)) {
                        return;
                    }

                    objectString = objectString.replace(/&#123;/g, '{').replace(/&#125;/g, '}');

                    addError(formatMessage(`Please add comma after each last object value or method in ${objectString}`, type, name, path));
                })
            };

            const modifiedContent = changeTwigVariablesToUnicode(content, twigVariables);
            const stringsBetweenBracketsList = createStringsBetweenBracketsListArray(modifiedContent);
            const dataArray = clearArrayFromBlocksData(stringsBetweenBracketsList);
            const firstLevelObjects = createFirstLevelObjectData(dataArray);

            checkCommaAfterLastObjectsParameter(firstLevelObjects);
        })
    }
};
