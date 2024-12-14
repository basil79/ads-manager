export default class AdError {
    /**
     *
     * @param {string} message
     * @param {number} [errorCode]
     * @param {Object} [innerError]
     */
    constructor(message: string, errorCode?: number, innerError?: any);
    /**
     *
     * @returns {string}
     */
    getMessage(): string;
    /**
     *
     * @returns {number}
     */
    getErrorCode(): number;
    getInnerError(): any;
    setInnerError(innerError: any): void;
    formatMessage(...values: any[]): this;
    toString(): string;
    #private;
}
