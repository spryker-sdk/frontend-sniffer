const dirs = require('./shared/core.dir');
const patterns = require('./shared/core.pattern');

exports.dirs = [
    ...dirs.default
]

exports.patterns = [
    '**/Theme/default/components/atoms/*',
    '**/Theme/default/components/molecules/*',
    '**/Theme/default/components/organisms/*',
    ...patterns.excluded
]

exports.options = {
    followSymlinkedDirectories: false,
    absolute: true,
    onlyFiles: false,
    onlyDirectories: true
}
