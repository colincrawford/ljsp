import * as os from 'os';

import { fatalError, debug } from './logger';

import {
  InputStream,
  InputStreamOperationResult,
  isFinished,
  peek,
  copy,
} from './input-stream';

import {
  Token,
  TokenReader,
  TokenReadResult,
  readUntil,
  DoneReading,
  isString,
  readString,
  isNumber,
  readNumber,
  isSymbol,
  readSymbol,
  isParen,
  readParen,
} from './tokens';

export function tokenize(inputStream: InputStream): Token[] {
  const tokens: Token[] = [];
  let stream = inputStream;
  while (!isFinished(stream)) {
    const readResult = readToken(stream);
    stream = readResult.inputStream;
    tokens.push(readResult.token);
  }
  return tokens;
}

function getTokenReader(nextChar: string): TokenReader | null {
  if (isString(nextChar)) return readString;
  if (isNumber(nextChar)) return readNumber;
  if (isSymbol(nextChar)) return readSymbol;
  if (isParen(nextChar)) return readParen;
  return null;
}

export function readToken(inputStream: InputStream): TokenReadResult {
  const advancedStream = skipWhitespace(inputStream);
  const nextChar = peek(advancedStream);
  const tokenReader = getTokenReader(nextChar);
  if (!tokenReader) {
    fatalError(inputStream, `Unable to process character "${nextChar}"`);
  }
  return (tokenReader as TokenReader)(advancedStream);
}

export function restOfLine(
  inputStream: InputStream
): InputStreamOperationResult {
  const hitNewline: DoneReading = stream => result =>
    isFinished(stream) || endsInNewline(result);
  const { inputStream: iS, result } = readUntil(inputStream)(hitNewline);
  return { result: result.replace(os.EOL, ''), inputStream: iS };
}

const whitespaceChars = new Set(['\n', '\r', '\t', ' ']);

export function skipWhitespace(inputStream: InputStream): InputStream {
  const updatedStream = copy(inputStream);
  while (whitespaceChars.has(peek(updatedStream))) updatedStream.cursor++;
  return updatedStream;
}

function endsInNewline(str: string): boolean {
  return str.endsWith(os.EOL);
}
