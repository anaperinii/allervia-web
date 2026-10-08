import { Button, FieldLabel, Select, Switch, TextInput } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import type { ProtocolStep } from '@/shared/api/contracts/protocols'

interface LabControlsProps {
  steps: ProtocolStep[]
  startStepId: string
  onStartStepChange: (stepId: string) => void
  startDate: string
  onStartDateChange: (value: string) => void
  showDates: boolean
  onShowDatesChange: (value: boolean) => void
  canValidate: boolean
  onValidate: () => void
  validating: boolean
  validationSummary: { text: string; tone: 'ok' | 'bad' } | null
}

export function LabControls({
  steps,
  startStepId,
  onStartStepChange,
  startDate,
  onStartDateChange,
  showDates,
  onShowDatesChange,
  canValidate,
  onValidate,
  validating,
  validationSummary,
}: LabControlsProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-(--border-custom) bg-[#F6F8F8]">
      <header className="border-b border-(--border-custom) bg-gray-50/50 px-4 py-3">
        <h2 className="text-xs font-bold text-(--text)">
          Parâmetros da simulação
        </h2>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-xl border border-(--border-custom) bg-white p-3">
          <Button
            tone="brand"
            variant="solid"
            size="sm"
            fullWidth
            prominent
            disabled={validating || !canValidate}
            onClick={onValidate}
          >
            {validating ? 'Conferindo…' : 'Conferir com o motor'}
          </Button>
          {validationSummary ? (
            <p
              className={cn(
                'mt-2 text-[0.6rem] font-semibold',
                validationSummary.tone === 'ok'
                  ? 'text-emerald-700'
                  : 'text-red-700',
              )}
            >
              {validationSummary.text}
            </p>
          ) : (
            <p className="mt-2 text-[0.6rem] leading-relaxed text-(--text-muted)">
              Verifica se a dose que o sistema vai recomendar ao paciente, na
              hora da aplicação, é a mesma que este mapa mostra. Vale conferir
              antes de publicar a versão.
            </p>
          )}
        </div>

        <FieldLabel label="Etapa inicial">
          <Select
            value={startStepId}
            onChange={(e) => onStartStepChange(e.target.value)}
          >
            {steps.map((step) => (
              <option key={step.id} value={step.id}>
                {step.label}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-[0.6rem] leading-relaxed text-(--text-muted)">
            Reproduz o paciente que entra no meio da indução ou já está em
            manutenção.
          </p>
        </FieldLabel>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[0.7rem] font-semibold text-(--text)">
              Datas de calendário
            </div>
            <div className="text-[0.6rem] text-(--text-muted)">
              No lugar de dias acumulados
            </div>
          </div>
          <Switch
            checked={showDates}
            onChange={onShowDatesChange}
            aria-label="Mostrar datas de calendário"
          />
        </div>

        {showDates && (
          <FieldLabel label="Data da primeira aplicação">
            <TextInput
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </FieldLabel>
        )}
      </div>
    </div>
  )
}
