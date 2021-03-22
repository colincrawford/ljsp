import * as os from 'os';

import { fatalError, debug } from './logger';

import { InputStream, isFinished, peek, next } from './input-stream';

import {
  Token,
  TokenReader,
  readUntil,
  DoneReading,
  getTokenReader,
} from './tokens';

export function tokenize(inputStream: InputStream): Token[] {
  const tokens: Token[] = [];
  while (!isFinished(inputStream)) {
    const token = readToken(inputStream);
    debug(`Read Token - ${JSON.stringify(token)}`);
    tokens.push(token);
  }
  return tokens;
}

export function readToken(inputStream: InputStream): Token {
  skipWhitespace(inputStream);
  const nextChar = peek(inputStream);
  if (!nextChar) {
    fatalError('No next token');
    throw new Error();
  }
  const tokenReader = getTokenReader(nextChar);
  return (tokenReader as TokenReader)(inputStream);
}

export function restOfLine(inputStream: InputStream): string {
  const hitsNewline: DoneReading = stream => result =>
    isFinished(stream) || endsInNewline(result);
  const result = readUntil(inputStream)(hitsNewline);
  return result.replace(os.EOL, '');
}

const whitespaceChars = new Set(['\n', '\r', '\t', ' ']);

export function skipWhitespace(inputStream: InputStream): InputStream {
  while (whitespaceChars.has(peek(inputStream) || '')) next(inputStream);
  return inputStream;
}

function endsInNewline(str: string): boolean {
  return str.endsWith(os.EOL);
}
