export default class AdError {
    constructor(message: any, errorCode: any, innerError: any);
    getMessage(): any;
    getErrorCode(): any;
    getInnerError(): any;
    setInnerError(innerError: any): void;
    formatMessage(...values: any[]): this;
    toString(): string;
    #private;
};
