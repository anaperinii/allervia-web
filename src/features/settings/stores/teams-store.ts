import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TeamRole } from '@/features/settings/constants/team-roles'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  status: 'active' | 'inactive'
  avatar: string
  since: string
}

export interface Invite {
  id: string
  email: string
  role: TeamRole
  sentAt: string
  status: 'pending' | 'expired'
}

const seedMembers: TeamMember[] = [
  { id: '1', name: 'Dra. Karina Martins', email: 'karina@clinica.com', role: 'doctor', status: 'active', avatar: 'KM', since: 'Jan 2024' },
  { id: '2', name: 'Jaqueline Rodrigues', email: 'jaque@clinica.com', role: 'admin', status: 'active', avatar: 'JR', since: 'Mar 2023' },
  { id: '3', name: 'Carlos Eduardo Silva', email: 'carlos@clinica.com', role: 'nurse', status: 'active', avatar: 'CS', since: 'Jun 2024' },
  { id: '4', name: 'Mariana Costa', email: 'mariana@clinica.com', role: 'technician', status: 'active', avatar: 'MC', since: 'Set 2024' },
  { id: '5', name: 'Dr. André Lima', email: 'andre@clinica.com', role: 'doctor', status: 'active', avatar: 'AL', since: 'Fev 2024' },
  { id: '6', name: 'Fernanda Oliveira', email: 'fernanda@clinica.com', role: 'nurse', status: 'inactive', avatar: 'FO', since: 'Abr 2024' },
]

const seedInvites: Invite[] = [
  { id: 'i1', email: 'novo.medico@clinica.com', role: 'doctor', sentAt: '08/04/2026', status: 'pending' },
  { id: 'i2', email: 'estagiario@clinica.com', role: 'technician', sentAt: '05/04/2026', status: 'pending' },
  { id: 'i3', email: 'antigo@email.com', role: 'nurse', sentAt: '15/03/2026', status: 'expired' },
]

interface TeamsState {
  members: TeamMember[]
  invites: Invite[]
  removeMember: (id: string) => void
  setMemberStatus: (id: string, status: TeamMember['status']) => void
  deleteInvite: (id: string) => void
}

export const useTeamsStore = create<TeamsState>()(
  persist(
    (set) => ({
      members: seedMembers,
      invites: seedInvites,
      removeMember: (id) => set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
      setMemberStatus: (id, status) => set((state) => ({
        members: state.members.map((m) => (m.id === id ? { ...m, status } : m)),
      })),
      deleteInvite: (id) => set((state) => ({ invites: state.invites.filter((i) => i.id !== id) })),
    }),
    {
      name: 'imunecare:teams',
      merge: (persisted, current) => {
        const p = persisted as Partial<TeamsState>
        if (!p?.members?.length) return current
        return { ...current, members: p.members, invites: p.invites ?? current.invites }
      },
    },
  ),
)
