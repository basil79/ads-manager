import CompanionAd from './companion-ad';

const Ad = function(ad) {
  this.ad = ad;
  this.creative = this.ad.creatives.filter(creative => creative.type === 'linear' || creative.type === 'nonlinear')[0];
  this.companionCreative = this.ad.creatives.filter(creative => creative.type === 'companion')[0];
  this.adId = this.creative.adId;
  this.duration = this.creative.duration;
  this.linear = this.creative.type === 'linear' ? true : false;
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
Ad.prototype.getCompanionAds = function(width, height) {
  const companionAds = this.companionCreative ? this.companionCreative.variations.map(variation => new CompanionAd(variation)) : [];
  if(width && height) {
    return companionAds.filter(companionAd => companionAd.getWidth() == width && companionAd.getHeight() == height);
  }
  return companionAds;
};

export default Ad;
