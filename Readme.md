# 📊 Controle Financeiro Pessoal — App Web

Um **aplicativo web completo para controle financeiro pessoal**, com interface moderna, salvamento automático de dados e múltiplas funcionalidades para organizar sua vida financeira de forma simples e eficiente.

🔗 **Acesse o projeto online:**  
👉 https://wandersondfarias.github.io/Controle-finaceiro-2

---

## ✨ Funcionalidades Principais

### 📱 Interface Moderna
- ✅ **Modo Claro/Escuro** (alternância automática)
- ✅ **Design Responsivo** (desktop, tablet e mobile)
- ✅ **Animações suaves** para melhor experiência
- ✅ **Ícones e cores modernas**

---

### 💰 Controle Financeiro
- ✅ Adicionar, editar e excluir contas
- ✅ Categorias totalmente personalizáveis
- ✅ Filtros avançados (data, categoria e status)
- ✅ Status de pagamento (**Pago / Pendente**)
- ✅ Alertas automáticos de vencimento

---

### 📅 Calendário Integrado
- ✅ Visualização mensal das contas
- ✅ Destaque colorido para vencimentos
- ✅ Navegação entre meses
- ✅ Detalhes por dia

---

### 📊 Análise Gráfica
- ✅ Gráficos interativos:
  - Barras
  - Pizza
  - Linha
  - Rosca
- ✅ Análise por categoria
- ✅ Evolução mensal de gastos
- ✅ Filtros por período (mês, ano ou geral)

---

## 🛡️ Persistência de Dados

- ✅ Salvamento automático a cada alteração
- ✅ **Backup duplo**:
  - localStorage principal
  - Backup oculto compactado
- ✅ Importação e exportação de dados em **JSON**
- ✅ Mantém dados mesmo após limpeza parcial do navegador

---

## 🚀 Como Usar

### 🔧 Instalação Rápida
1. Baixe os arquivos:
   - `index.html`
   - `style.css`
   - `script.js`
2. Coloque todos na **mesma pasta**
3. Abra o arquivo `index.html` em qualquer navegador moderno

---

### ▶️ Primeiros Passos
- Adicione suas contas na aba **Financeiro**
- Crie categorias personalizadas
- Acompanhe vencimentos no **Calendário**
- Analise seus gastos nos **Gráficos**

---

## 🔐 Sistema de Backup

### 📁 Estrutura do Backup Duplo


📁 Dados
├── 📄 localStorage principal
└── 🔐 Backup oculto compactado


### ⏰ Salvamento Automático
- A cada **30 segundos** (se houver alterações)
- Ao fechar ou sair da página
- Ao minimizar o navegador
- Ao reconectar à internet

---

### ⚠️ IMPORTANTE — Para não perder dados
Ao limpar o histórico do navegador:

✅ **PODE marcar**
- Histórico de navegação
- Imagens e arquivos em cache
- Cookies (opcional)

❌ **NÃO marque**
- Cookies e outros dados de sites
- Dados de sites e plug-ins

---

## 📱 Telas do Aplicativo

### 1️⃣ Aba Financeiro
- Formulário de cadastro de contas
- Lista com filtros avançados
- Cartões de resumo:
  - Total Geral
  - Total Pago
  - Total Pendente
  - Alertas

### 2️⃣ Aba Categorias
- Cadastro de categorias personalizadas
- Listagem completa
- Edição e exclusão

### 3️⃣ Aba Calendário
- Visualização mensal
- Cores indicativas:
  - 🟡 Próximo do vencimento
  - 🔴 Atrasado

### 4️⃣ Aba Gráficos
- Gráficos por categoria
- Evolução mensal
- Filtros por período

---

## 🎨 Personalização

### 🌗 Modo Claro / Escuro
- Alternância automática
- Preferência salva automaticamente
- Cores otimizadas para cada modo

---

### 📂 Categorias Padrão

INTERNET, CEMIG, CODAU, MERCADO, GÁS,
VAREJÃO, AÇOUGUE, FARMÁCIA, ACADEMIA,
VIAGEM, TELEFONE, BANCO, NUBANK,
UNIMED, CONSTRUÇÃO, IPTU, OUTROS


---

## 📊 Estatísticas e Alertas

### 🚨 Alertas Automáticos
- 🔴 Contas atrasadas
- 🟡 Contas próximas do vencimento (até 7 dias)
- 🟢 Contas pagas

### 📈 Resumo Financeiro
- **Total Geral**
- **Total Pago**
- **Total Pendente**
- **Alertas ativos**

---

## 🔐 Backup e Segurança

### 📤 Exportar Dados
Gera um arquivo JSON:

backup_financeiro_AAAA-MM-DD.json


### 📥 Importar Dados
1. Clique em **Backup** no topo
2. Selecione **Importar Backup**
3. Escolha o arquivo JSON salvo

💡 **Dicas**
- Faça backup 1x por mês
- Guarde em nuvem ou pendrive
- Teste a importação periodicamente

---

## 📱 Dispositivos Suportados

- 💻 **Desktop** (1200px+)
- 📱 **Tablet** (768px – 1024px)
- 📱 **Smartphone** (< 768px)

### Layout Adaptativo
- Desktop: 4 colunas
- Tablet: 2 colunas
- Mobile: 1 coluna + botões maiores

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|----------|--------|-----------|
| HTML5 | — | Estrutura |
| CSS3 | — | Estilos e responsividade |
| JavaScript (ES6) | — | Lógica da aplicação |
| Chart.js | 3.x | Gráficos |
| Font Awesome | 6.4.0 | Ícones |
| localStorage | — | Persistência de dados |

## 📁 Estrutura do Projeto

controle-financeiro/
├── index.html
├── style.css
├── script.js
└── README.md

---

## 🚨 Solução de Problemas

**Dados sumiram?**
- Verifique se limpou “dados de sites”
- Importe o último backup

**App lento?**
- Limpe cache antigo
- Evite mais de 1000 contas
- Use navegador atualizado

**Gráficos não carregam?**
- Verifique conexão com internet
- Recarregue a página (F5)

---

## 🔄 Atualizações Futuras

### 🚀 v2.1
- Login Google/Facebook
- Sincronização em nuvem
- Relatórios em PDF
- Notificações por e-mail
- App PWA (instalável)

### 🚀 v2.2
- Orçamento mensal
- Metas de economia
- Categorias inteligentes
- Importação de extrato bancário

---

## 👥 Contribuição

1. Faça um Fork
2. Crie uma branch:
   ```bash
   git checkout -b feature/nova-funcionalidade
Commit:
git commit -m "Add nova funcionalidade"

 Push
git push origin feature/nova-funcionalidade

Abra um Pull Request

📄 Licença

Este projeto está sob a Licença MIT.

 🙏 Agradecimentos

Chart.js

Font Awesome

Comunidade Open Source

Você, por usar este app ❤️

📞 Suporte

Encontrou um bug ou tem uma sugestão?

Abra uma issue no repositório

Descreva o problema

Inclua prints, se possível

<p align="center">
  <img src="./LOGO CALHAS SANTO EXPEDITO.jpg" width="120" />
</p>

<p align="center">
  <a href="https://wandersondfarias.github.io/SISTEMA-FINACEIRO-CALHAS-SANTO-EXPEDITO/" target="_blank">
    🚀 <b>Acessar Sistema Online</b>
  </a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Desenvolvido%20por-Wanderson%20de%20Farias-blue?style=for-the-badge">
</p>

<p align="center">
  <a href="https://github.com/wandersondfarias">
    <img src="https://img.shields.io/badge/GitHub-Perfil-black?style=flat&logo=github">
  </a>
  &nbsp;&nbsp;
  <a href="https://www.linkedin.com/in/wandersonfariaswf/">
    <img src="https://img.shields.io/badge/LinkedIn-Conectar-blue?style=flat&logo=linkedin">
  </a>
</p>

<hr>





