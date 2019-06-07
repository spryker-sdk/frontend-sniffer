const { environment } = require('./dist/environment');
const { collect } = require('./dist/collector');
const { sniff } = require('./dist/sniffer');
const { TestOutcome } = require('./dist/sniffer/test-outcome');

module.exports = {
    environment,
    collect,
    sniff,
    TestOutcome
}
