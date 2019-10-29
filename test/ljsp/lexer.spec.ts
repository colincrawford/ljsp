import { fromString } from '../../ljsp/input-stream';

import { tokenize, skipWhitespace, restOfLine } from '../../ljsp/lexer';

describe('tokenize', () => {
  it('', () => {
    expect(true).toBe(true);
  });
});

describe('restOfLine', () => {
  it('reads until a newline', () => {
    const str = `abc
def`;
    const { result } = restOfLine(fromString(str));

    expect(result).toEqual('abc');
  });

  it('reads until the end of the stream if one the last line', () => {
    const { result } = restOfLine(fromString('def'));

    expect(result).toEqual('def');
  });
});
describe('skipWhitespace', () => {
  it('doesnt do anything if the next char isnt whitespace', () => {
    const { cursor } = skipWhitespace(fromString('hello'));

    expect(cursor).toEqual(0);
  });

  it('moves the InputStream cursor past spaces', () => {
    const numSpaces = 4;
    const str = `${' '.repeat(4)}h`;
    const { cursor } = skipWhitespace(fromString(str));

    expect(cursor).toEqual(numSpaces);
  });
});
