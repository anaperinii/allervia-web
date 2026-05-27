# 📋 Mapeamento da Branch Main - ImuneCare Web

**Data:** 27 de maio de 2026  
**Status:** Versão estável com funcionalidades maduras  
**Origem:** Consolidação de repositório privado anterior + evolução contínua

---

## 1️⃣ Visão Geral do Projeto

### Propósito

**ImuneCare** é uma plataforma de gestão clínica especializada em consultórios de alergologia que conduzem protocolos de **SCIT (Subcutaneous Immunotherapy)**. Oferece um prontuário eletrônico estruturado, agenda terapêutica, cálculo automático de progressão de doses, emissão de relatórios e trilha de auditoria em conformidade com a **LGPD**.

### Funcionalidades Principais

- 🏥 **Prontuário eletrônico** com histórico completo de aplicações
- 📈 **Progressão automatizada** do tratamento (dose e intervalo calculados dinamicamente)
- 📅 **Agenda terapêutica** semanal/mensal com integração Google Calendar
- 📊 **Dashboard analítico** com indicadores de adesão, distribuição e ciclos
- 📄 **Relatórios clínicos** e portabilidade de dados (LGPD)
- 🔐 **Controle de acesso granular** (RBAC) com trilha de auditoria

---

## 2️⃣ Stack Técnico

### Frontend

```
React 19.2.4              Frontend framework
TypeScript (Strict)       Type safety
Vite 5.x                  Bundler & dev server
TanStack Router 1.168.x   File-based routing
Zustand 5.0.x             State management
Tailwind CSS 4.2.x        Estilização utilitária
```

### UI & Componentes

```
Radix UI (Headless)       Dialog, Select, Dropdown, Alert, Label, Separator
Lucide React              Icons library (1.8.0)
React Day Picker          Date picker component
React Hook Form           Form management
```

### Bibliotecas Utilitárias

```
Zod 4.4.3                 Schema validation
Class Variance Authority  Component variants
clsx & tw-merge           CSS utilities
date-fns 4.1.0            Date manipulation
jsPDF 4.2.1               PDF generation
Recharts 3.8.1            Data visualization
Hugeicons                 Icon library (Fontsource)
```

### Desenvolvimento

```
ESLint 9.39.x             Linting
TypeScript Compiler       Type checking
@tailwindcss/vite         Tailwind integration
```

### Configuração

```
Node.js 20+ required
Package manager: npm / pnpm / yarn
```

---

## 3️⃣ Arquitetura e Organização

### Princípios Arquiteturais

1. **Feature Modules** - Cada domínio de negócio é um módulo autocontido
2. **Camadas Compartilhadas** - `shared/` para componentes e lógica transversal
3. **State Management Distribuído** - Zustand stores por feature
4. **Type-Safe Routes** - TanStack Router com geração automática de tipos
5. **Paths Alias** - Todos imports usam `@/*` → `./src/*`

### Estrutura de Pastas

```
imunecare-web/
├── src/
│   ├── features/                    # 🎯 Módulos de negócio autocontidos
│   │   ├── auth/                    # Autenticação
│   │   ├── dashboard/               # Dashboard + exportação
│   │   ├── immunotherapy/           # Imunoterapia
│   │   ├── landing-page/            # Página inicial
│   │   ├── notification/            # Central de notificações
│   │   ├── patient/                 # Prontuário eletrônico
│   │   ├── scheduling/              # Agendamentos
│   │   └── settings/                # Configurações
│   │
│   ├── routes/                      # 🛣️ Definições de rotas (TanStack Router)
│   │   ├── __root.tsx               # Root layout
│   │   ├── index.tsx                # Landing page
│   │   ├── login.tsx                # Página de login
│   │   ├── register.tsx             # Página de registro
│   │   ├── forgot-password.tsx      # Recuperação de senha
│   │   ├── trial.tsx                # Página de trial
│   │   ├── dashboard.tsx            # Dashboard
│   │   ├── immunotherapies.tsx      # Imunoterapias (lista)
│   │   ├── add-immunotherapy.tsx    # Adicionar imunoterapia
│   │   ├── patient.$patientId.tsx   # Detalhe do paciente
│   │   ├── patient-completion.tsx   # Preenchimento do paciente
│   │   ├── patient-evolution.tsx    # Evolução do paciente
│   │   ├── patient-report.tsx       # Relatório do paciente
│   │   ├── appointments.tsx         # Agendamentos
│   │   ├── notifications.tsx        # Notificações
│   │   ├── settings.tsx             # Configurações (hub)
│   │   ├── profile.tsx              # Perfil do usuário
│   │   ├── security.tsx             # Segurança
│   │   ├── advanced-settings.tsx    # Configurações avançadas
│   │   ├── personalization.tsx      # Personalização
│   │   ├── plans.tsx                # Planos
│   │   ├── teams.tsx                # Times
│   │   ├── about.tsx                # Sobre
│   │   ├── help.tsx                 # Ajuda
│   │   └── export-report.tsx        # Exportação de relatório
│   │
│   ├── layout/                      # 🎨 Componentes de shell (Header, Sidebar)
│   │   ├── header.tsx               # Header navigation
│   │   ├── sidebar.tsx              # Sidebar navigation
│   │   └── stores/
│   │       └── sidebar-store.ts     # Estado do sidebar
│   │
│   ├── shared/                      # 🔧 Código compartilhado
│   │   ├── components/              # UI primitives (Button, Modal, FormField, etc.)
│   │   ├── hooks/                   # Custom hooks (useForm, etc.)
│   │   ├── lib/                     # Utilitários (validators, helpers)
│   │   ├── constants/               # Constantes globais
│   │   ├── identity/                # Identity/Auth utilities
│   │   ├── audit/                   # Audit store
│   │   └── ui/                      # Componentes de UI
│   │
│   ├── assets/                      # 🖼️ Imagens, logos, recursos
│   ├── index.css                    # Global styles
│   ├── main.tsx                     # React entry point
│   └── routeTree.gen.ts             # 🤖 GERADO - Árvore de rotas
│
├── public/                          # Arquivos estáticos
├── vite.config.ts                   # Configuração Vite
├── tsconfig.json                    # TypeScript root config
├── tsconfig.app.json                # TypeScript app config
├── tsconfig.node.json               # TypeScript node config
├── eslint.config.js                 # ESLint configuration
├── package.json                     # Dependências & scripts
├── index.html                       # HTML entry
└── README.md                        # Documentação
```

---

## 4️⃣ Features Módulos

### 🔐 **auth/** - Autenticação

**Páginas:**

- `login-page.tsx` - Login com email/senha
- `register-page.tsx` - Registro de novo usuário
- `forgot-password-page.tsx` - Recuperação de senha
- `trial-page.tsx` - Página de trial

**Estrutura:**

```
auth/
├── login-page.tsx
├── register-page.tsx
├── forgot-password-page.tsx
├── trial-page.tsx
├── components/               # Componentes internos
└── forms/                    # Formulários (React Hook Form + Zod)
```

**Responsabilidades:** Autenticação, registro, recuperação de senha, fluxos de trial

---

### 📊 **dashboard/** - Dashboard e Relatórios

**Páginas:**

- `dashboard-page.tsx` - Dashboard principal com KPIs
- `export-report-page.tsx` - Exportação de relatórios

**Estrutura:**

```
dashboard/
├── dashboard-page.tsx
├── export-report-page.tsx
├── components/              # Gráficos, cards, widgets
├── constants/               # Configurações de dashboard
├── hooks/                   # Lógica customizada
```

**Responsabilidades:** Indicadores de adesão, distribuição de concentrações, ciclos filtrados por médico/modalidade, exportação em múltiplos formatos

---

### 💉 **immunotherapy/** - Imunoterapia

**Páginas:**

- `immunotherapies-page.tsx` - Listagem de imunoterapias
- `add-immunotherapy-page.tsx` - Cadastro/edição

**Estrutura:**

```
immunotherapy/
├── immunotherapies-page.tsx
├── add-immunotherapy-page.tsx
├── components/              # Componentes específicos
├── constants/               # Tipos customizáveis
├── forms/                   # Formulários
└── stores/                  # Zustand store (estado)
```

**Responsabilidades:** CRUD de imunoterapias, tipos customizáveis por clínica, progressão de protocolo SCIT

---

### 👤 **patient/** - Prontuário Eletrônico

**Páginas:**

- `patient-chart-page.tsx` - Prontuário/chart do paciente
- `patient-completion-page.tsx` - Preenchimento de dados
- `patient-evolution-page.tsx` - Evolução terapêutica
- `patient-report-page.tsx` - Relatório do paciente

**Estrutura:**

```
patient/
├── patient-chart-page.tsx
├── patient-completion-page.tsx
├── patient-evolution-page.tsx
├── patient-report-page.tsx
├── components/              # Componentes complexos
├── constants/               # Configurações
├── forms/                   # Formulários
├── lib/                     # Lógica de negócio
├── exporters/               # Exportadores (PDF, etc.)
└── stores/                  # Zustand store
```

**Responsabilidades:** Histórico completo, evolução, relatórios, portabilidade LGPD, exportação em PDF

---

### 📅 **scheduling/** - Agendamentos

**Páginas:**

- `appointments-page.tsx` - Agenda de agendamentos

**Estrutura:**

```
scheduling/
├── appointments-page.tsx
├── components/              # Calendário, slots
├── constants/               # Configurações de agenda
├── forms/                   # Agendamento
└── hooks/                   # Lógica customizada
```

**Responsabilidades:** Agenda semanal/mensal, integração Google Calendar, gerenciamento de slots

---

### 🔔 **notification/** - Notificações

**Páginas:**

- `notifications-page.tsx` - Central de notificações

**Estrutura:**

```
notification/
├── notifications-page.tsx
├── components/              # Card de notificação
├── constants/               # Tipos de notificações
└── stores/                  # Zustand store
```

**Responsabilidades:** Histórico de notificações, marcação como lida, preferências de notificação

---

### ⚙️ **settings/** - Configurações

**Páginas:**

- `settings-page.tsx` - Hub de configurações
- `profile-page.tsx` - Perfil do usuário
- `security-page.tsx` - Segurança
- `advanced-settings-page.tsx` - Config. avançadas
- `personalization-page.tsx` - Personalização
- `plans-page.tsx` - Planos de serviço
- `teams-page.tsx` - Gerenciamento de times
- `about-page.tsx` - Sobre
- `help-page.tsx` - Ajuda

**Estrutura:**

```
settings/
├── settings-page.tsx
├── profile-page.tsx
├── security-page.tsx
├── advanced-settings-page.tsx
├── personalization-page.tsx
├── plans-page.tsx
├── teams-page.tsx
├── about-page.tsx
├── help-page.tsx
├── components/              # Cards, forms específicos
├── constants/               # Configurações
├── forms/                   # Formulários
└── stores/                  # Zustand store
```

**Responsabilidades:** Perfil, segurança (2FA, tokens), personalização, times, planos, LGPD data portability

---

### 🏠 **landing-page/** - Página Inicial

**Estrutura:**

```
landing-page/
├── landing-page.tsx
├── components/              # Seções (Hero, Features, Pricing, etc.)
├── constants/               # Textos, pricing
└── sections/                # Seções reutilizáveis
```

**Responsabilidades:** Marketing, onboarding, CTA para login/registro

---

## 5️⃣ Rotas Definidas

### 🗺️ Mapa de Rotas Disponíveis

| Rota                  | Arquivo                  | Feature       | Acesso  | Descrição               |
| --------------------- | ------------------------ | ------------- | ------- | ----------------------- |
| `/`                   | `index.tsx`              | landing-page  | Público | Landing page            |
| `/login`              | `login.tsx`              | auth          | Público | Login                   |
| `/register`           | `register.tsx`           | auth          | Público | Registro                |
| `/forgot-password`    | `forgot-password.tsx`    | auth          | Público | Recuperação de senha    |
| `/trial`              | `trial.tsx`              | auth          | Público | Página de trial         |
| `/dashboard`          | `dashboard.tsx`          | dashboard     | Privado | Dashboard principal     |
| `/immunotherapies`    | `immunotherapies.tsx`    | immunotherapy | Privado | Lista de imunoterapias  |
| `/add-immunotherapy`  | `add-immunotherapy.tsx`  | immunotherapy | Privado | Adicionar imunoterapia  |
| `/patient/:patientId` | `patient.$patientId.tsx` | patient       | Privado | Detalhe do paciente     |
| `/patient-completion` | `patient-completion.tsx` | patient       | Privado | Preenchimento paciente  |
| `/patient-evolution`  | `patient-evolution.tsx`  | patient       | Privado | Evolução do paciente    |
| `/patient-report`     | `patient-report.tsx`     | patient       | Privado | Relatório do paciente   |
| `/appointments`       | `appointments.tsx`       | scheduling    | Privado | Agendamentos            |
| `/notifications`      | `notifications.tsx`      | notification  | Privado | Central de notificações |
| `/settings`           | `settings.tsx`           | settings      | Privado | Hub de configurações    |
| `/profile`            | `profile.tsx`            | settings      | Privado | Perfil do usuário       |
| `/security`           | `security.tsx`           | settings      | Privado | Segurança               |
| `/advanced-settings`  | `advanced-settings.tsx`  | settings      | Privado | Config. avançadas       |
| `/personalization`    | `personalization.tsx`    | settings      | Privado | Personalização          |
| `/plans`              | `plans.tsx`              | settings      | Privado | Planos                  |
| `/teams`              | `teams.tsx`              | settings      | Privado | Times                   |
| `/about`              | `about.tsx`              | settings      | Privado | Sobre                   |
| `/help`               | `help.tsx`               | settings      | Privado | Ajuda                   |
| `/export-report`      | `export-report.tsx`      | dashboard     | Privado | Exportação de relatório |

**Rotas Especiais:**

- `/__root.tsx` - Layout raiz (Header, Sidebar, ToastViewport)
- `routeTree.gen.ts` - ⚙️ GERADO automaticamente pelo TanStack Router

---

## 6️⃣ Camada Compartilhada (shared/)

### 📦 **components/** - UI Primitives

Componentes sem contexto de domínio, reutilizáveis em toda a app:

```
Button.tsx                  # Botão base
IconButton.tsx              # Botão com ícone
CardButton.tsx              # Botão estilizado como card
FormField.tsx               # Input wrapper com validação
Modal.tsx                   # Modal genérico
CancelWizardModal.tsx       # Modal de confirmação
ConfirmDiscardModal.tsx     # Modal de confirmação discard
PasswordInput.tsx           # Input de senha com reveal
PasswordRequirements.tsx    # Indicador de força de senha
ReadOnlyField.tsx           # Campo apenas leitura
SegmentedControl.tsx        # Controle segmentado
Switch.tsx                  # Toggle switch
ToggleCard.tsx              # Card toggle
WizardStepsIndicator.tsx    # Indicador de etapas
TablePagination.tsx         # Paginação de tabela
VerificationCodeInput.tsx   # Input para código de verificação
Toast.tsx                   # Notificação toast
ToastViewport.tsx           # Container para toasts
MarketingCTA.tsx            # Call-to-action marketing
Blob.tsx                    # Elemento SVG blob
Reveal.tsx                  # Componente reveal (animation)
MediaRow.tsx                # Layout row para média
```

### 🪝 **hooks/** - Custom Hooks

```
useForm                     # Form management wrapper
[outros hooks]              # A explorar conforme necessário
```

### 📚 **lib/** - Utilitários

```
utils/                      # Funções utilitárias gerais
validators/                 # Validadores Zod
[helpers]                   # Funções auxiliares
```

### 📋 **constants/** - Constantes Globais

```
[configurações globais]     # Strings, enums, config
```

### 🔐 **identity/** - Identity Management

```
[utilities de autenticação/autorização]
```

### 📊 **audit/** - Trilha de Auditoria

```
audit-store.ts              # Zustand store para auditoria
```

---

## 7️⃣ Layout e Shell

### 🎨 **layout/**

```
header.tsx                  # Header responsivo com nav
sidebar.tsx                 # Sidebar com menu
stores/
└── sidebar-store.ts        # Zustand store (collapsed state)
```

**Características:**

- Header com logo, navegação e menu mobile
- Sidebar colapsível com menu contexto-sensível
- Layout muda dinamicamente baseado em rota (público/privado)
- Toast viewport globalizado

---

## 8️⃣ State Management (Zustand)

Cada feature com state global tem um Zustand store:

```
features/*/stores/[name]-store.ts
```

**Stores Identificados:**

```
immunotherapy/stores/       # Estado de imunoterapias
patient/stores/             # Estado de pacientes
notification/stores/        # Estado de notificações
settings/stores/            # Estado de configurações
layout/stores/              # Estado do layout (sidebar)
shared/audit/               # Trilha de auditoria
shared/components/          # Toast store
```

**Padrão Zustand:**

```typescript
import { create } from 'zustand';

interface Store {
  // State
  item: Type;
  // Actions
  setItem: (item: Type) => void;
}

export const useStore = create<Store>((set) => ({
  item: initialState,
  setItem: (item) => set({ item }),
}));
```

---

## 9️⃣ Configurações de Build e Desenvolvimento

### 🔧 **vite.config.ts**

```typescript
Plugins:
  - @vitejs/plugin-react
  - @tailwindcss/vite
  - @tanstack/router-vite-plugin  # Gera routeTree.gen.ts

Resolve:
  - alias: @ → ./src
```

### 📝 **tsconfig.json**

```
Root config que referencia:
  - tsconfig.app.json (app)
  - tsconfig.node.json (build tools)
```

### ⚙️ **tsconfig.app.json**

```
Target: ES2022
Lib: ES2022 + DOM
Module: ESNext
Strict: true              ✅ Type checking rigoroso
NoUnusedLocals: true      ✅ Sem variáveis não usadas
NoUnusedParameters: true  ✅ Sem parâmetros não usados
JSX: react-jsx
Paths: @/* → ./src/*
```

### 🔍 **eslint.config.js**

```
Extends:
  - @eslint/js
  - typescript-eslint
  - eslint-plugin-react-hooks
  - eslint-plugin-react-refresh

Target: ES2020 + Browser globals
```

---

## 🔟 Scripts de Desenvolvimento

```bash
npm run dev              # Vite dev server (http://localhost:5173)
npm run build            # Build production (tsc + vite build)
npm run lint             # ESLint check
npm run preview          # Preview build local
```

---

## 1️⃣1️⃣ Fluxos e Ciclos de Vida

### 🔄 **Fluxo de Autenticação**

```
User → Landing Page (/)
  ↓
Login (/login) / Register (/register)
  ↓
Authentication Success
  ↓
Dashboard (/dashboard) - Private routes unlocked
```

### 🔄 **Fluxo de Atendimento (SCIT)**

```
Dashboard
  ↓
Select Patient / Create
  ↓
Patient Chart (/patient/:id)
  ↓
Appointment Scheduling
  ↓
Apply Immunotherapy
  ↓
Track Evolution & Reports
```

### 🔄 **Fluxo de Configurações**

```
Settings Hub (/settings)
  ├→ Profile (/profile)
  ├→ Security (/security)
  ├→ Advanced Settings (/advanced-settings)
  ├→ Personalization (/personalization)
  ├→ Plans (/plans)
  ├→ Teams (/teams)
  ├→ About (/about)
  └→ Help (/help)
```

---

## 1️⃣2️⃣ Conformidade e Segurança

### 🔐 **RBAC (Role-Based Access Control)**

- Controle de acesso granular por perfil profissional
- Integração no sistema de rotas (public/private)
- Stores de identidade em `shared/identity/`

### 📋 **LGPD (Lei Geral de Proteção de Dados)**

- Trilha de auditoria completa (`shared/audit/`)
- Exportação de dados do paciente em `patient/exporters/`
- Dados sensíveis rastreados e protegidos

### 🔏 **Segurança**

- TypeScript strict mode
- Validação com Zod
- React Hook Form + validação server-side
- Componentes seguros (Radix UI - headless/unstyled)

---

## 1️⃣3️⃣ Padrões e Convenções

### 📁 **Estrutura de Feature**

```
feature/
├── [feature]-page.tsx           # Página principal
├── components/                  # Componentes internos
├── forms/                       # Formulários (React Hook Form)
├── constants/                   # Enums, configs
├── hooks/                       # Custom hooks
├── stores/                      # Zustand stores
├── lib/                         # Lógica de negócio
└── exporters/                   # (se aplicável) Exportadores
```

### 🏷️ **Naming Conventions**

```
Components:     PascalCase (MyComponent.tsx)
Hooks:          camelCase (useMyHook.ts)
Stores:         camelCase (useMyStore.ts)
Pages:          kebab-case ending -page (my-page.tsx)
Routes:         kebab-case (my-route.tsx)
Constants:      SCREAMING_SNAKE_CASE
Types:          PascalCase (MyType, MyInterface)
```

### 🎨 **CSS Classes**

```
Tailwind utility-first approach
No custom CSS unless necessary
Class composition: clsx() + tailwind-merge
```

### 📦 **Imports**

```
All imports use @ alias:
  import { Button } from '@/shared/components'
  import { useDashboard } from '@/features/dashboard/hooks'
```

---

## 1️⃣4️⃣ Pontos de Entrada e Dependências Externas

### 🚀 **Entry Point**

```
index.html          → Carrega React
main.tsx            → Cria router + monta app
routeTree.gen.ts    → Árvore de rotas (gerada)
```

### 🔗 **API/Backend**

- **Não definido em package.json**
- Presumi axios/fetch em runtime

### 📍 **Integração Google Calendar**

- `scheduling/` implementa integração
- Config no settings

### 📊 **PDF Generation**

- `jspdf` para exportação de relatórios
- `patient/exporters/` contém lógica

---

## 1️⃣5️⃣ Checklist de Manutenção

- [ ] Verificar compatibilidade React 19
- [ ] Validar TypeScript strict (noUnusedLocals, noUnusedParameters)
- [ ] Rotas type-safe com TanStack Router
- [ ] Stores Zustand sincronizadas
- [ ] Componentes seguem padrão de feature
- [ ] Trails de auditoria em dados sensíveis
- [ ] Validação Zod em todos os forms
- [ ] Conformidade LGPD checada
- [ ] ESLint sem warnings
- [ ] Build sem errors (tsc + vite)

---

## 📊 Resumo de Estatísticas

| Métrica                        | Valor |
| ------------------------------ | ----- |
| **Features Principais**        | 8     |
| **Rotas Totais**               | 24    |
| **Páginas Públicas**           | 5     |
| **Páginas Privadas**           | 19    |
| **Componentes Compartilhados** | ~25   |
| **Zustand Stores**             | 6+    |
| **Dependências Diretas**       | 25+   |
| **Dev Dependencies**           | 15+   |
| **Linhas TypeScript Strict**   | ✅    |

---

## 🎯 Próximas Ações Sugeridas

1. **Audit Completo** - Revisar conformidade LGPD e RBAC
2. **Performance** - Medir Core Web Vitals e otimizar re-renders
3. **Testes** - Adicionar suite de testes (Jest + RTL)
4. **Documentação** - Expandir inline docs de features complexas
5. **CI/CD** - Implementar pipeline automatizado

---

**Versão do Documento:** 1.0  
**Última Atualização:** 27/05/2026  
**Manutenido por:** imunecare Maintenance Agent
