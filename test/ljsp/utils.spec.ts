import { removeFromString } from '../../ljsp/utils';

describe('removeFromStr', () => {
  it('remove a given char from a string', () => {
    expect(removeFromString('_')('100_000')).toEqual('100000');
  });
});
