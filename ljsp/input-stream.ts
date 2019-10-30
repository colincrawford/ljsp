import * as fs from 'fs';
import * as os from 'os';

import { fatalError } from './logger';

export interface InputStream {
  line: number;
  column: number;
  cursor: number;
  source: string;
}

export function fromString(source: string): InputStream {
  return {
    line: 0,
    column: 0,
    cursor: 0,
    source,
  };
}

export function isFinished(inputStream: InputStream): boolean {
  return inputStream.cursor >= inputStream.source.length;
}

export function peek(inputStream: InputStream): string {
  if (isFinished(inputStream)) {
    fatalError('"peek" called on an empty stream', inputStream);
  }

  return inputStream.source[inputStream.cursor];
}

export function next(inputStream: InputStream): string {
  const nextChar = peek(inputStream);
  const isNewline = nextChar === os.EOL;
  if (isNewline) {
    inputStream.line += 1;
    inputStream.column = 0;
  }
  inputStream.cursor++;
  return nextChar;
}
