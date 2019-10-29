import {
  InputStream,
  InputStreamOperationResult,
  next,
  peek,
  isFinished,
} from './input-stream';
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

export type TokenReader = (inputStream: InputStream) => TokenReadResult;

export interface TokenReadResult {
  token: Token;
  inputStream: InputStream;
}

export type DoneReading = (
  stream: InputStream
) => (resultSoFar: string) => boolean;

export function readUntil(inputStream: InputStream) {
  return (doneReading: DoneReading): InputStreamOperationResult => {
    let stream = inputStream;
    let result = '';

    while (!doneReading(stream)(result)) {
      const { inputStream: updatedStream, result: nextChar } = next(stream);
      stream = updatedStream;
      result += nextChar;
    }

    return { inputStream: stream, result };
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

export function readNumber(inputStream: InputStream): TokenReadResult {
  const done: DoneReading = stream => result =>
    isFinished(stream) || !Boolean(peek(stream).match(/[\d\_]/));

  const { inputStream: stream, result } = readUntil(inputStream)(done);

  if (result[result.length - 1] === '_') {
    const errorMsg = `"_" is not allowed at the end of numeric literals - "${result}"`;
    syntaxError(stream, errorMsg);
  }

  console.log(removeFromString('_')(result));

  return {
    inputStream: stream,
    token: numberToken(Number(removeFromString('_')(result))),
  };
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

export function readString(inputStream: InputStream): TokenReadResult {
  // Assumes the first char is a valid string starter
  // we have two quotes and they match
  const done: DoneReading = stream => result =>
    Boolean(result.length > 2 && result[0] === result[result.length - 1]);

  const { inputStream: stream, result } = readUntil(inputStream)(done);

  return { inputStream: stream, token: stringToken(result.trim()) };
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

export function readSymbol(inputStream: InputStream): TokenReadResult {
  const done: DoneReading = stream => result => {
    const nextChar = peek(stream);
    return (
      isFinished(stream) || nextChar === ' ' || !isValidSymbolChar(nextChar)
    );
  };

  const { inputStream: stream, result } = readUntil(inputStream)(done);

  return { inputStream: stream, token: symbolToken(result.trim()) };
}

// Parens
interface OpenParenToken {
  type: TokenType.OpenParen;
}

function openParenToken() {
  return Object.freeze({
    type: TokenType.OpenParen,
    token: '(',
  });
}

interface CloseParenToken {
  type: TokenType.CloseParen;
}

function closeParenToken() {
  return Object.freeze({
    type: TokenType.CloseParen,
    token: ')',
  });
}

export function isParen(startingChar: string): boolean {
  return Boolean(startingChar.match(/[()]/));
}

export function readParen(inputStream: InputStream): TokenReadResult {
  const { inputStream: advancedStream, result: paren } = next(inputStream);
  let token;

  if (paren === '(') token = openParenToken();
  else if (paren === ')') token = closeParenToken();
  else fatalError(inputStream, `Tried to read "${paren}" as a paren`);

  return { inputStream: advancedStream, token: token as Token };
}
