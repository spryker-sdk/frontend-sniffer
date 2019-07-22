const { join } = require('path');

module.exports = {
    scan: {
        dirs: [
            join(__dirname, '../rules'),
        ],
        patterns: [
            '*.js'
        ],
        options: {
            followSymlinkedDirectories: false,
            absolute: true,
            onlyFiles: true,
            onlyDirectories: false
        }
    },

    enable: ['correct-tag-name', 'correct-twig-component-structure', 'correct-scss-component-structure', 'correct-typescript-component-structure', 'mandatory-z-index-variable', 'mandatory-readme', 'deprecation-warning']
};
