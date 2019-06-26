const { dim, bold } = require('colors');
const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-tag-name';
    }

    test(data) {
        data.components.forEach(component => {
            const { twig } = component.files;

            if (twig.exists) {
                const { definitions } = twig.api.external;

                definitions.forEach(definition => {
                    if (definition.name !== 'config') {
                        return
                    }

                    const { contract } = definition;
                    const tagWordIndex = contract.indexOf('tag:');
                    const croppedStringFromTagWord = contract.slice(tagWordIndex);
                    const tagPropertyString = croppedStringFromTagWord.slice(0, croppedStringFromTagWord.indexOf('\n'));
                    const tagName = tagPropertyString.slice(tagPropertyString.indexOf('\'') + 1, tagPropertyString.lastIndexOf('\''));

                    if (tagName === 'div') {
                        this.outcome.addError(`it shouldn't be tag property with div value in config of ${component.type} ${bold(component.name)}:\n${dim(component.path)}`);
                    }
                })
            }
        });
    }
};
