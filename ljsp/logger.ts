import { InputStream } from './input-stream';

enum LogLevel {
  Error = 'ERROR',
  Info = 'INFO',
  Debug = 'DEBUG',
}

function describeStream(inputStream: InputStream | undefined) {
  if (!inputStream) return '';
  const { column, line } = inputStream;
  return ` - ${line}:${column}`;
}

function formatMessage(
  logLevel: LogLevel,
  message: string,
  inputStream?: InputStream
): string {
  const streamDescription = describeStream(inputStream);
  return `[${logLevel}]${streamDescription} - ${message}`;
}

export function info(message: string, inputStream?: InputStream): void {
  console.log(formatMessage(LogLevel.Info, message, inputStream));
}

export function debug(message: string, inputStream?: InputStream): void {
  console.log(formatMessage(LogLevel.Debug, message, inputStream));
}

export function error(message: string, inputStream?: InputStream): void {
  console.log(formatMessage(LogLevel.Error, message, inputStream));
}

export function fatalError(message: string, inputStream?: InputStream): void {
  error(message, inputStream);
  process.exit(1);
}

export function syntaxError(message: string, inputStream?: InputStream): void {
  fatalError(`Syntax Error - ${message}`, inputStream);
}
