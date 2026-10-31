import { Button, FieldLabel, Modal, PasswordInput, TextInput } from '@/shared/components'
import {
  reauthenticateIcon,
  useReauthenticateForm,
  type ReauthenticateForm,
} from '@/features/settings/components/use-reauthenticate-form'

interface ReauthenticateModalProps {
  open: boolean
  requireCode: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ReauthenticateFields({
  form,
  requireCode,
}: {
  form: ReauthenticateForm
  requireCode: boolean
}) {
  return (
    <>
      <p className="text-xs text-(--text-muted)">
        Esta ação é sensível e exige que você confirme sua identidade novamente.
      </p>
      <FieldLabel label="Senha">
        <PasswordInput
          placeholder="Insira aqui"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => form.setPassword(e.target.value)}
        />
      </FieldLabel>
      {requireCode && (
        <FieldLabel label="Código do autenticador ou de recuperação">
          <TextInput
            placeholder="000000"
            autoComplete="one-time-code"
            maxLength={32}
            value={form.code}
            onChange={(e) => form.setCode(e.target.value)}
          />
        </FieldLabel>
      )}
      {form.error && (
        <p className="text-xs text-red-500" role="alert">
          {form.error}
        </p>
      )}
    </>
  )
}

function ReauthenticateFormModal({
  open,
  requireCode,
  onClose,
  onSuccess,
}: ReauthenticateModalProps) {
  const form = useReauthenticateForm({ requireCode, onSuccess })

  return (
    <Modal
      open={open}
      pending={form.submitting}
      onClose={onClose}
      size="sm"
      title="Confirme sua identidade"
      icon={reauthenticateIcon}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={form.submitting}>
            Cancelar
          </Button>
          <Button
            tone="brand"
            variant="solid"
            onClick={() => void form.submit()}
            disabled={form.submitting || form.incomplete}
          >
            Confirmar
          </Button>
        </>
      }
    >
      <ReauthenticateFields form={form} requireCode={requireCode} />
    </Modal>
  )
}

export function ReauthenticateModal(props: ReauthenticateModalProps) {
  return props.open ? <ReauthenticateFormModal {...props} /> : null
}
