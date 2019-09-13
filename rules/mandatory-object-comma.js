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
            const {content, path} = twig;
            const betweenBlocksReg = /^\}[\s]{0,}\{$/i;
            const twigVariableReg = /\{\{[a-zA-Z0-9 _\=\.\"\%\':\/\_\-\~\,\(\)\?\|\[\]\n\r]{1,}\}\}/gi;
            const twigVariables = content.match(twigVariableReg);
            const clearArrayFromBlocksData = stringsArray => stringsArray.filter(
                string => !string.includes('{%') && !string.includes('%}') && !betweenBlocksReg.test(string));

            const createStringsBetweenBracketsArray = string => {
                const stringsBetweenBrackets = [];
                const findStringBetweenBrackets = (string, stringsBetweenBrackets) => {
                    const reg = /(\[|\]|\{|\})[a-zA-Z0-9 _\=\.\"\%\':\|\-\~\,\(\)\?\n\r]{1,}(\[|\]|\{|\})/i;
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

                findStringBetweenBrackets(string, stringsBetweenBrackets);

                return stringsBetweenBrackets;
            }

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

                    const openingCurlyBrackets = partOfStringObject.match(/\{/g);
                    const openingSquareBrackets = partOfStringObject.match(/\[/g);
                    const closingCurlyBrackets = partOfStringObject.match(/\}/g);
                    const closingSquareBrackets = partOfStringObject.match(/\]/g);
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

            const checkCommaAfterLastObjectsParameter = objectStrings => {
                const commaAfterLastParameterReg = /[a-zA-Z0-9\]\}]{1}[' ']{0,}[\r]{0,1}[' ']{0,}[\n]{1,}[' ']{0,}[\]|\}]{1,}/g;

                objectStrings.forEach(objectString => {
                    if (!commaAfterLastParameterReg.test(objectString)) {
                        return;
                    }

                    objectString = objectString.replace(/&#123;/g, '{');
                    objectString = objectString.replace(/&#125;/g, '}');

                    addError(formatMessage(`Please add comma after each last object value or method in ${objectString}`, type, name, path));
                })
            };

            const modifiedContent = changeTwigVariablesToUnicode(content, twigVariables);
            const stringsBetweenBrackets = createStringsBetweenBracketsArray(modifiedContent);
            const dataArray = clearArrayFromBlocksData(stringsBetweenBrackets);
            const firstLevelObjects = createFirstLevelObjectData(dataArray);

            checkCommaAfterLastObjectsParameter(firstLevelObjects);
        })
    }
};
