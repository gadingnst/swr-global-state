import { hasValue } from '../src/utils';

describe('Utility test', () => {
  describe('hasValue() function', () => {
    it('should return true if variable has value', () => {
      expect(hasValue(1)).toBe(true);
      expect(hasValue('')).toBe(true);
      expect(hasValue(0)).toBe(true);
      expect(hasValue(NaN)).toBe(true);
      expect(hasValue(null)).toBe(false);
      expect(hasValue(undefined)).toBe(false);
    });
  });
});
