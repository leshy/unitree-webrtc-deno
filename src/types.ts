export type Either<A, B> =
    | (A & Partial<Record<keyof B, never>>)
    | (B & Partial<Record<keyof A, never>>)
