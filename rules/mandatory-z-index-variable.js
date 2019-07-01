const { dim, bold } = require('colors');
const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'mandatory-z-index-variable';
    }

    test(data) {
        data.components.forEach(component => {
            const { sass } = component.files;
            if (sass.exists) {
                const zIndexRegularExpression = /z-index:[\sA-Za-z0-9-\+\$]+[;}]/gi;
                const zIndexRules = sass.content.match(zIndexRegularExpression);

                if (zIndexRules) {
                    zIndexRules.forEach(rule => {
                       const zIndexValue = rule.slice(rule.indexOf(':') + 1);

                       if (!isNaN(parseInt(zIndexValue))) {
                           this.outcome.addError(`Value of z-index property shouldn't be a number in ${component.type} ${bold(component.name)}:\n${dim(component.path)}`);
                       }
                    });
                }
            }
        });
    }
}
