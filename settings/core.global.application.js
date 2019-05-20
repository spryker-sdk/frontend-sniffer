const dirs = require('./shared/core.dir');
const patterns = require('./shared/core.pattern');

exports.dirs = [
    ...dirs.default
]

exports.patterns = [
    '**/Theme/default/app/*',
    ...patterns.excluded
]

exports.options = {
    followSymlinkedDirectories: false,
    absolute: true,
    onlyFiles: true,
    onlyDirectories: false
}
