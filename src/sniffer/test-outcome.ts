const { dim, bold } = require('colors');

export enum TestResult {
    SUCCEDED = 'succeded',
    SUCCEDED_WITH_WARNINGS = 'succeded-with-warnings',
    FAILED = 'failed'
}

export class TestOutcome {
    protected readonly ruleName: string
    protected logMessages: string[] = []
    protected warningMessages: string[] = []
    protected errorMessages: string[] = []

    constructor(ruleName: string) {
        this.ruleName = ruleName;
        this.addError = this.addError.bind(this);
    }

    addLog(message: string): void {
        this.logMessages.push(message);
    }

    addWarning(message: string): void {
        this.warningMessages.push(message);
    }

    addError(message: string): void {
        this.errorMessages.push(message);
    }

    errorMessage(message: string, type: string, name: string, path: string): string {
        return `${message} ${type} ${bold(name)}:\n${dim(path)}`;
    }

    get name(): string {
        return this.ruleName;
    }

    get result(): TestResult {
        if (this.errorMessages.length > 0) {
            return TestResult.FAILED;
        }

        if (this.warningMessages.length > 0) {
            return TestResult.SUCCEDED_WITH_WARNINGS;
        }

        return TestResult.SUCCEDED;
    }

    get isValid(): boolean {
        if (this.errorMessages.length > 0) {
            return false;
        }

        return true;
    }

    get logs(): string[] {
        return this.logMessages;
    }

    get warnings(): string[] {
        return this.warningMessages;
    }

    get errors(): string[] {
        return this.errorMessages;
    }
}
