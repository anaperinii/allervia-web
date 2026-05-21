import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import {
  ADJUSTMENT_TYPE_LABELS,
  INACTIVATION_CATEGORY_LABELS,
} from '@/features/patient/constants/clinical-labels'
import type { ReportData } from './types'

export function exportPdf(data: ReportData) {
  const { patient, realizedApps, sections, anonymized, reactionsCount } = data
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  let y = margin

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 20) {
      doc.addPage()
      y = margin
    }
  }

  doc.setFillColor(24, 193, 203)
  doc.rect(0, 0, pageW, 2, 'F')
  doc.setFontSize(16)
  doc.setTextColor(14, 153, 163)
  doc.setFont('helvetica', 'bold')
  doc.text(`Relatório Clínico`, margin, (y += 6))
  doc.setFontSize(13)
  doc.setTextColor(15, 32, 39)
  doc.text(patient.name, margin, (y += 7))
  if (anonymized) {
    doc.setFillColor(182, 242, 236)
    doc.setTextColor(14, 153, 163)
    doc.setFontSize(8)
    doc.roundedRect(margin, y + 1, 28, 5, 1.5, 1.5, 'F')
    doc.text('ANONIMIZADO', margin + 2, y + 4.5)
  }
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.text(`Gerado em ${data.generatedAt} · ImuneCare`, margin, (y += 10))
  doc.setDrawColor(226, 240, 239)
  doc.line(margin, (y += 3), pageW - margin, y)
  y += 6

  const addSectionTitle = (title: string) => {
    ensureSpace(10)
    doc.setFontSize(12)
    doc.setTextColor(14, 153, 163)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin, y)
    y += 2
    doc.setDrawColor(226, 240, 239)
    doc.line(margin, y, pageW - margin, y)
    y += 5
  }

  const addKV = (key: string, value: string) => {
    ensureSpace(6)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(`${key}:`, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 32, 39)
    doc.text(String(value), margin + 45, y)
    y += 5
  }

  const addWrappedParagraph = (text: string) => {
    const lines = doc.splitTextToSize(text, pageW - margin * 2)
    lines.forEach((line: string) => {
      ensureSpace(5)
      doc.text(line, margin, y)
      y += 4
    })
    y += 2
  }

  if (sections.includes('personal')) {
    addSectionTitle('Dados Pessoais')
    addKV('Nome', patient.name)
    addKV('CPF', patient.cpf)
    addKV('Data de Nascimento', patient.birthDate)
    addKV('Idade', `${patient.age} anos`)
    addKV('Telefone', patient.phone)
    addKV('Peso', patient.weight)
    addKV('Médico Responsável', patient.responsibleDoctor)
    y += 3
  }

  if (sections.includes('immunotherapy')) {
    addSectionTitle('Dados da Imunoterapia')
    addKV('Tipo', patient.immunotherapyType)
    addKV('Via de Administração', patient.administrationRoute)
    addKV('Extrato', patient.extract)
    addKV('Início Indução', patient.inductionStart)
    addKV('Meta', patient.targetConcentrationVolume)
    addKV('Dose Atual', patient.currentDoseConcentration)
    addKV('Intervalo', `${patient.currentInterval} dias`)
    y += 3
  }

  if (sections.includes('applications')) {
    addSectionTitle(`Histórico de Aplicações (${realizedApps.length})`)
    ensureSpace(8)
    doc.setFillColor(245, 250, 250)
    doc.rect(margin, y, pageW - margin * 2, 6, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('DATA', margin + 2, y + 4)
    doc.text('DOSE', margin + 35, y + 4)
    doc.text('INTERVALO', margin + 100, y + 4)
    doc.text('REAÇÃO', margin + 140, y + 4)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 32, 39)
    doc.setFontSize(9)
    realizedApps.forEach((a) => {
      ensureSpace(6)
      doc.text(a.date, margin + 2, y + 4)
      doc.text(a.dose, margin + 35, y + 4)
      doc.text(`${a.cycle.days} dias`, margin + 100, y + 4)
      doc.text(a.sideEffect === 'yes' ? 'Sim' : 'Não', margin + 140, y + 4)
      doc.setDrawColor(240, 240, 240)
      doc.line(margin, y + 6, pageW - margin, y + 6)
      y += 6
    })
    y += 3
  }

  if (sections.includes('reactions')) {
    addSectionTitle(`Reações Adversas (${reactionsCount})`)
    if (reactionsCount === 0) {
      ensureSpace(6)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100, 116, 139)
      doc.text('Nenhuma reação adversa registrada.', margin, y)
      y += 6
    } else {
      realizedApps.filter((a) => a.sideEffect === 'yes').forEach((a) => {
        ensureSpace(12)
        doc.setFillColor(255, 248, 235)
        doc.rect(margin, y, pageW - margin * 2, 10, 'F')
        doc.setDrawColor(245, 158, 11)
        doc.setLineWidth(0.8)
        doc.line(margin, y, margin, y + 10)
        doc.setLineWidth(0.2)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(180, 83, 9)
        doc.text(`${a.date} — ${a.dose}`, margin + 3, y + 4)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(a.medicationNeeded === 'yes' ? 'Com medicação' : 'Sem medicação', margin + 3, y + 8)
        y += 12
      })
    }
    y += 3
  }

  if (sections.includes('adjustments')) {
    const adjustments = patient.protocolAdjustments ?? []
    addSectionTitle(`Ajustes de Protocolo (${adjustments.length})`)
    if (adjustments.length === 0) {
      ensureSpace(6)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100, 116, 139)
      doc.text('Nenhum ajuste de protocolo registrado.', margin, y)
      y += 6
    } else {
      adjustments.forEach((adj) => {
        ensureSpace(20)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(180, 83, 9)
        doc.setFontSize(9)
        doc.text(`${adj.date} — ${ADJUSTMENT_TYPE_LABELS[adj.type]}`, margin, y)
        y += 4
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(15, 32, 39)
        doc.setFontSize(8)
        doc.text(`${adj.previousConcentration} → ${adj.newConcentration}  ·  ${adj.previousInterval}d → ${adj.newInterval}d`, margin, y)
        y += 4
        addWrappedParagraph(`Justificativa: ${adj.justification}`)
        doc.text(`Responsável: ${adj.responsibleDoctor}`, margin, y)
        y += 6
      })
    }
    y += 3
  }

  if (sections.includes('inactivations')) {
    const inactivations = patient.inactivations ?? []
    addSectionTitle(`Histórico de Inativações (${inactivations.length})`)
    if (inactivations.length === 0) {
      ensureSpace(6)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100, 116, 139)
      doc.text('Nenhuma inativação registrada.', margin, y)
      y += 6
    } else {
      inactivations.forEach((inact) => {
        ensureSpace(24)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(146, 64, 14)
        doc.text(`${inact.startDate} — ${INACTIVATION_CATEGORY_LABELS[inact.category]}`, margin, y)
        y += 4
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(15, 32, 39)
        addWrappedParagraph(inact.detail)
        if (inact.expectedReturnDate) {
          doc.text(`Retorno previsto: ${inact.expectedReturnDate}`, margin, y)
          y += 4
        }
        doc.text(`Concentração na pausa: ${inact.snapshotConcentration}  ·  Intervalo: ${inact.snapshotInterval}d`, margin, y)
        y += 4
        doc.text(`Responsável: ${inact.responsibleDoctor}`, margin, y)
        y += 4
        if (inact.reactivatedAt) {
          doc.setTextColor(5, 150, 105)
          doc.text(`Reativado em ${inact.reactivatedAt}`, margin, y)
          y += 4
          doc.setTextColor(15, 32, 39)
          if (inact.reactivateConcentration && inact.reactivateInterval != null) {
            doc.text(`Retomada: ${inact.reactivateConcentration}  ·  ${inact.reactivateInterval}d`, margin, y)
            y += 4
          }
          if (inact.reactivateJustification) {
            addWrappedParagraph(`Justificativa: ${inact.reactivateJustification}`)
          }
        }
        y += 4
      })
    }
    y += 3
  }

  if (sections.includes('progress')) {
    addSectionTitle('Progressão do Protocolo')
    ensureSpace(22)
    const boxW = (pageW - margin * 2 - 8) / 3
    const boxes: [string, string][] = [
      [String(realizedApps.length), 'Aplicações'],
      [patient.currentDoseConcentration.split(' - ')[0], 'Concentração atual'],
      [`${patient.currentInterval}d`, 'Intervalo'],
    ]
    boxes.forEach(([v, l], i) => {
      const x = margin + i * (boxW + 4)
      doc.setFillColor(245, 250, 250)
      doc.roundedRect(x, y, boxW, 18, 2, 2, 'F')
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(24, 193, 203)
      doc.text(v, x + boxW / 2, y + 9, { align: 'center' })
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(l, x + boxW / 2, y + 14, { align: 'center' })
    })
    y += 22
  }

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setDrawColor(226, 240, 239)
    doc.line(margin, pageH - 18, pageW - margin, pageH - 18)
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')
    const lgpdText = 'Documento protegido pela Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). A reprodução, compartilhamento ou armazenamento não autorizado é proibido.'
    const splitText = doc.splitTextToSize(lgpdText, pageW - margin * 2)
    doc.text(splitText, margin, pageH - 14)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(200, 200, 200)
    doc.text('CONFIDENCIAL', pageW / 2, pageH - 5, { align: 'center', charSpace: 2 })
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(`Página ${i} de ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' })
  }

  doc.save(`relatorio_${patient.name.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)
}
