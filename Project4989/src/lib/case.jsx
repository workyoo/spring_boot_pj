// src/lib/case.js
const isPlainObject = (v) => Object.prototype.toString.call(v) === '[object Object]';

const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const toSnake = (s) =>
  s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');

export function keysToCamel(input) {
  if (Array.isArray(input)) return input.map(keysToCamel);
  if (isPlainObject(input)) {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [toCamel(k), keysToCamel(v)])
    );
  }
  return input;
}

export function keysToSnake(input) {
  if (Array.isArray(input)) return input.map(keysToSnake);
  if (isPlainObject(input)) {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [toSnake(k), keysToSnake(v)])
    );
  }
  return input;
}
