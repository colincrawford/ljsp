import { Token, TokenType } from './tokens';
import { fatalError, debug } from './logger';

export interface FunctionCallNode {
  fnName: string;
  args: ASTNode[];
}

export enum ExpressionLiteral {
  Number = 'Number',
  String = 'String',
  Symbol = 'Symbol',
}

export interface ExpressionLiteralNode {
  type: ExpressionLiteral;
  value: any;
};

export type ASTNode = FunctionCallNode | ExpressionLiteralNode;

export type AST = ASTNode[];

export type Form = Token[];

export function parse(tokens: Token[]): AST {
  const forms = groupForms(tokens);
  const ast = forms.map(parseForm);
  return ast;
}

export function groupForms(tokens: Token[]): Form[] {
  const groups: Token[][] = [];
  let currentGroup: Token[] = [];
  let parenBalance = 0;
  tokens.forEach(token => {
    currentGroup.push(token);
    if (token.type === TokenType.OpenParen) {
      parenBalance++;
    }

    if (token.type === TokenType.CloseParen) {
      parenBalance--;
    }

    if (parenBalance === 0) {
      groups.push(currentGroup);
      currentGroup = [];
    }
  });

  return groups;
}

export function parseForm(form: Form): ASTNode {
  if (form[0].type === TokenType.OpenParen) {
    return parseFunctionCall(form)
  }
  return parseExpressionLiteral(form);
}

function parseFunctionCall(form: Form): ASTNode {
  console.log('form', form);
  const [name, ...args] = form.slice(1, form.length - 1);
  const node = Object.freeze({
    fnName: `${name.token}`,
    args: groupForms(args).map(parseForm)
  });
  console.log('node', node);
  return node;
}

function parseExpressionLiteral(form: Form): ASTNode {
  const token = form[0];
  if (form.length > 1) {
    fatalError(`invalid form "${form}"`);
    throw new Error();
  }
  return Object.freeze({
    type: token.type as unknown as ExpressionLiteral,
    value: token.token,
  });
}
