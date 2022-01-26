function replaceMessage(message, ...values) {
  try {
    values.forEach(function(value, key) {
      message = message.replace(
        new RegExp('\\{' + key + '}', 'g'),
        value
      )
    });
  } catch (e) {}
  return message
}

export {
  replaceMessage
}
