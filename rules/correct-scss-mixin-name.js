const { dim, bold } = require('colors');
const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-scss-mixin-name';
    }

    test(data) {
        data.components.forEach(component => {
            const { sass } = component.files;

            if (sass.exists) {
                const { type, name, path } = component;
                const moduleName = component.module;
                const letterModuleArray = moduleName.split('');
                const convertedLetterModuleArray = letterModuleArray.map((letter, index) => {
                    if (letter !== letter.toLowerCase() && index) {
                        return `-${letter.toLowerCase()}`;
                    }

                    return letter;
                });
                const convertedModuleName = convertedLetterModuleArray.join('').toLowerCase();
                const { mixins } = sass.api.external;

                if (mixins.length && mixins[0].name !== `${convertedModuleName}-${name}`) {
                    this.outcome.addError(`name of the first mixin in file should consist of module name and component name in ${type} ${bold(name)}:\n${dim(path)}`);
                }
            }
        });
    }
}
