const { dim, bold } = require('colors');
const { Rule } = require('../api');
const { stringify } = require('sast');

module.exports = class extends Rule {
    getName() {
        return 'mandatory-mixin-content';
    }

    test(data) {
        data.components.forEach(component => {
            const {type, name, path, files} = component
            const { sass } = files;


            if (sass.exists) {
                sass.api.external.mixins.forEach(mixin => {
                    const rule = '@content';
                    const { hasContent: isContent } = mixin;

                    if (!isContent) {
                        this.outcome.addError(`There is no ${rule} in mixin of ${type} ${bold(name)}:\n${dim(path)}`);
                    }

                    const convertedMixinText = stringify(mixin.tree);
                    const ruleIndex = convertedMixinText.indexOf('@content');
                    const ruleLength = rule.length;

                    if (isContent && ruleIndex !== convertedMixinText.lastIndexOf(rule)) {
                        this.outcome.addError(`It should be only one ${rule} rule in mixin in ${type} ${bold(name)}:\n${dim(path)}`);
                    }

                    if (isContent && /[a-z]+/.test(convertedMixinText.slice(ruleIndex + ruleLength))) {
                        this.outcome.addError(`It should be no rule after ${rule} rule in mixin in ${type} ${bold(name)}:\n${dim(path)}`);
                    }
                });
            }
        });
    }
}
