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
            const {path, api} = twig;
            const stringsBetweenBrackets = [];
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

            findStringBetweenBrackets(twig.content, stringsBetweenBrackets);
            console.log(path);
            console.log(stringsBetweenBrackets);
        })
    }
};
