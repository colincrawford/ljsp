import { EOL } from 'os'

export function tokenize(fileName, text) {
  const tokens = []
  let readerState = {
    done: false,
    inx: 0,
    text,
    location: {
      fileName,
      line: 0,
      column: 0,
    }
  }

  while (!readerState.done) {
    const readResult = readToken(readerState)
    readerState = readResult.readerState
    tokens.push(readResult.token)
  }

  return tokens
}

const TOKEN_TYPES = {
  NEWLINE: 'NEWLINE',
  WHITESPACE: 'WHITESPACE',
  NUMBER: 'NUMBER',
  SYMBOL: 'SYMBOL',
  IDENTIFIER: 'IDENTIFIER',
  OPEN_PAREN: 'OPEN_PAREN',
  CLOSE_PAREN: 'CLOSE_PAREN',
}

function newLocation(fileName, line, column) {
  return Object.freeze({ fileName, line, column })
}

function newToken(token, type, data, location) {
  return Object.freeze({ token, type, data, location })
}

const MONOMORPHIC_TOKENS = new Map([
  [' ', TOKEN_TYPES.WHITESPACE],
  ['\t', TOKEN_TYPES.WHITESPACE],
  [EOL, TOKEN_TYPES.NEWLINE],
  ['(', TOKEN_TYPES.OPEN_PAREN],
  [')', TOKEN_TYPES.CLOSE_PAREN],
  ['[', TOKEN_TYPES.OPEN_BRACKET],
  [']', TOKEN_TYPES.CLOSE_BRACKET],
])

function isNumber(char) {
  return !isNaN(parseInt(char, 10))
}

const WHITESPACE = new Set([EOL, ' ', '\t'])

function isWhitespace(char) {
  return WHITESPACE.has(char)
}

function readToken(readerState) {
  const { text } = readerState
  let location = readerState.location
  let inx = readerState.inx
  const char = text[inx]
  const data = {}
  let token

  const advanceLocation = () => {
    location = nextLocation(location, text[inx++])
  }

  if (MONOMORPHIC_TOKENS.has(char)) {
    token = newToken(char, MONOMORPHIC_TOKENS.get(char), data, location)
    advanceLocation()
  } else if (isNumber(char)) {
    let digits = char
    let isDecimal = false
    let { hasNextChar, nextChar } = peek(text, inx)
    advanceLocation()
    while(hasNextChar && (isNumber(nextChar) || char === '.')) {
      digits += text[inx]
      if (char === '.') {
        if (isDecimal) {
          throw new Error(`Error parsing number '${digits}' at file: ${location.fileName}, line: ${location.line}, column: ${location.column}`)
        }
        isDecimal = true
      }
      const peekResult = peek(text, inx)
      hasNextChar = peekResult.hasNextChar
      nextChar = peekResult.nextChar
      advanceLocation()
    }
    const number = isDecimal ? parseDecimal(digits) : parseInt(digits, 10)
    token = newToken(number, TOKEN_TYPES.NUMBER, data, location)
  } else {
    throw new Error(`Error parsing character '${char}' at file: ${location.fileName}, line: ${location.line}, column: ${location.column}`)
  }

  return {
    token,
    readerState: {
      ...readerState,
      inx,
      location,
      done: !peek(text, inx).hasNextChar,
    }
  }
}

function peek(text, inx) {
  return inx < (text.length - 1)
    ? { hasNextChar: true, nextChar: text[inx + 1] }
    : { hasNextChar: false }
}

function nextLocation(location, nextChar) {
  return nextChar === EOL
    ? { ...location, column: 0, line: location.line + 1 }
    : { ...location, column: location.column + 1 }
}

