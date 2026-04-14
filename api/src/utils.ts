import crypto from 'node:crypto'

export const id = (prefix: string): string => `${prefix}-${crypto.randomUUID().slice(0, 8)}`

export const now = (): number => Date.now()

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))
