import { InputStream, next, peek, isFinished } from './input-stream';
import { removeFromString } from './utils';
import { syntaxError, fatalError } from './logger';

export enum TokenType {
  String = 'string',
  Symbol = 'symbol',
  Number = 'number',
  OpenParen = 'openParen',
  CloseParen = 'closeParen',
}

export function tokenToString({ token, startPosition, endPosition }: Token) {
  return ` - ${startPosition.line}:${startPosition.column} - ${endPosition.line}:${endPosition.column} -> "${token}" - `;
}

export interface TokenPosition {
  line: number;
  column: number;
}

export function tokenPosition({ line, column }: InputStream): TokenPosition {
  return { line, column };
}

export interface BaseToken<T = string> {
  type: TokenType;
  token: T;
  startPosition: TokenPosition;
  endPosition: TokenPosition;
  toString(): string;
}

const baseToken: Pick<Token, 'toString'> = {
  toString(): string {
    return tokenToString(this as Token);
  },
};

export type Token =
  | StringToken
  | NumberToken
  | SymbolToken
  | OpenParenToken
  | CloseParenToken;

export type TokenReader = (inputStream: InputStream) => Token;

export function getTokenReader(nextChar: string): TokenReader {
  if (isString(nextChar)) return readString;
  if (isNumber(nextChar)) return readNumber;
  if (isSymbol(nextChar)) return readSymbol;
  if (isOpenParen(nextChar)) return readOpenParen;
  if (isCloseParen(nextChar)) return readCloseParen;
  fatalError(`Unable to process character "${nextChar}"`);
  throw new Error('Fatal Error Encountered');
}

export type DoneReading = (
  stream: InputStream
) => (resultSoFar: string) => boolean;

export function readUntil(inputStream: InputStream) {
  return (doneReading: DoneReading) => {
    let result = '';
    while (!doneReading(inputStream)(result)) result += next(inputStream);
    return result;
  };
}

// Numbers
interface NumberToken extends BaseToken<number> {
  type: TokenType.Number;
}

function NumberToken(
  num: number,
  startPosition: TokenPosition,
  endPosition: TokenPosition
): NumberToken {
  return Object.freeze({
    type: TokenType.Number,
    token: num,
    startPosition,
    endPosition,
    ...baseToken,
  });
}

export function isNumber(startingChar: string): boolean {
  return Boolean(startingChar.match(/[0-9]/));
}

export function readNumber(inputStream: InputStream): Token {
  const startPosition = tokenPosition(inputStream);
  const done: DoneReading = stream => result =>
    isFinished(stream) || !Boolean(peek(stream).match(/[\d\_]/));

  const result = readUntil(inputStream)(done);

  if (result[result.length - 1] === '_') {
    const errorMsg = `"_" is not allowed at the end of numeric literals - "${result}"`;
    syntaxError(errorMsg, inputStream);
  }
  const endPosition = tokenPosition(inputStream);

  return NumberToken(
    Number(removeFromString('_')(result)),
    startPosition,
    endPosition
  );
}

// Strings
interface StringToken extends BaseToken {
  type: TokenType.String;
}

function StringToken(
  str: string,
  startPosition: TokenPosition,
  endPosition: TokenPosition
): StringToken {
  return Object.freeze({
    type: TokenType.String,
    token: str,
    startPosition,
    endPosition,
    ...baseToken,
  });
}

export function isString(startingChar: string): boolean {
  return Boolean(startingChar.match(/["']/));
}

export function readString(inputStream: InputStream): StringToken {
  const startPosition = tokenPosition(inputStream);
  // Assumes the first char is a valid string starter
  // we have two quotes and they match
  const done: DoneReading = stream => result =>
    Boolean(result.length > 2 && result[0] === result[result.length - 1]);

  const result = readUntil(inputStream)(done);
  const endPosition = tokenPosition(inputStream);

  return StringToken(result.trim(), startPosition, endPosition);
}

// Symbols
interface SymbolToken extends BaseToken {
  type: TokenType.Symbol;
}

function SymbolToken(
  symb: string,
  startPosition: TokenPosition,
  endPosition: TokenPosition
): SymbolToken {
  return Object.freeze({
    type: TokenType.Symbol,
    token: symb,
    startPosition,
    endPosition,
    ...baseToken,
  });
}

const validSymbolChar = /[^()\[\]\d ]/;

function isValidSymbolChar(character: string): boolean {
  return Boolean(character.match(validSymbolChar));
}

export const isSymbol = isValidSymbolChar;

export function readSymbol(inputStream: InputStream): Token {
  const startPosition = tokenPosition(inputStream);
  const done: DoneReading = stream => result => {
    const nextChar = peek(stream);
    return (
      isFinished(stream) || nextChar === ' ' || !isValidSymbolChar(nextChar)
    );
  };

  const result = readUntil(inputStream)(done);
  const endPosition = tokenPosition(inputStream);

  return SymbolToken(result.trim(), startPosition, endPosition);
}

// Parens
interface OpenParenToken extends BaseToken {
  type: TokenType.OpenParen;
}

function OpenParenToken(
  startPosition: TokenPosition,
  endPosition: TokenPosition
): OpenParenToken {
  return Object.freeze({
    type: TokenType.OpenParen,
    token: '(',
    startPosition,
    endPosition,
    ...baseToken,
  });
}

export function isOpenParen(startingChar: string): boolean {
  return startingChar === '(';
}

export function readOpenParen(inputStream: InputStream): OpenParenToken {
  const startPosition = tokenPosition(inputStream);
  next(inputStream);
  const endPosition = tokenPosition(inputStream);
  return OpenParenToken(startPosition, endPosition);
}

interface CloseParenToken extends BaseToken {
  type: TokenType.CloseParen;
}

function CloseParenToken(
  startPosition: TokenPosition,
  endPosition: TokenPosition
): CloseParenToken {
  return Object.freeze({
    type: TokenType.CloseParen,
    token: ')',
    startPosition,
    endPosition,
    ...baseToken,
  });
}

export function isCloseParen(startingChar: string): boolean {
  return startingChar === ')';
}

export function readCloseParen(inputStream: InputStream): CloseParenToken {
  const startPosition = tokenPosition(inputStream);
  next(inputStream);
  const endPosition = tokenPosition(inputStream);
  return CloseParenToken(startPosition, endPosition);
}
