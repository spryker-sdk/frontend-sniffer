
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
    }

    public addLog(message: string): void {
        this.logMessages.push(message);
    }

    public addWarning(message: string): void {
        this.warningMessages.push(message);
    }

    public addError(message: string): void {
        this.errorMessages.push(message);
    }

    public get name(): string {
        return this.ruleName;
    }

    public get result(): TestResult {
        if (this.errorMessages.length > 0) {
            return TestResult.FAILED;
        }

        if (this.warningMessages.length > 0) {
            return TestResult.SUCCEDED_WITH_WARNINGS;
        }

        return TestResult.SUCCEDED;
    }

    public get isValid(): boolean {
        if (this.errorMessages.length > 0) {
            return false;
        }

        return true;
    }

    public get logs(): string[] {
        return this.logMessages;
    }

    public get warnings(): string[] {
        return this.warningMessages;
    }

    public get errors(): string[] {
        return this.errorMessages;
    }
}
