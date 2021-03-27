export const fetcher = (url) =>
  fetch(url)
    .then((r) => r.json())
    .then((res) => res?.data || null);

export const capitalize = ([first, ...rest]) =>
  first.toUpperCase() + rest.join("").toLowerCase();

const email_regex = /(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const name_regex = /^[a-zA-Z\s]+$/i;

// E.164 standard for phone number
const phone_regex = /^\+[1-9]\d{1,14}$/;

export function validateName(value) {
  let error = "";
  if (!value) {
    error = "Required";
  } else if (value.length > 15) {
    error = "Must be 15 characters or less";
  } else if (!name_regex.test(value)) {
    error = "Invalid characters";
  }
  return error;
}

export function validateEmail(value) {
  let error = "";
  if (!value) {
    error = "Required";
  } else if (value.length > 50) {
    error = "Must be 50 characters or less";
  } else if (!email_regex.test(value)) {
    error = "Please enter a valid email address";
  }
  return error;
}

export function validatePassword(value) {
  let error = "";
  if (!value) {
    error = "Required";
  } else if (value.length < 8) {
    error = "Must be at least 8 characters";
  }
  return error;
}

export function validateRelation(value) {
  let error = "";
  if (!value || value == "Select Relation") {
    error = "Choose a relation";
  }
  return error;
}

export function validatePhone(value) {
  let error = "";
  if (!value) {
  } else if (!phone_regex.test(value)) {
    error = "Invalid phone number, don't forget to include country code";
  }
  return error;
}

export function validateImageName(value) {
  let error = "";
  if (!value) {
    error = "Required";
  }
  return error;
}

export function validateImageURL(value) {
  let error = "";
  if (!value) {
    error = "Required";
  }
  return error;
}

export const sanitizeName = (name) => name?.split(/\s/)[0].toLowerCase();
