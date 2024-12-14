export default class Ad {
  #adId;
  #duration;
  #linear;

  /**
   *
   * @param {Object} creative
   * @param {string=} creative.adId
   * @param {number=} creative.duration
   * @param {string} creative.type
   */
  constructor(creative) {
    this.#adId = creative.adId;
    this.#duration = creative.duration;
    this.#linear = creative.type === 'linear' ? true : false;
  }

  /**
   *
   * @returns {string}
   */
  getAdId() {
    return this.#adId;
  }

  /**
   *
   * @returns {number}
   */
  getDuration() {
    return this.#duration;
  }
  getMediaUrl() {
    return null;
  }

  /**
   *
   * @returns {boolean}
   */
  isLinear() {
    return this.#linear;
  }
}
