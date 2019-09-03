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

    enable: [
        'correct-scss-component-structure',
        'correct-tag-name',
        'correct-twig-component-structure',
        'correct-typescript-component-structure',
        'deprecation-warning',
        'mandatory-readme',
        'mandatory-z-index-variable'
    ]
};
