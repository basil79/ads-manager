const Ad = function(creative) {
  this.adId = creative.adId;
  this.duration = creative.duration;
  this.linear = creative.type === 'linear' ? true : false;
};
Ad.prototype.getAdId = function() {
  return this.adId;
};
Ad.prototype.getDuration = function() {
  return this.duration;
};
Ad.prototype.getMediaUrl = function() {
  return null;
};
Ad.prototype.isLinear = function() {
  return this.linear;
};

export default Ad;
