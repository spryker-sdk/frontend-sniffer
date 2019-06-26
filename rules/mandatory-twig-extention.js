const { dim, bold } = require('colors');
const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'mandatory-twig-extention';
    }

    test(data) {
        data.components.forEach(component => {
            const { twig } = component.files;

            if (twig.exists && twig.content.indexOf('{% extends')) {
                this.outcome.addError(`twig file should begin with extend in ${component.type} ${bold(component.name)}:\n${dim(component.path)}`);
            }
        });
    }
}
