import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Save } from 'lucide-react'
import {
  Button,
  FieldLabel,
  Modal,
  ReadOnlyField,
  TextInput,
} from '@/shared/components'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { PatientInitials } from '@/shared/components/glass-card'
import { useUserStore } from '@/shared/stores/useUserStore'
import { profileSchema, type ProfileForm } from '@/features/settings/schemas/profile'

const formatBirthDate = (iso: string) => {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export function ProfilePage() {
  const currentUser = useUserStore((s) => s.current)
  const updateCurrentProfile = useUserStore((s) => s.updateCurrentProfile)

  const [editing, setEditing] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      specialty: currentUser.specialty,
      institution: currentUser.institution,
      birthDate: currentUser.birthDate,
    },
  })

  const watched = watch()

  const handleCancel = () => {
    reset({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      specialty: currentUser.specialty,
      institution: currentUser.institution,
      birthDate: currentUser.birthDate,
    })
    setEditing(false)
  }

  const handleConfirmSave = () => {
    updateCurrentProfile(getValues())
    setShowSaveModal(false)
    setEditing(false)
  }

  return (
    <SettingsLayout subtitle="Meu Perfil">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-5 min-w-0">
                <div className="relative shrink-0">
                  <PatientInitials name={watched.name} size={80} />
                  {editing && (
                    <button
                      type="button"
                      aria-label="Alterar foto"
                      className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-(--border-custom) shadow-sm hover:bg-brand-50 transition-all cursor-pointer"
                    >
                      <Camera size={13} className="text-brand" />
                    </button>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-(--text)">{watched.name}</div>
                  <div className="text-xs text-(--text-muted)">{watched.specialty}</div>
                  <div className="text-xs text-(--text-muted) mt-0.5">{watched.institution}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!editing ? (
                  <Button tone="brand" variant="solid" prominent onClick={() => setEditing(true)} className="px-3">
                    Editar perfil
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCancel} className="px-3">Cancelar</Button>
                    <Button
                      tone="brand"
                      variant="solid"
                      prominent
                      leftIcon={<Save size={13} />}
                      onClick={handleSubmit(() => setShowSaveModal(true))}
                      className="px-3"
                    >
                      Salvar alterações
                    </Button>
                  </>
                )}
              </div>
            </div>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados Pessoais</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <FieldLabel label="Nome completo" error={errors.name?.message}>
                  {editing
                    ? <TextInput invalid={!!errors.name} {...register('name')} />
                    : <ReadOnlyField>{watched.name}</ReadOnlyField>}
                </FieldLabel>
                <FieldLabel label="CPF">
                  <ReadOnlyField>{currentUser.cpf}</ReadOnlyField>
                </FieldLabel>
                <FieldLabel label="Data de nascimento" error={errors.birthDate?.message}>
                  {editing
                    ? <TextInput type="date" invalid={!!errors.birthDate} {...register('birthDate')} />
                    : <ReadOnlyField>{formatBirthDate(watched.birthDate)}</ReadOnlyField>}
                </FieldLabel>
                <FieldLabel label="Telefone" error={errors.phone?.message}>
                  {editing
                    ? <TextInput invalid={!!errors.phone} {...register('phone')} />
                    : <ReadOnlyField>{watched.phone}</ReadOnlyField>}
                </FieldLabel>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados Profissionais</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <FieldLabel label="E-mail" error={errors.email?.message}>
                  {editing
                    ? <TextInput type="email" invalid={!!errors.email} {...register('email')} />
                    : <ReadOnlyField>{watched.email}</ReadOnlyField>}
                </FieldLabel>
                <FieldLabel label="CRM">
                  <ReadOnlyField>{currentUser.registration}</ReadOnlyField>
                </FieldLabel>
                <FieldLabel label="Especialidade" error={errors.specialty?.message}>
                  {editing
                    ? <TextInput invalid={!!errors.specialty} {...register('specialty')} />
                    : <ReadOnlyField>{watched.specialty}</ReadOnlyField>}
                </FieldLabel>
                <FieldLabel label="Instituição" error={errors.institution?.message}>
                  {editing
                    ? <TextInput invalid={!!errors.institution} {...register('institution')} />
                    : <ReadOnlyField>{watched.institution}</ReadOnlyField>}
                </FieldLabel>
              </div>
          </section>
        </div>
      </form>

      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        size="sm"
        title="Salvar alterações"
        icon={<Save size={16} />}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>Cancelar</Button>
            <Button tone="brand" variant="solid" onClick={handleConfirmSave}>Confirmar</Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted)">As alterações no seu perfil serão salvas e aplicadas imediatamente.</p>
      </Modal>
    </SettingsLayout>
  )
}
