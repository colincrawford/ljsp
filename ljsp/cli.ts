import { readFileSync } from 'fs';

import { fromString } from './input-stream';
import { tokenize } from './lexer';
import { parse } from './parser';

function main() {
  const fileName = process.argv[2];
  if (!fileName) {
    console.log('Error - no file passed')
  }
  console.log(`parsing "${fileName}"`);

  const text = readFileSync(fileName, 'utf8');
  const inputStream = fromString(text);
  const tokens = tokenize(inputStream);
  const ast = parse(tokens);
  console.log('ast', ast);
}

main();
