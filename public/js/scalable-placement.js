class ScalablePlacement {
  #container;
  #slotContainer;
  #resizer;
  #width = 0;
  #height = 0;

  #currentAd;
  constructor(container) {
    this.#container = container;

    // slot container
    this.#slotContainer = document.createElement('div');

    // styles for container
    setStyle(this.#container, {
      display: 'flex',
      overflow: 'hidden',
      'box-sizing': 'border-box',
      'align-items': 'center',
      'justify-content': 'center'
    });
    // styles for slotContainer
    setStyle(this.#slotContainer, {
      'transform-origin': 'center center'
    });

    this.#container.appendChild(this.#slotContainer);

    // resizer
    this.#resizer = document.createElement('iframe');
    setStyle(this.#resizer, {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      position: 'absolute',
      border: 'none',
      backgroundColor: 'transparent',
      'z-index': -1
    });
    this.#resizer.setAttribute('allowtransparency', true);
    // append resizer
    this.#container.appendChild(this.#resizer);
    this.#handleResize();
    this.#resizer.contentWindow.onresize = this.#handleResize.bind(this);

  }

  #updateSlotContainerSize() {
    if(this.#currentAd) {
      let margin = 50; // TODO:
      // calculate ratio
      let ratio = calculateRatio(this.#width, this.#height - margin, this.#currentAd.width, this.#currentAd.height);
      console.log('update > scalable > slot container size', this.#width, this.#height, this.#currentAd.width, this.#currentAd.height, 'ratio', ratio);
      if(ratio < 1) {
        this.#slotContainer.style.transform = `scale3d(${ratio}, ${ratio}, 1)`;
      } else {
        this.#slotContainer.style.transform = null;
      }
    }
  }

  renderAd(html, width, height) {

    this.destroyAd();

    console.log('SP > renderAd', html, width, height);

    // Create slot
    const slot = document.createElement('div');
    // Update slot height
    setStyle(slot, {
      margin: 'auto',
      'text-align': 'center'
    });
    // Append slot into the slotContainer
    this.#slotContainer.appendChild(slot);


    //debugger

    const iframe = document.createElement('iframe');
    iframe.width = width || '100%';
    iframe.height = height || '100%';
    iframe.scrolling = 'no';
    iframe.marginWidth = '0';
    iframe.marginHeight = '0';
    iframe.frameBorder = '0';
    iframe.tabIndex = 0;
    iframe.style.border = '0';
    iframe.style.verticalAlign = 'bottom';
    iframe.src = 'about:blank';

    // Append iframe into the slot
    slot.appendChild(iframe);
    //debugger

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();

    // Update currentAd
    this.#currentAd = {
      width: width,
      height: height
    }

    this.#updateSlotContainerSize();
  }

  destroyAd() {
    console.log('SP > destroyAd');
    if(this.#currentAd) {
      this.#currentAd = null;
    }

    this.#removeAsset();
  }

  #removeAsset() {
    [...this.#slotContainer.children]
      .forEach(child => {
          this.#slotContainer.removeChild(child);
      });
  }

  #handleResize() {
    console.log('SP on resize', this.#resizer.contentWindow.innerWidth, this.#resizer.contentWindow.innerHeight);
    this.#width = this.#resizer.contentWindow.innerWidth;
    this.#height = this.#resizer.contentWindow.innerHeight;

    console.log('SP on resize > scalable > update container size', this.#slotContainer.getBoundingClientRect());
    setStyle(this.#container, {
      width: this.#width,
      height: this.#height
    });
    // TODO: update slot container size
    this.#updateSlotContainerSize();
  }
}

function setStyle(el, style){
  for(var i in style){
    if(style.hasOwnProperty(i)){
      switch(i){
        case 'left':
        case 'right':
        case 'top':
        case 'bottom':
        case 'width':
        case 'height':
        case 'minWidth':
        case 'minHeight':
        case 'maxWidth':
        case 'maxHeight':
        case 'paddingLeft':
        case 'paddingTop':
        case 'paddingBottom':
        case 'paddingRight':
        case 'marginLeft':
        case 'marginTop':
        case 'marginBottom':
        case 'marginRight':
        case 'lineHeight':
        case 'borderRadius':
          //TODO: make complete!
          if(style[i] !== 0 && style[i] !== '0' && typeof style[i] === 'number'){
            style[i] += 'px';
          }
        //fall-through
        default:
          el.style[i] = style[i];
          break;
      }
    }
  }
}

const calculateRatio = (e, r, n, i) => {
  let h = 0;
  n / i > 1 ? (e ? h = e / n : (h = r / i,
    e = Math.floor(h * n)),
  r || (r = Math.floor(h * i))) : (r ? h = r / i : (h = e / n,
    r = Math.floor(h * i)),
  e || (e = Math.floor(h * n)));

  console.log('ratio', h);
  //if(h > 1) {
  // upscale
  let p = i * h - i, y = Math.floor(p / 2);
  console.log(p, y);
  let g = i - i * h, m = Math.floor(g / 2);
  console.log(g, m);
  r && i * h >= r && (h = r / i)
  console.log(h, i * h >= r);



  console.log(e, r, n, i, h, '-upscale', p, y, '-downscale', g, m);
  return h;
}
