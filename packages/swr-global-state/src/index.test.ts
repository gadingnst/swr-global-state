import { createStore } from './index';

const useCounter = createStore({
  initial: 0,
  key: 'counter'
});

describe('initial test', () => {
  it('should be defined', () => {
    expect(useCounter).toBeDefined();
  });
});
