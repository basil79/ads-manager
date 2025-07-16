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

function loadScript(src, async = false) {
  return new Promise((res, rej) => {
    const firstElement = document.getElementsByTagName('head')[0] || document.documentElement,
      scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.src = src;
    scriptElement.async = async;
    scriptElement.onload = res;
    scriptElement.onerror = rej;
    firstElement.insertBefore(scriptElement, firstElement.firstChild);
  });
}

export {
  format,
  loadScript,
}
