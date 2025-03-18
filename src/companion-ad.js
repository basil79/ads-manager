const CompanionAd = function(companion) {
  this.companion = companion;
};
CompanionAd.prototype.getWidth = function() {
  return this.companion.width ? Number(this.companion.width) : 0;
};
CompanionAd.prototype.getHeight = function() {
  return this.companion.height ? Number(this.companion.height) : 0;
};
CompanionAd.prototype.getContent = function() {


  let adContent = null;

  // HTML
  if(this.companion.htmlResources.length) {

    const template = document.createElement('div');
    template.innerHTML = this.companion.htmlResources[0];

    adContent = template; //template.content.firstElementChild;

  }

  // Static img
  if(this.companion.staticResources.length
    && this.companion.staticResources[0].creativeType
    && ['image/gif', 'image/jpeg', 'image/png'].indexOf(this.companion.staticResources[0].creativeType)) {

    // TODO:
    const div = document.createElement('div');
    const img = document.createElement('img');
    img.src = this.companion.staticResources[0].url;
    if(this.companion.altText) {
      img.alt = this.companion.altText;
    }
    img.width = this.getWidth() || '100%';
    img.height = this.getHeight() || '100%';

    div.appendChild(img);

    let link = null;
    if(this.companion.companionClickThroughURLTemplate) {
      link = document.createElement('a');
      link.href = this.companion.companionClickThroughURLTemplate;
      link.target = '_blank';
      // Tracking clickThrough
      if(this.companion.companionClickTrackingURLTemplates.length) {
        link.addEventListener('click', (e) => {
          const imgPixel = new Image();
          imgPixel.src = this.companion.companionClickTrackingURLTemplates[0].url;
          return true;
        }, false);
      }
    }

    if(link) {
      link.appendChild(div);
      adContent = link;
    } else {
      adContent = div;
    }

  }

  // Tracking creativeView
  if(this.companion.trackingEvents.creativeView) {
    this.companion.trackingEvents.creativeView.forEach((e) => {
      const iframePixel = document.createElement('iframe');
      iframePixel.src = e;
      iframePixel.frameBorder = '0';
      iframePixel.width = '0';
      iframePixel.height = '0';
      iframePixel.style.border = '0';
      iframePixel.style.verticalAlign = 'bottom';
      iframePixel.style.display = 'block';
      iframePixel.style.width = '0px';
      iframePixel.style.height = '0px';

      if(adContent) {
        adContent.appendChild(iframePixel);
      }
    });
  }

  return adContent;
};

export default CompanionAd;
