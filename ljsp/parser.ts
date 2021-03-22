import { Token, TokenType } from './tokens';
import { fatalError, debug } from './logger';

export enum NodeType {
  FunctionCall = 'FunctionCall',
  ExpressionLiteral = 'ExpressionLiteral',
}

export interface FunctionCallNode {
  type: NodeType;
  fnName: string;
  args: ASTNode[];
}

function createFunctionCallNode(
  fnName: string,
  args: ASTNode[]
): FunctionCallNode {
  return Object.freeze({ fnName, args, type: NodeType.FunctionCall });
}

export enum ExpressionLiteral {
  Number = 'Number',
  String = 'String',
  Symbol = 'Symbol',
}

export interface ExpressionLiteralNode {
  type: NodeType;
  expressionType: ExpressionLiteral;
  value: string | number;
}

function createExpressionLiteralNode(
  expressionType: ExpressionLiteral,
  value: string | number
): ExpressionLiteralNode {
  return Object.freeze({
    expressionType,
    value,
    type: NodeType.ExpressionLiteral,
  });
}

export type ASTNode = FunctionCallNode | ExpressionLiteralNode;

export type AST = ASTNode[];

export type Form = Token[];

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

export function parse(form: Form): AST {
  const roots: AST = []
  
  return roots;
}

export function parseForm(form: Form): ASTNode {
  if (form[0].type === TokenType.OpenParen) {
    return parseFunctionCall(form);
  }
  return parseExpressionLiteral(form);
}

function parseFunctionCall(form: Form): ASTNode {
  console.log('form', form);
  const [name, ...args] = form.slice(1, form.length - 1);
  const node = createFunctionCallNode(
    `${name.token}`,
    groupForms(args).map(parseForm)
  );
  console.log('node', node);
  return node;
}

function parseExpressionLiteral(form: Form): ASTNode {
  const token = form[0];
  if (form.length > 1) {
    fatalError(`invalid form "${form}"`);
    throw new Error();
  }
  return createExpressionLiteralNode(
    (token.type as unknown) as ExpressionLiteral,
    token.token
  );
}
