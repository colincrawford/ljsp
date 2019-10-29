import * as path from 'path';

import {
  InputStream,
  fromFile,
  fromString,
  isFinished,
  peek,
  next,
} from '../../ljsp/input-stream';

let emptyInputStream: InputStream;
const inputStreamContent = 'abcd';
let nonEmptyInputStream: InputStream;

beforeEach(() => {
  emptyInputStream = fromString('');
  nonEmptyInputStream = fromString(inputStreamContent);
});

describe('fromFile', () => {
  it('creates an InputStream from a file', () => {
    const fixtureFilePath = path.resolve(
      __dirname,
      '../fixtures/simple-program.ljsp'
    );
    const inputStream = fromFile(fixtureFilePath);

    expect(inputStream).toBeDefined();
  });
});

describe('fromString', () => {
  it('creates an InputStream from a string', () => {
    expect(emptyInputStream).toBeDefined();
    expect(nonEmptyInputStream).toBeDefined();
  });
});

describe('isFinished', () => {
  it('returns true for a finished stream', () => {
    expect(isFinished(emptyInputStream)).toBe(true);
  });

  it('returns false for a non finished stream', () => {
    expect(isFinished(nonEmptyInputStream)).toBe(false);
  });
});

describe('next', () => {
  it('creates an InputStreamOperationResult with the next char', () => {
    const nextResult = next(nonEmptyInputStream);

    expect(nextResult.result).toEqual(inputStreamContent[0]);
    expect(nextResult.inputStream).toBeDefined();
  });

  it('returns an input stream advanced by one char', () => {
    const { inputStream } = next(nonEmptyInputStream);
    const nextResult = next(inputStream);

    expect(nextResult.result).toEqual(inputStreamContent[1]);
    expect(nextResult.inputStream).toBeDefined();
  });
});

describe('peek', () => {
  it('return the next char in a non empty InputStream', () => {
    expect(peek(nonEmptyInputStream)).toEqual(inputStreamContent[0]);
  });

  it('doesnt update the stream cursor', () => {
    peek(nonEmptyInputStream);

    expect(nonEmptyInputStream.cursor).toEqual(0);
  });
});
