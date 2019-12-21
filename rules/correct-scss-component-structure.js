const { Rule } = require('../api');
const { stringify } = require('sast');

module.exports = class extends Rule {
    getName() {
        return 'correct-scss-component-structure';
    }

    test(data) {
        const { formatMessage, addError } = this.outcome;

        this.filterModulesData(data, 'sass').forEach(component => {
            const { module, files, type, name, path } = component;
            const { name: scssFileName, api } = files.sass;
            const { mixins } = api.external;

            if (name !== scssFileName.slice(0, scssFileName.lastIndexOf('.scss'))) {
                addError(formatMessage('There is wrong name of scss file in', type, name, path));
            }

            mixins.forEach((mixin, index) => {
                const contentRule = '@content';
                const camelCaseToDash = string => string.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
                const { name: mixinName, hasContent, tree } = mixin;
                const convertedMixinText = stringify(tree);
                const contentRuleIndex = convertedMixinText.indexOf(contentRule);
                const convertedModuleName = camelCaseToDash(module);

                if (!index && mixinName !== `${convertedModuleName}-${name}`) {
                    addError(formatMessage('Name of the first mixin in file should consist of module name and component name in', type, name, path));
                }

                if (!mixinName.includes(name)) {
                    addError(formatMessage('There is wrong name of mixin in scss file of', type, name, path));
                }

                if (!hasContent && !index) {
                    addError(formatMessage(`There is no ${contentRule} in the first mixin of`, type, name, path));
                }

                if (hasContent && contentRuleIndex !== convertedMixinText.lastIndexOf(contentRule)) {
                    addError(formatMessage(`It should be only one ${contentRule} rule in mixin in`, type, name, path));
                }

                if (hasContent && /[a-z]+/.test(convertedMixinText.slice(contentRuleIndex + contentRule.length))) {
                    addError(formatMessage(`It should be no rule after ${contentRule} rule in mixin in`, type, name, path));
                }
            });
        });
    }
};
