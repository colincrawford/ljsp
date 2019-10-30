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
export interface BaseToken {
  type: TokenType;
}

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
  // typescript doesn't recognize that fatalError throws every time
  throw new Error();
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
interface NumberToken extends BaseToken {
  type: TokenType.Number;
  token: number;
}

function numberToken(num: number): NumberToken {
  return Object.freeze({
    type: TokenType.Number,
    token: num,
  });
}

export function isNumber(startingChar: string): boolean {
  return Boolean(startingChar.match(/[0-9]/));
}

export function readNumber(inputStream: InputStream): Token {
  const done: DoneReading = stream => result =>
    isFinished(stream) || !Boolean(peek(stream).match(/[\d\_]/));

  const result = readUntil(inputStream)(done);

  if (result[result.length - 1] === '_') {
    const errorMsg = `"_" is not allowed at the end of numeric literals - "${result}"`;
    syntaxError(errorMsg, inputStream);
  }

  return numberToken(Number(removeFromString('_')(result)));
}

// Strings
interface StringToken {
  type: TokenType.String;
  token: string;
}

function stringToken(str: string): StringToken {
  return Object.freeze({
    type: TokenType.String,
    token: str,
  });
}

export function isString(startingChar: string): boolean {
  return Boolean(startingChar.match(/["']/));
}

export function readString(inputStream: InputStream): StringToken {
  // Assumes the first char is a valid string starter
  // we have two quotes and they match
  const done: DoneReading = stream => result =>
    Boolean(result.length > 2 && result[0] === result[result.length - 1]);

  const result = readUntil(inputStream)(done);

  return stringToken(result.trim());
}

// Symbols
interface SymbolToken {
  type: TokenType.Symbol;
  token: string;
}

function symbolToken(symb: string): SymbolToken {
  return Object.freeze({
    type: TokenType.Symbol,
    token: symb,
  });
}

const validSymbolChar = /[^()\[\]\d ]/;

function isValidSymbolChar(character: string): boolean {
  return Boolean(character.match(validSymbolChar));
}

export const isSymbol = isValidSymbolChar;

export function readSymbol(inputStream: InputStream): Token {
  const done: DoneReading = stream => result => {
    const nextChar = peek(stream);
    return (
      isFinished(stream) || nextChar === ' ' || !isValidSymbolChar(nextChar)
    );
  };

  const result = readUntil(inputStream)(done);

  return symbolToken(result.trim());
}

// Parens
interface OpenParenToken {
  type: TokenType.OpenParen;
}

function openParenToken(): OpenParenToken {
  return Object.freeze({
    type: TokenType.OpenParen,
    token: '(',
  });
}

export function isOpenParen(startingChar: string): boolean {
  return startingChar === '(';
}

export function readOpenParen(inputStream: InputStream): OpenParenToken {
  next(inputStream);
  return openParenToken();
}

interface CloseParenToken {
  type: TokenType.CloseParen;
}

function closeParenToken(): CloseParenToken {
  return Object.freeze({
    type: TokenType.CloseParen,
    token: ')',
  });
}

export function isCloseParen(startingChar: string): boolean {
  return startingChar === ')';
}

export function readCloseParen(inputStream: InputStream): CloseParenToken {
  next(inputStream);
  return closeParenToken();
}
