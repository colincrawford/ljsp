import { Token } from './tokens';

export interface AST {}

export interface Form {}

export function parse(tokens: Token[]): AST {
  const forms = groupForms(tokens);
  const ast = forms.map(parseForm);
  return ast;
}

export function groupForms(tokens: Token[]): Form[] {
  return [];
}

export function parseForm(): AST {
  return {};
}
