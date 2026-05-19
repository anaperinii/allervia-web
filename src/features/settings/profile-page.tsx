import { useState } from 'react'
import {} from '@tanstack/react-router'
import { ArrowLeft, Camera, Save } from 'lucide-react'
import { Modal, Button, IconButton, TextInput } from "@/shared/components"

export function ProfilePage() {
  const [editing, setEditing] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  const [form, setForm] = useState({
    nome: 'Dr. Usuário',
    email: 'usuario@clinica.com',
    telefone: '(62) 99557-1423',
    crm: 'CRM/GO 12345',
    especialidade: 'Alergologia e Imunologia',
    instituicao: 'Clínica Integrada Princípios',
    dataNascimento: '1985-03-15',
    cpf: '711.905.744-89',
  })

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const disabledClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-100/80 px-3 text-xs text-(--text-muted) cursor-not-allowed"

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        {/* Header */}
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
              <Button variant="outline" onClick={() => setEditing(false)} className="px-3">
                Cancelar
              </Button>
              <Button tone="brand" variant="solid" prominent leftIcon={<Save size={13} />} onClick={() => setShowSaveModal(true)} className="px-3">
                Salvar alterações
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Avatar section */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-brand to-teal-400 text-2xl font-bold text-white">
                  DU
                </div>
                {editing && (
                  <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-(--border-custom) shadow-sm hover:bg-brand-50 transition-all cursor-pointer">
                    <Camera size={13} className="text-brand" />
                  </button>
                )}
              </div>
              <div>
                <div className="text-lg font-bold text-(--text)">{form.nome}</div>
                <div className="text-xs text-(--text-muted)">{form.especialidade}</div>
                <div className="text-xs text-(--text-muted) mt-0.5">{form.instituicao}</div>
              </div>
            </div>

            {/* Dados pessoais */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados Pessoais</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Nome completo</label>
                  {editing ? (
                    <TextInput value={form.nome} onChange={(e) => set('nome', e.target.value)}  />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>{form.nome}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">CPF</label>
                  <div className={disabledClass + " flex items-center"}>{form.cpf}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Data de nascimento</label>
                  {editing ? (
                    <TextInput type="date" value={form.dataNascimento} onChange={(e) => set('dataNascimento', e.target.value)}  />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>15/03/1985</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Telefone</label>
                  {editing ? (
                    <TextInput value={form.telefone} onChange={(e) => set('telefone', e.target.value)}  />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>{form.telefone}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Dados profissionais */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados Profissionais</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">E-mail</label>
                  {editing ? (
                    <TextInput type="email" value={form.email} onChange={(e) => set('email', e.target.value)}  />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>{form.email}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">CRM</label>
                  <div className={disabledClass + " flex items-center"}>{form.crm}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Especialidade</label>
                  {editing ? (
                    <TextInput value={form.especialidade} onChange={(e) => set('especialidade', e.target.value)}  />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>{form.especialidade}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Instituição</label>
                  {editing ? (
                    <TextInput value={form.instituicao} onChange={(e) => set('instituicao', e.target.value)}  />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>{form.instituicao}</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        size="sm"
        title="Salvar alterações"
        icon={<Save size={16} />}
        footer={<>
          <Button variant="outline" onClick={() => setShowSaveModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={() => { setShowSaveModal(false); setEditing(false) }}>Confirmar</Button>
        </>}
      >
        <p className="text-xs text-(--text-muted)">As alterações no seu perfil serão salvas e aplicadas imediatamente.</p>
      </Modal>
    </div>
  )
}
