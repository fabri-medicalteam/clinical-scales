# 🚀 Deployment Guide - Clinical Scales Extractor

## Configuração para Produção (Vercel)

Para que a funcionalidade de salvamento de escalas funcione em produção, você precisa configurar um **GitHub Personal Access Token** no Vercel.

### 📋 Passo a Passo

#### 1️⃣ Criar GitHub Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Preencha:
   - **Note:** `clinical-scales-vercel`
   - **Expiration:** `No expiration` (ou 90 days)
   - **Scopes:** Marque apenas:
     - ✅ `repo` (Full control of private repositories)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (você só verá uma vez!)

#### 2️⃣ Configurar Variáveis de Ambiente no Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **"clinical-scales"**
3. Vá em **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `GITHUB_TOKEN` | `ghp_xxxxxxxxxxxxx` | Token criado no passo 1 |
| `GITHUB_OWNER` | `fabri-medicalteam` | Dono do repositório |
| `GITHUB_REPO` | `clinical-scales` | Nome do repositório |
| `ANTHROPIC_API_KEY` | `sua-chave-anthropic` | API key do Claude |
| `SLACK_WEBHOOK_URL` | `seu-webhook-slack` | (Opcional) Webhook do Slack |

5. Clique em **"Save"**

#### 3️⃣ Redeploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique no menu `...` do último deploy
3. Clique em **"Redeploy"**
4. Aguarde 3-5 minutos

---

## 🧪 Testar em Produção

Após o deploy:

1. Acesse seu site: https://clinical-scales-...vercel.app/
2. Crie uma nova escala
3. Clique em **"💾 Salvar"**
4. Verifique no GitHub se o arquivo foi criado em: https://github.com/fabri-medicalteam/clinical-scales/tree/main/scales

---

## 🔧 Como Funciona

### Ambiente Local (Development)
- Salva arquivos diretamente no filesystem (`/scales/`)
- Verifica existência via `fs.existsSync()`

### Ambiente Produção (Vercel)
- Salva arquivos via **GitHub API** (commit direto no repositório)
- Verifica existência via **GitHub Contents API**
- Requer `GITHUB_TOKEN` configurado

---

## ⚠️ Troubleshooting

### Erro: "GitHub token not configured"
**Solução:** Configure `GITHUB_TOKEN` no Vercel conforme passo 2️⃣

### Erro: "GitHub API error: Bad credentials"
**Solução:**
1. Verifique se o token está correto
2. Certifique-se que o token tem permissão `repo`
3. Gere um novo token se necessário

### Erro: "ENOENT: no such file or directory"
**Solução:** Este erro indica que está tentando salvar no filesystem em produção. Certifique-se que:
1. As variáveis de ambiente estão configuradas
2. Fez redeploy após adicionar as variáveis

---

## 📊 Logs

Para ver logs de erro:

1. Acesse Vercel Dashboard → Seu Projeto
2. Vá em **Deployments** → Clique no deployment ativo
3. Clique em **"Runtime Logs"**
4. Veja erros da API `save-scale` e `check-scale`

---

## 🔐 Segurança

- ✅ O `GITHUB_TOKEN` é mantido secreto no Vercel
- ✅ Nunca exponha o token no código cliente
- ✅ O token só tem permissão `repo` (mínimo necessário)
- ✅ Todos os commits são feitos via API autenticada
