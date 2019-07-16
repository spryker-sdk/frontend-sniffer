const { Rule, parseOutputFieldHelper } = require('../api');
const { htmlTags } = require('../config/html-tags');

module.exports = class extends Rule {
    getName() {
        return 'correct-tag-name';
    }

    test(data) {
        const { defaultErrorMessage, addError } = this.outcome;

        parseOutputFieldHelper(data.modules).forEach(component => {
            const { twig } = component.files;

            if (!twig.exists) {
                return;
            }

            const { definitions } = twig.api.external;

            definitions.forEach(definition => {
                if (definition.name !== 'config') {
                    return;
                }

                const { contract } = definition;
                const tagWordIndex = contract.indexOf('tag:');

                if (tagWordIndex < 0) {
                    return;
                }

                const { type, name, path } = component;
                const croppedStringFromTagWord = contract.slice(tagWordIndex);
                const tagPropertyString = croppedStringFromTagWord.slice(0, croppedStringFromTagWord.indexOf('\n'));
                const startPositionTagNameInString = tagPropertyString.indexOf('\'') + 1;
                const endPositionTagNameInString = tagPropertyString.lastIndexOf('\'');
                const tagName = tagPropertyString.slice(startPositionTagNameInString, endPositionTagNameInString);
                const mandatorySymbolsRegularExpression = /^[a-z0-9\-]+$/;
                const filteredHtmlTagArray = htmlTags.filter(tagData => (tagData.tagName === tagName && !tagData.single));

                if (tagName === 'div') {
                    addError(defaultErrorMessage('It shouldn\'t be tag property with div value in config of', type, name, path));

                    return;
                }

                if (!mandatorySymbolsRegularExpression.test(tagName)) {
                    addError(defaultErrorMessage('The tag name must include only latin lowercase letters, arabic numerals and hyphens in', type, name, path));

                    return;
                }

                if (tagName.includes('-')) {
                    return;
                }

                if (!filteredHtmlTagArray.length || filteredHtmlTagArray[0].single) {
                    addError(defaultErrorMessage('The tag name property should be valid pair html tag in', type, name, path));
                }
            })
        });
    }
};
