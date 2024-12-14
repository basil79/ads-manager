export default class Ad {
    /**
     *
     * @param {Object} creative
     * @param {string=} creative.adId
     * @param {number=} creative.duration
     * @param {string} creative.type
     */
    constructor(creative: {
        adId?: string | undefined;
        duration?: number | undefined;
        type: string;
    });
    /**
     *
     * @returns {string}
     */
    getAdId(): string;
    /**
     *
     * @returns {number}
     */
    getDuration(): number;
    getMediaUrl(): any;
    /**
     *
     * @returns {boolean}
     */
    isLinear(): boolean;
    #private;
}
