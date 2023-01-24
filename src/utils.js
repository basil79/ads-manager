function format(message, ...values) {
  try {
    values.forEach((value, key) => {
      message = message.replace(
        new RegExp('\\{' + key + '}', 'g'),
        value
      )
    });
  } catch (e) {}
  return message
}

function isIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

function isTopWindowAccessible() {
  let topDoc;
  try {
    topDoc = window.top.document;
  } catch (e) {
    return false;
  }
  return (topDoc !== null);
}

function getTopWindow() {
  return (isIframe() && isTopWindowAccessible()) ? window.top : window;
}

export {
  format,
  isIframe,
  isTopWindowAccessible,
  getTopWindow
}
