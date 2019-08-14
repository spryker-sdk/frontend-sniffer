const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-twig-block-name';
    }

    test(data) {
        const { formatMessage, addError } = this.outcome;

        this.filterModulesData(data, 'twig').forEach(twigFileData => {
            const { files, type, name, path } = twigFileData;
            const { external } = files.twig.api;
            const blocks = (external && external.blocks) ? external.blocks : null;

            if (!blocks) {
                return;
            }

            blocks.forEach(block => {
                if (/^[a-zA-Z0-9]*$/.test(block.name)) {
                    return;
                }

                addError(formatMessage('There are deprecated symbols in block name', type, name, path));
            })
        });
    }
};
