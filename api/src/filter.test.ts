import { describe, expect, it } from 'vitest'
import { isFiltered } from './filter'

describe('profanity filter', () => {
  it('matches blocked words case-insensitively', () => {
    expect(isFiltered('This has BAD content', ['bad'])).toBe(true)
  })

  it('does not match safe text', () => {
    expect(isFiltered('all clear here', ['bad'])).toBe(false)
  })
})
