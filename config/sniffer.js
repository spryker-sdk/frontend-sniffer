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

    enable: []
};
