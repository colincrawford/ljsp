import { InputStream } from './input-stream';

export function info(inputStream: InputStream, message: string): void {
  const { column, line } = inputStream;
  console.log(`[INFO] - ${line}:${column} - ${message}`);
}

export function debug(inputStream: InputStream, message: string): void {
  const { column, line } = inputStream;
  console.log(`[DEBUG] - ${line}:${column} - ${message}`);
}

export function error(inputStream: InputStream, message: string): void {
  const { column, line } = inputStream;
  console.log(`[ERROR] - ${line}:${column} - ${message}`);
}

export function fatalError(inputStream: InputStream, message: string): void {
  error(inputStream, message);
  process.exit(1);
}

export function syntaxError(inputStream: InputStream, message: string): void {
  fatalError(inputStream, `Syntax Error - ${message}`);
}
