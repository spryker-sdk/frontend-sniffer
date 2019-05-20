const dirs = require('./shared/core.dir');
const patterns = require('./shared/core.pattern');

exports.dirs = [
    ...dirs.default
]

exports.patterns = [
    '**/Theme/default/styles/settings/*',
    '**/Theme/default/styles/helpers/*',
    '**/Theme/default/styles/basics/*',
    '**/Theme/default/styles/utils/*',
    '!shared.scss',
    '!basic.scss',
    '!util.scss',
    ...patterns.excluded
]

exports.options = {
    followSymlinkedDirectories: false,
    absolute: true,
    onlyFiles: true,
    onlyDirectories: false
}
