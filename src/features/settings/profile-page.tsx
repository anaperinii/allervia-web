import userAvatar from '@/assets/user-avatar.jpg'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { profileSchema, type ProfileForm } from '@/features/settings/schemas/profile'
import { PROFESSION_LABELS, ROLE_BADGES } from '@/features/settings/constants/team-roles'
import { Button, FieldLabel, Modal, ReadOnlyField, TextInput } from '@/shared/components'
import { queryKeys } from '@/shared/api/query-keys'
import { ApiError } from '@/shared/api/contracts/errors'
import { readOwnProfile, updateOwnProfile } from '@/shared/api/team.api'
import { useSession } from '@/shared/auth/useSession'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { faCamera, faFloppyDisk, faUserGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export function ProfilePage() {
  const { account, refresh } = useSession()
  const queryClient = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  const profileQuery = useQuery({
    queryKey: queryKeys.professionalProfile(),
    queryFn: ({ signal }) => readOwnProfile(signal),
  })

  const profile = profileQuery.data

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.fullName ?? '',
      phone: profile?.phoneNumber ?? '',
      councilNumber: profile?.councilNumber ?? '',
      councilUf: profile?.councilUf ?? '',
    },
  })

  const watched = useWatch({ control }) as ProfileForm

  const saveMutation = useMutation({
    mutationFn: (values: ProfileForm) =>
      updateOwnProfile({
        fullName: values.name,
        phoneNumber: values.phone,
        councilNumber: values.councilNumber || undefined,
        councilUf: values.councilUf || undefined,
      }),
    onSuccess: async () => {
      setShowSaveModal(false)
      setEditing(false)
      setFailure(null)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.professionalProfile(),
      })
      await refresh()
    },
    onError: (error) => {
      setShowSaveModal(false)
      setFailure(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar o perfil.',
      )
    },
  })

  const handleCancel = () => {
    reset()
    setFailure(null)
    setEditing(false)
  }

  if (profileQuery.isPending) {
    return (
      <SettingsLayout subtitle="Meu Perfil">
        <p className="p-6 text-xs text-(--text-muted)">Carregando perfil…</p>
      </SettingsLayout>
    )
  }

  if (profileQuery.error || !profile) {
    return (
      <SettingsLayout subtitle="Meu Perfil">
        <p className="p-6 text-xs text-(--text-muted)" role="alert">
          {profileQuery.error instanceof ApiError
            ? profileQuery.error.message
            : 'Não foi possível carregar o seu perfil.'}
        </p>
      </SettingsLayout>
    )
  }

  const roles = account?.roles ?? []

  return (
    <SettingsLayout subtitle="Meu Perfil">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="flex items-center justify-between gap-5 lg:col-span-2">
              <div className="flex items-center gap-5 min-w-0">
                <div className="relative shrink-0">
                  <img src={userAvatar} alt="" className="h-20 w-20 rounded-full object-cover border border-(--border-custom)" />
                  {editing && (
                    <button
                      type="button"
                      aria-label="Alterar foto"
                      className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-(--border-custom) shadow-sm hover:bg-brand-50 transition-all cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faCamera} className="text-brand" style={{ fontSize: 13 }} />
                    </button>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-(--text)">{watched.name}</div>
                  <div className="text-xs text-(--text-muted)">
                    {PROFESSION_LABELS[profile.profession]}
                  </div>
                  <div className="text-xs text-(--text-muted) mt-0.5">
                    {account?.organization?.name ?? ''}
                  </div>
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
                      leftIcon={<FontAwesomeIcon icon={faFloppyDisk} style={{ fontSize: 13 }} />}
                      onClick={handleSubmit(() => setShowSaveModal(true))}
                      className="px-3"
                    >
                      Salvar alterações
                    </Button>
                  </>
                )}
              </div>
            </div>

            {failure && (
              <p className="lg:col-span-2 text-xs text-red-600" role="alert">
                {failure}
              </p>
            )}

            <section className="border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados Pessoais</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <FieldLabel label="Nome completo" error={errors.name?.message}>
                  {editing
                    ? <TextInput invalid={!!errors.name} {...register('name')} />
                    : <ReadOnlyField>{watched.name}</ReadOnlyField>}
                </FieldLabel>
                <FieldLabel label="Telefone" error={errors.phone?.message}>
                  {editing
                    ? <TextInput invalid={!!errors.phone} {...register('phone')} />
                    : <ReadOnlyField>{watched.phone}</ReadOnlyField>}
                </FieldLabel>
              </div>
              <div className="px-4 pb-4 text-[0.65rem] leading-relaxed text-(--text-muted)">
                CPF e data de nascimento ainda não têm campo no servidor; por
                isso não aparecem aqui em vez de exibirem um valor inventado.
              </div>
            </section>

            <section className="border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados Profissionais</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <FieldLabel label="E-mail">
                  <ReadOnlyField>{account?.user.email ?? ''}</ReadOnlyField>
                </FieldLabel>
                <FieldLabel label="Profissão">
                  <ReadOnlyField>{PROFESSION_LABELS[profile.profession]}</ReadOnlyField>
                </FieldLabel>
                <FieldLabel label="Conselho" error={errors.councilNumber?.message}>
                  {editing
                    ? <TextInput invalid={!!errors.councilNumber} {...register('councilNumber')} />
                    : <ReadOnlyField>{watched.councilNumber || '—'}</ReadOnlyField>}
                </FieldLabel>
                <FieldLabel label="UF do conselho" error={errors.councilUf?.message}>
                  {editing
                    ? <TextInput invalid={!!errors.councilUf} maxLength={2} {...register('councilUf')} />
                    : <ReadOnlyField>{watched.councilUf || '—'}</ReadOnlyField>}
                </FieldLabel>
              </div>
              <div className="px-4 pb-4 text-[0.65rem] leading-relaxed text-(--text-muted)">
                E-mail e profissão são mantidos por contratos próprios: o
                primeiro exige verificação do novo endereço, a segunda é
                atualizada pela administração.
              </div>
            </section>

            <section className="lg:col-span-2 border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50 flex items-center gap-2">
                <FontAwesomeIcon icon={faUserGear} className="text-(--text-muted)" style={{ fontSize: 14 }} />
                <h2 className="text-xs font-bold text-(--text)">Acesso e papéis</h2>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full border border-(--border-custom) bg-white px-3 py-1 text-[0.7rem] font-semibold text-(--text)"
                      >
                        {ROLE_BADGES[role].label}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-(--text-muted)">
                      Nenhum papel atribuído nesta organização.
                    </span>
                  )}
                </div>
                <p className="text-[0.7rem] leading-relaxed text-(--text-muted)">
                  Os papéis são concedidos pela administração da organização e
                  valem para todas as suas sessões. Cada ação continua sendo
                  autorizada pelo servidor no momento em que é executada.
                </p>
              </div>
            </section>
        </div>
      </form>

      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        size="sm"
        title="Salvar alterações"
        icon={<FontAwesomeIcon icon={faFloppyDisk} style={{ fontSize: 16 }} />}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>Cancelar</Button>
            <Button
              tone="brand"
              variant="solid"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate(getValues())}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted)">
          As alterações do seu cadastro profissional serão salvas no servidor.
        </p>
      </Modal>
    </SettingsLayout>
  )
}
