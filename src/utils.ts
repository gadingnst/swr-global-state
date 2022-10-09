/**
 * check is variable has value
 * @param variable
 * @returns {boolean} boolean if variable is has value
 */
export const hasValue = <T>(variable: T): boolean =>
  (typeof variable !== 'undefined' && variable !== null);
