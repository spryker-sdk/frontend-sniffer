export const snifferDisabledRules = (content: string): string[] => {
    const snifferDisabledMatch = content.match(/(\/|\{)*. fe-sniffer:disabled [^(*|#)]*(\*\/|\#\})/);
    const snifferDisabledString = Boolean(snifferDisabledMatch) ? snifferDisabledMatch[0] : null;

    if (!snifferDisabledString) {
        return;
    }

    const correctSnifferDisabledString = snifferDisabledString.replace(/\/\*|\*\/|\#\}|\{\#/g, '').trim();
    const snifferDisabledRules = correctSnifferDisabledString.split(' ');
    snifferDisabledRules.shift();

    return snifferDisabledRules;
};

export const isSnifferDisabled = (disabledSnifferRules: string[], ruleName): boolean =>
    Array.isArray(disabledSnifferRules) && (!Boolean(disabledSnifferRules.length)
    || disabledSnifferRules.includes(ruleName));
