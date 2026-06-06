export class ExhaustiveMatchError extends Error {
  readonly name = "ExhaustiveMatchError"

  constructor(readonly value: never) {
    super(`Unexpected variant: ${JSON.stringify(value)}`)
  }
}

export function assertNever(value: never): never {
  throw new ExhaustiveMatchError(value)
}
