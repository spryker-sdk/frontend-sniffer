const { dim, bold } = require('colors');
const { Rule, parseOutputFieldHelper } = require('../api');
const { stringify } = require('sast');

module.exports = class extends Rule {
    getName() {
        return 'correct-scss-component-structure';
    }

    test(data) {
        parseOutputFieldHelper(data.components).forEach(component => {
            const { files, type, name, path } = component;

            if (files.sass.exists) {
                const { sass } = component.files;
                const { mixins } = sass.api.external;
                const { name: scssFileName } = sass;

                if (name !== scssFileName.slice(0, scssFileName.lastIndexOf('.scss'))) {
                    this.outcome.addError(`There is wrong name of scss file in ${type} ${bold(name)}:\n${dim(path)}`);
                }

                mixins.forEach(mixin => {
                    const contentRule = '@content';
                    const { name: mixinName, hasContent, tree } = mixin;
                    const convertedMixinText = stringify(tree);
                    const contentRuleIndex = convertedMixinText.indexOf(contentRule);

                    if (!mixinName.includes(name)) {
                        this.outcome.addError(`There is wrong name of mixin in scss file of ${type} ${bold(name)}:\n${dim(path)}`);
                    }

                    if (!hasContent) {
                        this.outcome.addError(`There is no ${contentRule} in mixin of ${type} ${bold(name)}:\n${dim(path)}`);
                    }

                    if (hasContent && contentRuleIndex !== convertedMixinText.lastIndexOf(contentRule)) {
                        this.outcome.addError(`It should be only one ${rule} rule in mixin in ${type} ${bold(name)}:\n${dim(path)}`);
                    }

                    if (hasContent && /[a-z]+/.test(convertedMixinText.slice(contentRuleIndex + contentRule.length))) {
                        this.outcome.addError(`It should be no rule after ${contentRule} rule in mixin in ${type} ${bold(name)}:\n${dim(path)}`);
                    }
                });
            }
        });
    }
};
