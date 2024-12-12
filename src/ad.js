export default class Ad {
  #adId;
  #duration;
  #linear;
  constructor(creative) {
    this.#adId = creative.adId;
    this.#duration = creative.duration;
    this.#linear = creative.type === 'linear' ? true : false;
  }
  getAdId() {
    return this.#adId;
  }
  getDuration() {
    return this.#duration;
  }
  getMediaUrl() {
    return null;
  }
  isLinear() {
    return this.#linear;
  }
}
