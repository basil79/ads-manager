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
    getAdId(): string;
    getDuration(): number;
    getMediaUrl(): any;
    isLinear(): boolean;
    #private;
}
