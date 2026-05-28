import { format } from 'date-fns'
import {
  ADJUSTMENT_TYPE_LABELS,
  INACTIVATION_CATEGORY_LABELS,
} from '@/features/patient/constants/clinical-labels'
import type { ReportData } from './types'
import { downloadFile } from './utils'

// ─── Helpers para XLSX (Office Open XML) ─────────────────────────────────────
// Gera um .xlsx real usando a estrutura ZIP-based do OOXML sem dependências extras.
// Cada célula é tipada como string (t="s" via inline string ou t="str").

function escapeXml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // Remove caracteres de controle inválidos em XML 1.0
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
}

function colName(n: number): string {
  let name = ''
  let col = n + 1
  while (col > 0) {
    const rem = (col - 1) % 26
    name = String.fromCharCode(65 + rem) + name
    col = Math.floor((col - 1) / 26)
  }
  return name
}

type Row = (string | number | null)[]

function buildSheetXml(rows: Row[]): string {
  const rowsXml = rows
    .map((row, ri) => {
      const cells = row
        .map((val, ci) => {
          const ref = `${colName(ci)}${ri + 1}`
          if (val === null || val === undefined || val === '') {
            return `<c r="${ref}"/>`
          }
          if (typeof val === 'number') {
            return `<c r="${ref}" t="n"><v>${val}</v></c>`
          }
          const safe = escapeXml(String(val))
          return `<c r="${ref}" t="inlineStr"><is><t>${safe}</t></is></c>`
        })
        .join('')
      return `<row r="${ri + 1}">${cells}</row>`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowsXml}</sheetData>
</worksheet>`
}

// Construção do ZIP mínimo em memória usando apenas Uint8Array e DataView.
// Implementação de ZIP Store (sem compressão, método 0) — suficiente para XLSX.

function strToBytes(s: string): Uint8Array {
  const enc = new TextEncoder()
  return enc.encode(s)
}

function u32le(n: number): number[] {
  return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff]
}

function u16le(n: number): number[] {
  return [n & 0xff, (n >> 8) & 0xff]
}

function crc32(data: Uint8Array): number {
  const table: number[] = []
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

interface ZipEntry {
  name: string
  data: Uint8Array
  crc: number
  offset: number
}

function buildZip(files: { name: string; content: string }[]): Blob {
  const entries: ZipEntry[] = []
  const chunks: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const nameBytes = strToBytes(file.name)
    const data = strToBytes(file.content)
    const crc = crc32(data)
    const size = data.length

    // Local file header
    const lfh: number[] = [
      0x50, 0x4b, 0x03, 0x04, // signature
      0x14, 0x00,             // version needed
      0x00, 0x00,             // general flags
      0x00, 0x00,             // compression (Store)
      0x00, 0x00,             // mod time
      0x00, 0x00,             // mod date
      ...u32le(crc),
      ...u32le(size),
      ...u32le(size),
      ...u16le(nameBytes.length),
      0x00, 0x00,             // extra field length
    ]

    const header = new Uint8Array([...lfh, ...nameBytes])
    chunks.push(header)
    chunks.push(data)
    entries.push({ name: file.name, data, crc, offset })
    offset += header.length + size
  }

  // Central directory
  const cdChunks: Uint8Array[] = []
  let cdSize = 0
  const cdOffset = offset

  for (const entry of entries) {
    const nameBytes = strToBytes(entry.name)
    const cde: number[] = [
      0x50, 0x4b, 0x01, 0x02, // signature
      0x14, 0x00,             // version made by
      0x14, 0x00,             // version needed
      0x00, 0x00,             // general flags
      0x00, 0x00,             // compression (Store)
      0x00, 0x00,             // mod time
      0x00, 0x00,             // mod date
      ...u32le(entry.crc),
      ...u32le(entry.data.length),
      ...u32le(entry.data.length),
      ...u16le(nameBytes.length),
      0x00, 0x00,             // extra
      0x00, 0x00,             // comment
      0x00, 0x00,             // disk start
      0x00, 0x00,             // int attrs
      0x00, 0x00, 0x00, 0x00, // ext attrs
      ...u32le(entry.offset),
    ]
    const cdeBytes = new Uint8Array([...cde, ...nameBytes])
    cdChunks.push(cdeBytes)
    cdSize += cdeBytes.length
  }

  // End of central directory
  const eocd: number[] = [
    0x50, 0x4b, 0x05, 0x06,
    0x00, 0x00,
    0x00, 0x00,
    ...u16le(entries.length),
    ...u16le(entries.length),
    ...u32le(cdSize),
    ...u32le(cdOffset),
    0x00, 0x00,
  ]

  const allChunks = [...chunks, ...cdChunks, new Uint8Array(eocd)]
  const totalSize = allChunks.reduce((s, c) => s + c.length, 0)
  const result = new Uint8Array(totalSize)
  let pos = 0
  for (const c of allChunks) { result.set(c, pos); pos += c.length }
  return new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

// ─── Exportação ──────────────────────────────────────────────────────────────

export function exportExcel(data: ReportData) {
  const { patient, realizedApps, sections } = data
  const rows: Row[] = []

  const header = (label: string) => rows.push([label])
  const blank = () => rows.push([null])
  const pair = (k: string, v: string) => rows.push([k, v])
  const tableRow = (...cols: string[]) => rows.push(cols)

  rows.push([`Relatório Clínico — ${patient.name}`])
  rows.push([`Gerado em: ${data.generatedAt}${data.anonymized ? ' · Dados anonimizados' : ''}`])
  blank()

  if (sections.includes('personal')) {
    header('=== DADOS PESSOAIS ===')
    pair('Nome', patient.name)
    pair('CPF', patient.cpf)
    pair('Data de Nascimento', patient.birthDate)
    pair('Idade', `${patient.age} anos`)
    pair('Telefone', patient.phone)
    pair('Peso', patient.weight)
    pair('Médico Responsável', patient.responsibleDoctor)
    blank()
  }

  if (sections.includes('immunotherapy')) {
    header('=== DADOS DA IMUNOTERAPIA ===')
    pair('Tipo', patient.immunotherapyType)
    pair('Via', patient.administrationRoute)
    pair('Extrato', patient.extract)
    pair('Início Indução', patient.inductionStart)
    pair('Meta', patient.targetConcentrationVolume)
    pair('Dose Atual', patient.currentDoseConcentration)
    pair('Intervalo', `${patient.currentInterval} dias`)
    blank()
  }

  if (sections.includes('applications')) {
    header(`=== HISTÓRICO DE APLICAÇÕES (${realizedApps.length}) ===`)
    tableRow('Data', 'Dose', 'Intervalo (dias)', 'Reação', 'Responsável')
    realizedApps.forEach((a) =>
      tableRow(a.date, a.dose, String(a.cycle.days), a.sideEffect === 'yes' ? 'Sim' : 'Não', a.administrator ?? '-'),
    )
    blank()
  }

  if (sections.includes('reactions')) {
    const reactions = realizedApps.filter((a) => a.sideEffect === 'yes')
    header(`=== REAÇÕES ADVERSAS (${reactions.length}) ===`)
    tableRow('Data', 'Dose', 'Medicação', 'Observação')
    reactions.forEach((a) =>
      tableRow(
        a.date,
        a.dose,
        a.medicationNeeded === 'yes' ? 'Sim' : 'Não',
        a.administratorNote ?? '',
      ),
    )
    blank()
  }

  if (sections.includes('adjustments') && patient.protocolAdjustments?.length) {
    header(`=== AJUSTES DE PROTOCOLO (${patient.protocolAdjustments.length}) ===`)
    tableRow('Data', 'Tipo', 'Conc. Anterior', 'Conc. Nova', 'Intervalo Ant. (dias)', 'Intervalo Novo (dias)', 'Justificativa', 'Responsável')
    patient.protocolAdjustments.forEach((adj) =>
      tableRow(
        adj.date,
        ADJUSTMENT_TYPE_LABELS[adj.type],
        adj.previousConcentration,
        adj.newConcentration,
        String(adj.previousInterval),
        String(adj.newInterval),
        adj.justification,
        adj.responsibleDoctor,
      ),
    )
    blank()
  }

  if (sections.includes('inactivations') && patient.inactivations?.length) {
    header(`=== HISTÓRICO DE INATIVAÇÕES (${patient.inactivations.length}) ===`)
    tableRow('Início', 'Categoria', 'Motivo', 'Retorno Previsto', 'Conc. na Pausa', 'Intervalo na Pausa', 'Responsável', 'Reativação', 'Conc. Retomada', 'Intervalo Retomado', 'Justificativa Retomada')
    patient.inactivations.forEach((inact) =>
      tableRow(
        inact.startDate,
        INACTIVATION_CATEGORY_LABELS[inact.category],
        inact.detail,
        inact.expectedReturnDate ?? '',
        inact.snapshotConcentration,
        String(inact.snapshotInterval),
        inact.responsibleDoctor,
        inact.reactivatedAt ?? '',
        inact.reactivateConcentration ?? '',
        inact.reactivateInterval != null ? String(inact.reactivateInterval) : '',
        inact.reactivateJustification ?? '',
      ),
    )
    blank()
  }

  if (sections.includes('progress')) {
    header('=== PROGRESSÃO DO PROTOCOLO ===')
    pair('Aplicações realizadas', String(realizedApps.length))
    pair('Concentração atual', patient.currentDoseConcentration.split(' - ')[0])
    pair('Intervalo', `${patient.currentInterval} dias`)
    blank()
  }

  const sheetXml = buildSheetXml(rows)
  const filename = `relatorio_${patient.name.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`

  const blob = buildZip([
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Relatório" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      content: sheetXml,
    },
  ])

  downloadFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}
