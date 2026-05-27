# 🚀 Guia Prático de Merge - Instruções e Checklist

## 1. Preparação para Merge

### Antes de Fazer Merge

```bash
# ✅ Passo 1: Atualizar main com upstream
git checkout main
git fetch origin
git pull origin main

# ✅ Passo 2: Verificar status
git status
# Deve estar limpo: "On branch main, Your branch is up to date"

# ✅ Passo 3: Criar branch de backup (recomendado)
git branch backup/main-before-merge
```

### Alternativa: Merge Preview (Dry Run)

```bash
# Ver o que seria merged SEM efetivamente fazer merge
git merge --no-commit --no-ff alteracoes-da-teteca

# Resultado esperado:
# "Already up to date" OU
# Sem conflitos (CONFLICT markers não devem aparecer)

# Se tudo OK, abortar o merge
git merge --abort
```

---

## 2. Executar o Merge

### Merge Automático (Recomendado)

```bash
# Opção 1: Merge simples
git checkout main
git merge alteracoes-da-teteca

# Resultado esperado:
# Fast-forward ou commit de merge criado automaticamente
# Sem conflitos

# Opção 2: Merge com commit explícito
git merge --no-ff alteracoes-da-teteca -m "Merge: alteracoes-da-teteca into main"
```

### Merge com Squash (Alternativa)

```bash
# Se preferir um commit único em main
git merge --squash alteracoes-da-teteca
git commit -m "Merge: Refactor dashboard to use global store and enhance UX"
```

---

## 3. Validações Pós-Merge

### Imediatamente Após o Merge

```bash
# ✅ Verificar status
git status
# Deve estar limpo

# ✅ Verificar logs
git log --oneline -5
# Deve mostrar os 2 commits de alteracoes-da-teteca

# ✅ Verificar se todos os arquivos estão presentes
git ls-files | grep "dashboard-store"
# src/features/dashboard/stores/dashboard-store.ts

# ✅ Verificar não há markers de conflito em nenhum arquivo
git grep -l "<<<<<<" || echo "✅ Sem conflitos encontrados"
```

### Validações de Código

```bash
# ✅ Limpar dependências
npm ci
# ou
npm install

# ✅ Verificar tipos TypeScript
npm run type-check
# Esperado: Sem erros

# ✅ Executar linter
npm run lint
# Esperado: Sem erros críticos

# ✅ Executar testes
npm run test
# Esperado: Todos os testes passam

# ✅ Build final
npm run build
# Esperado: Build completo sem erros
```

---

## 4. Checklist de Validação Pré-Merge

- [ ] Branch `main` está limpo e atualizado
- [ ] Não há mudanças não commitadas
- [ ] Não há conflitos esperados (já validado)
- [ ] Backup criado (opcional, mas recomendado)
- [ ] Node modules estão atualizados
- [ ] TypeScript types verificados

---

## 5. Checklist de Validação Pós-Merge

- [ ] Merge completado sem conflitos
- [ ] Git status limpo
- [ ] `npm ci` ou `npm install` executado
- [ ] `npm run type-check` passou sem erros
- [ ] `npm run lint` passou sem erros críticos
- [ ] `npm run test` passou (ou ajustados para novos arquivos)
- [ ] `npm run build` completou com sucesso
- [ ] Arquivo `dashboard-store.ts` existe em `main`
- [ ] Novo hook `useImmunotherapyLookup()` está acessível
- [ ] Nenhum marcador de conflito em nenhum arquivo

---

## 6. Possíveis Problemas e Soluções

### Problema 1: Conflitos de Importação

**Sintoma:**

```
error TS2307: Cannot find module '@/features/dashboard/stores/dashboard-store'
```

**Solução:**

```bash
# ✅ Executar type-check novamente
npm run type-check

# ✅ Limpar cache de TypeScript
rm -rf node_modules/.cache

# ✅ Reinstalar dependências
npm ci

# ✅ Reiniciar servidor de desenvolvimento
npm run dev
```

### Problema 2: Conflitos de CSS

**Sintoma:**

```
Estilos CSS não aparecem após merge
```

**Solução:**

```bash
# ✅ Verificar se arquivo foi incluído
git show HEAD:src/index.css | grep "nome-da-classe"

# ✅ Limpar cache de build
rm -rf dist/

# ✅ Rebuild
npm run build
```

### Problema 3: Testes Falhando

**Sintoma:**

```
Tests falhando pós-merge
```

**Solução:**

```bash
# ✅ Atualizar snapshots se necessário
npm run test -- --updateSnapshot

# ✅ Ou executar testes relacionados ao código novo
npm run test -- src/features/dashboard/

# ✅ Ou executar testes específicos
npm run test -- --testNamePattern="Dashboard Store"
```

### Problema 4: Build Falhando

**Sintoma:**

```
npm run build retorna erros
```

**Solução:**

```bash
# ✅ Verificar tipos
npm run type-check

# ✅ Verificar lint
npm run lint -- --fix

# ✅ Limpar tudo e começar novamente
npm run clean && npm ci && npm run build
```

---

## 7. Instruções Detalhadas de Merge (Passo a Passo)

### Cenário: Merge em Ambiente de Desenvolvimento

```bash
# PASSO 1: Preparar ambiente
cd c:\Users\Min Gatinha\Downloads\teste\imunecare-web
git status
# ✅ Resultado esperado: "On branch main" ou "On branch alteracoes-da-teteca"

# PASSO 2: Ir para main
git checkout main
# ✅ Switched to branch 'main'

# PASSO 3: Atualizar com upstream
git fetch origin
git pull origin main
# ✅ Already up to date (ou menciona novo commits)

# PASSO 4: Verificar branches
git branch -a
# ✅ Verá: alteracoes-da-teteca e main

# PASSO 5: Executar merge preview
git merge --no-commit --no-ff alteracoes-da-teteca
# ✅ Resultado esperado: "Already up to date" ou sem conflitos

# PASSO 6: Verificar status
git status
# ✅ Se disse "Already up to date", git status mostrará branch limpo

# PASSO 7: Se não houve "Already up to date", abortar e fazer merge real
git merge --abort  # Se executado preview
git merge --no-ff alteracoes-da-teteca -m "Merge: alteracoes-da-teteca with dashboard refactor"
# ✅ Commit de merge criado automaticamente

# PASSO 8: Validar arquivos
git log --oneline -3
# ✅ Deve mostrar commits de alteracoes-da-teteca

# PASSO 9: Reinstalar dependências
npm ci
# ou
npm install

# PASSO 10: Validar tipos
npm run type-check
# ✅ Deve passar sem erros

# PASSO 11: Executar testes
npm run test
# ✅ Todos devem passar

# PASSO 12: Build final
npm run build
# ✅ Deve completar com sucesso
```

### Cenário: Push para Repositório Remoto

```bash
# APÓS merge local estar validado

# Fazer push
git push origin main
# ✅ Resultado esperado: commits pushed com sucesso

# Verificar no GitHub/GitLab
# ✅ Verificar Pull Requests abertos (se houver)
# ✅ Verificar Branch protection rules
```

---

## 8. Após o Merge - Limpeza

### Remover Branch Antiga (Opcional)

```bash
# ✅ APENAS DEPOIS QUE TUDO ESTIVER VALIDADO

# Remover branch local
git branch -d alteracoes-da-teteca
# ✅ Branch alteracoes-da-teteca deleted

# Remover branch remota (se não for mais necessária)
git push origin --delete alteracoes-da-teteca
# ✅ Remote branch deleted
```

---

## 9. Verificação de Funcionalidades Específicas

Após merge, verificar:

### Dashboard

```bash
# ✅ Navegar para /dashboard
# ✅ Verificar se controles de Modality funcionam
# ✅ Verificar se filtros funcionam
# ✅ Verificar se arquivamento de charts funciona
# ✅ Verificar se estado persiste após F5 (refresh)
```

### Imunoterapias

```bash
# ✅ Navegar para /immunotherapies
# ✅ Verificar novo filtro "completed"
# ✅ Verificar se atualizar status funciona
# ✅ Verificar lookup de nomes/telefones
```

### Sidebar

```bash
# ✅ Verificar posicionamento de notificações
# ✅ Verificar posicionamento do menu de usuário
# ✅ Verificar se highlighting de rota ativa funciona
# ✅ Testar em diferentes tamanhos de viewport
```

### Toast

```bash
# ✅ Executar ação que dispara toast
# ✅ Verificar estilo (background, borders, etc)
# ✅ Verificar se auto-dismiss funciona
# ✅ Verificar se close button funciona
```

---

## 10. Rollback se Necessário

### Se Algo Deu Errado

```bash
# ✅ Opção 1: Reverter último merge (local)
git merge --abort  # Se merge ainda em progresso
# ou
git reset --hard HEAD~1  # Se merge já foi commitado (CUIDADO!)

# ✅ Opção 2: Criar revert commit
git revert -m 1 HEAD  # Cria commit revertendo o merge

# ✅ Opção 3: Usar backup
git reset --hard backup/main-before-merge
```

---

## 11. Comunicação

### Notificar Time

Após merge bem-sucedido:

```markdown
# 📢 Notificação de Merge

**Branch:** `alteracoes-da-teteca` → `main`  
**Data:** [data do merge]  
**Responsável:** [seu nome]

## Mudanças Principais

- ✅ Refatoração do Dashboard com novo store global
- ✅ Novo hook `useImmunotherapyLookup()`
- ✅ Melhoria de UX no sidebar
- ✅ Refatoração do componente Toast

## Ações Necessárias

- [ ] Pull de main para ambiente local
- [ ] npm ci ou npm install
- [ ] npm run type-check
- [ ] npm run test
- [ ] npm run build

## Recursos

- 📄 Relatório: ANALISE_CONFLITOS_MERGE.md
- 📄 Análise Técnica: ANALISE_TECNICA_TIPOS_DEPENDENCIAS.md
- 📄 Guia de Merge: GUIA_MERGE_PRATICO.md
```

---

## 📋 Checklist Final

### Antes do Merge

- [ ] Todas as mudanças em `alteracoes-da-teteca` estão commitadas
- [ ] `main` está atualizado com origin
- [ ] Sem conflitos previamente identificados
- [ ] Testes locais em `alteracoes-da-teteca` passando
- [ ] Build local em `alteracoes-da-teteca` funcionando

### Durante o Merge

- [ ] Executar git merge sem erros
- [ ] Nenhum marcador de conflito encontrado
- [ ] Commit de merge criado com mensagem clara

### Depois do Merge

- [ ] npm ci/install executado
- [ ] type-check passou
- [ ] lint passou
- [ ] testes passaram
- [ ] build completou
- [ ] Funcionalidades testadas manualmente
- [ ] Branch antiga removida (se aplicável)
- [ ] Team notificado

---

**Guia Completo de Merge - Data:** 27 de maio de 2026
