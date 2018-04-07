export default {
  formatDate,
  formatCurrency
};

function formatDate (value) {
  if (!(value instanceof Date)) {
    throw new Error(`FormatHelpers.jsx: Trying to parse Date with some invalid value: ${value}`);
  }

  let day = value.getDate();
  let month = value.getMonth() + 1;

  if (day < 10) {
    day = `0${day}`;
  }

  if (month < 10) {
    month = `0${month}`;
  }

  return `${day}/${month}/${value.getFullYear()}`;
};

function formatCurrency (value) {
  return `R$ ${value.toFixed(2)}`;
}
