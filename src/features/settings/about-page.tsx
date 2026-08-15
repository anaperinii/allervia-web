import { Heart } from 'lucide-react'
import allerviaMark from '@/assets/allervia-mark-light.png'
import { AllerviaWordmark } from '@/shared/components/AllerviaWordmark'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'

export function AboutPage() {
  return (
    <SettingsLayout subtitle="Sobre o Sistema">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2.5">
          <img src={allerviaMark} alt="" className="h-14 w-14 object-contain" />
          <AllerviaWordmark className="text-3xl" style={{ color: 'var(--text)' }} />
          <p className="text-xs text-(--text-muted)">Gestão de Protocolos de Imunoterapia Alérgica</p>
        </div>

        <div className="border border-(--border-custom) rounded-xl bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4 text-left space-y-2.5">
          {[
            ['Versão', '2.0.0-beta'],
            ['Build', '2026.04.10'],
            ['Ambiente', 'Produção'],
            ['Frontend', 'React 19 + TypeScript + Vite 7'],
            ['Roteamento', 'TanStack Router'],
            ['Estado', 'Zustand'],
            ['UI', 'Tailwind CSS 4 + Lucide Icons'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-(--text-muted)">{label}</span>
              <span className="font-medium text-(--text)">{value}</span>
            </div>
          ))}
        </div>

        <div className="border border-(--border-custom) rounded-xl bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4 text-left">
          <h3 className="text-xs font-bold text-(--text) mb-2">Licença</h3>
          <p className="text-[0.7rem] text-(--text-muted) leading-relaxed">
            Software proprietário desenvolvido como Projeto Integrador do curso de Bacharelado em Engenharia de Software da Universidade Evangélica de Goiás (UniEVANGÉLICA). Todos os direitos reservados.
          </p>
        </div>

        <div className="border border-(--border-custom) rounded-xl bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4 text-left">
          <h3 className="text-xs font-bold text-(--text) mb-2">Equipe de Desenvolvimento</h3>
          <div className="space-y-1.5">
            {['Ana Luisa Lima Perini', 'Daniella Nogueira e Silva', 'Esther Carolina Batista Lima', 'Victória Gomes Garcia'].map((name) => (
              <div key={name} className="text-xs text-(--text-muted)">{name}</div>
            ))}
          </div>
          <div className="mt-3 text-[0.65rem] text-(--text-muted)">
            Orientador: Vinícius Sarmento Costa Siqueira<br />
            Coorientador: Jeferson Silva Araújo
          </div>
        </div>

        <p className="lg:col-span-2 text-[0.7rem] text-(--text-muted) flex items-center justify-center gap-1">
          Feito com <Heart size={12} className="text-red-400" /> para a alergologia brasileira
        </p>
      </div>
    </SettingsLayout>
  )
}
