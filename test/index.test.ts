import {describe, it, expect} from 'bun:test'
import {servelat} from '../src'

describe('should', () => {
  it('export servelat', () => {
    expect(servelat).toBe('servelat');
  })
});
