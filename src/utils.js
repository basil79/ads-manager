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

export {
  format
}
