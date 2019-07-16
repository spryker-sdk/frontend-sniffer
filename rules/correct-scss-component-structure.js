const { Rule, parseOutputFieldHelper } = require('../api');
const { stringify } = require('sast');

module.exports = class extends Rule {
    getName() {
        return 'correct-scss-component-structure';
    }

    test(data) {
        const { defaultErrorMessage, addError } = this.outcome;

        parseOutputFieldHelper(data.modules).forEach(component => {
            const { module, files, type, name, path } = component;

            if (!files.sass || !files.sass.exists) {
                return;
            }

            const { sass } = component.files;
            const { mixins } = sass.api.external;
            const { name: scssFileName } = sass;

            if (name !== scssFileName.slice(0, scssFileName.lastIndexOf('.scss'))) {
                addError(defaultErrorMessage('There is wrong name of scss file in', type, name, path));
            }

            mixins.forEach((mixin, index) => {
                const contentRule = '@content';
                const camelCaseToDash = string => string.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
                const { name: mixinName, hasContent, tree } = mixin;
                const convertedMixinText = stringify(tree);
                const contentRuleIndex = convertedMixinText.indexOf(contentRule);
                const convertedModuleName = camelCaseToDash(module);

                if (!index && mixinName !== `${convertedModuleName}-${name}`) {
                    addError(defaultErrorMessage('Name of the first mixin in file should consist of module name and component name in', type, name, path));
                }

                if (!mixinName.includes(name)) {
                    addError(defaultErrorMessage('There is wrong name of mixin in scss file of', type, name, path));
                }

                if (!hasContent) {
                    addError(defaultErrorMessage(`There is no ${contentRule} in mixin of`, type, name, path));
                }

                if (hasContent && contentRuleIndex !== convertedMixinText.lastIndexOf(contentRule)) {
                    addError(defaultErrorMessage(`It should be only one ${contentRule} rule in mixin in`, type, name, path));
                }

                if (hasContent && /[a-z]+/.test(convertedMixinText.slice(contentRuleIndex + contentRule.length))) {
                    addError(defaultErrorMessage(`It should be no rule after ${contentRule} rule in mixin in`, type, name, path));
                }
            });
        });
    }
};
