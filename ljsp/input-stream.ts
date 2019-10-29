import * as fs from 'fs';
import * as os from 'os';

import { fatalError } from './logger';

export interface InputStream {
  line: number;
  column: number;
  cursor: number;
  source: string;
}

export interface InputStreamOperationResult<T = string> {
  result: T;
  inputStream: InputStream;
}

export function fromFile(filePath: string) {
  return fromString(fs.readFileSync(filePath, { encoding: 'utf-8' }));
}

export function fromString(source: string) {
  return Object.freeze({
    line: 0,
    column: 0,
    cursor: 0,
    source,
  });
}

export function copy(inputStream: InputStream): InputStream {
  return { ...inputStream };
}

export function isFinished(inputStream: InputStream): boolean {
  return inputStream.cursor >= inputStream.source.length;
}

export function peek(inputStream: InputStream): string {
  if (isFinished(inputStream)) {
    fatalError(inputStream, '"peek" called on an empty stream');
  }

  return inputStream.source[inputStream.cursor];
}

export function next(inputStream: InputStream): InputStreamOperationResult {
  const nextChar = peek(inputStream);
  const isNewline = nextChar === os.EOL;
  const line = isNewline ? inputStream.line + 1 : inputStream.line;
  const column = isNewline ? 0 : inputStream.column + 1;
  return Object.freeze({
    result: nextChar,
    inputStream: {
      ...inputStream,
      line,
      column,
      cursor: inputStream.cursor + 1,
    },
  });
}
