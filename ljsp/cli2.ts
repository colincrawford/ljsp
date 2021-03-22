import { fromString } from './input-stream';
import { tokenize } from './lexer';
import { parseForm } from './parser';

const str = `("hi" 101_000 hi)`;
console.log(str);
const txt = fromString(str);

const tokens = tokenize(txt);
console.log(tokens);
console.log('\n');
console.log(parseForm(tokens));
