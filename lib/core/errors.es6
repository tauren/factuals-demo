import ExtendableError from 'es6-error';

export class InvalidOperationError extends ExtendableError {}
export class ConcurrencyViolationError extends ExtendableError {}
export class InvalidDataAreaError extends ExtendableError {}
export class ReportNotFoundError extends ExtendableError {}
