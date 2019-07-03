const { dim, bold } = require('colors');
const { Rule, parseOutputFieldHelper } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-scss-component-structure';
    }

    test(data) {
        parseOutputFieldHelper(data.components).forEach(component => {
            const { files } = component;

            if (files.sass.exists) {
                const { sass } = component.files;
                const { mixins } = sass.api.external;
                const { name: scssFileName } = sass;
                const { type, name, path } = component;

                if (name !== scssFileName.slice(0, scssFileName.lastIndexOf('.scss'))) {
                    this.outcome.addError(`There is wrong name of scss file in ${type} ${bold(name)}:\n${dim(path)}`);
                }

                mixins.forEach(mixin => {
                    const { name: mixinName } = mixin;

                    if (!mixinName.includes(name)) {
                        this.outcome.addError(`There is wrong name of mixin in scss file of ${type} ${bold(name)}:\n${dim(path)}`);
                    }
                });
            }
        });
    }
};
