const { environment } = require('./dist/environment');
const { collect } = require('./dist/collector');
const { sniff, parseOutputFieldHelper } = require('./dist/sniffer');
const { Rule } = require('./dist/sniffer/rule');
const { isSnifferDisabled } = require('./dist/collector/parsers/common');

module.exports = {
    environment,
    collect,
    sniff,
    Rule,
    parseOutputFieldHelper,
    isSnifferDisabled
}
