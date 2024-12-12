export default class AdError {
    /**
     *
     * @param {string} message
     * @param {string} [errorCode]
     * @param {Object} [innerError]
     */
    constructor(message: string, errorCode?: string, innerError?: any);
    getMessage(): string;
    getErrorCode(): string;
    getInnerError(): any;
    setInnerError(innerError: any): void;
    formatMessage(...values: any[]): this;
    toString(): string;
    #private;
}
