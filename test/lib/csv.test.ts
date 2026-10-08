import { describe, expect, it } from 'vitest'
import { csvCell, csvLine } from '@/shared/lib/csv'

describe('células CSV seguras', () => {
  it('escapa aspas e preserva texto comum', () => {
    expect(csvCell('Paula "Andrade"')).toBe('"Paula ""Andrade"""')
    expect(csvCell(0.2)).toBe('"0.2"')
    expect(csvCell(null)).toBe('""')
  })

  it('neutraliza valores que planilhas interpretariam como fórmula', () => {
    expect(csvCell('=SUM(A1:A9)')).toBe('"\'=SUM(A1:A9)"')
    expect(csvCell('+55 62 99999')).toBe('"\'+55 62 99999"')
    expect(csvCell('-1:1000')).toBe('"\'-1:1000"')
    expect(csvCell('@import')).toBe('"\'@import"')
  })

  it('monta linhas com vírgula sem quebrar campos internos', () => {
    expect(csvLine(['a,b', 'c'])).toBe('"a,b","c"')
  })
})
