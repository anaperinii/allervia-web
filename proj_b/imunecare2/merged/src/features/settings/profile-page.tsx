import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Camera, Save } from 'lucide-react'
import {
  Button,
  FieldLabel,
  IconButton,
  Modal,
  ReadOnlyField,
  TextInput,
} from '@/shared/components'
import { useUserStore } from '@/shared/identity/user-store'
import { profileSchema, type ProfileForm } from '@/features/settings/forms/profile'
import { minDateStr } from '@/shared/lib/dates'
import { useDateBounds } from '@/shared/hooks/use-date-bounds'

const formatBirthDate = (iso: string) => {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export function ProfilePage() {
  useDateBounds() // keeps date inputs updated on year change
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

  const avatarInitials = watched.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconButton aria-label="Voltar" to="/settings"><ArrowLeft size={16} /></IconButton>
            <h1 className="text-2xl font-bold text-(--text)">Meu Perfil</h1>
          </div>
          {!editing ? (
            <Button tone="brand" variant="solid" prominent onClick={() => setEditing(true)} className="px-3">
              Editar perfil
            </Button>
          ) : (
            <div className="flex items-center gap-2">
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
            </div>
          )}
        </div>

        <form className="flex-1 overflow-y-auto p-5" onSubmit={(e) => e.preventDefault()}>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-brand to-teal-400 text-2xl font-bold text-white">
                  {avatarInitials}
                </div>
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
              <div>
                <div className="text-lg font-bold text-(--text)">{watched.name}</div>
                <div className="text-xs text-(--text-muted)">{watched.specialty}</div>
                <div className="text-xs text-(--text-muted) mt-0.5">{watched.institution}</div>
              </div>
            </div>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados Pessoais</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <FieldLabel label="Nome completo" required error={errors.name?.message}>
                  {editing
                    ? <TextInput invalid={!!errors.name} {...register('name')} />
                    : <ReadOnlyField>{watched.name}</ReadOnlyField>}
                </FieldLabel>
                <FieldLabel label="CPF">
                  <ReadOnlyField>{currentUser.cpf}</ReadOnlyField>
                </FieldLabel>
                <FieldLabel label="Data de nascimento" required error={errors.birthDate?.message}>
                  {editing
                    ? <TextInput type="date" min={minDateStr()} max={todayStr()} invalid={!!errors.birthDate} {...register('birthDate')} />
                    : <ReadOnlyField>{formatBirthDate(watched.birthDate)}</ReadOnlyField>}
                </FieldLabel>
                <FieldLabel label="Telefone" required error={errors.phone?.message}>
                  {editing
                    ? <TextInput invalid={!!errors.phone} {...register('phone')} />
                    : <ReadOnlyField>{watched.phone}</ReadOnlyField>}
                </FieldLabel>
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados Profissionais</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <FieldLabel label="E-mail" required error={errors.email?.message}>
                  {editing
                    ? <TextInput type="email" invalid={!!errors.email} {...register('email')} />
                    : <ReadOnlyField>{watched.email}</ReadOnlyField>}
                </FieldLabel>
                <FieldLabel label="CRM">
                  <ReadOnlyField>{currentUser.registration}</ReadOnlyField>
                </FieldLabel>
                <FieldLabel label="Especialidade" required error={errors.specialty?.message}>
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
      </div>

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
    </div>
  )
}
