const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'mandatory-z-index-variable';
    }

    test(data) {
        const { formatMessage, addError } = this.outcome;

        this.filterModulesData(data, 'sass').forEach(component => {
            const { files, type, name, path } = component;
            const { content } = files.sass;

            const zIndexRegularExpression = /z-index:[\sA-Za-z0-9-\+\$]+[;}]/gi;
            const zIndexRules = content.match(zIndexRegularExpression);

            if (!zIndexRules) {
                return;
            }

            zIndexRules.forEach(rule => {
                const zIndexValue = rule.slice(rule.indexOf(':') + 1);

                if (!isNaN(parseInt(zIndexValue))) {
                    addError(formatMessage('Value of z-index property shouldn\'t be a number in', type, name, path));
                }
            });
        });
    }
}
