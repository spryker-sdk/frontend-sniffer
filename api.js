const { environment } = require('./dist/environment');
const { collect } = require('./dist/collector');
const { sniff } = require('./dist/sniffer');
const { Rule } = require('./dist/sniffer/rule');

module.exports = {
    environment,
    collect,
    sniff,
    Rule
};
