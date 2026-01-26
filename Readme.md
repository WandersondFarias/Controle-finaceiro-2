📊 Controle Financeiro Pessoal - App Web
Um aplicativo web completo para controle financeiro pessoal com interface moderna, persistência automática de dados e múltiplas funcionalidades.


✨ Funcionalidades Principais
📱 Interface Moderna
✅ Modo Claro/Escuro - Alternância automática

✅ Design Responsivo - Funciona em todos os dispositivos

✅ Animações Suaves - Experiência de usuário fluida

✅ Ícones e Cores - Interface visualmente atraente


💰 Controle Financeiro
✅ Adicionar/Editar/Excluir contas

✅ Categorias personalizáveis

✅ Filtros avançados por data, categoria e status

✅ Status de pagamento (Pago/Pendente)

✅ Alertas automáticos para vencimentos




📅 Calendário Integrado

✅ Visualização mensal de contas

✅ Destaque colorido para vencimentos

✅ Navegação entre meses

✅ Visualização por dia com detalhes


📊 Análise Gráfica

✅ Gráficos interativos (barras, pizza, linha, rosca)

✅ Análise por categoria

✅ Evolução mensal de gastos

✅ Filtros por período (mês, ano, todos)



🛡️ Persistência de Dados

✅ Salvamento automático - A cada alteração

✅ Backup duplo - localStorage + backup oculto

✅ Sobrevive à limpeza do histórico (se configurado corretamente)

✅ Exportação/Importação de dados em JSON


🚀 Como Usar
Instalação Rápida
Baixe os 3 arquivos:

index.html

style.css

script.js

Coloque-os na mesma pasta

Abra o index.html em qualquer navegador moderno


Primeiros Passos
Adicione suas primeiras contas na aba "Financeiro"

Crie categorias personalizadas na aba "Categorias"

Acompanhe vencimentos no Calendário

Analise seus gastos com os Gráficos



🔧 Sistema de Persistência
Como os dados são salvos:



📁 Sistema de Backup Duplo
├── 📄 localStorage principal (dados completos)
└── 🔐 Backup oculto (dados compactados)



Salvamento Automático:
⏰ A cada 30 segundos (se houver alterações)

🚪 Ao fechar/sair da página

📱 Ao minimizar o navegador

📶 Ao reconectar à internet



⚠️ IMPORTANTE - Para não perder dados:
Ao limpar histórico do navegador:


✅ PODE marcar:
   - Histórico de navegação
   - Imagens e arquivos em cache
   - Cookies (opcional)

❌ NÃO marque:
   - Cookies e outros dados de sites
   - Dados de sites e plug-ins


   📱 Telas do Aplicativo
1. Aba Financeiro
Formulário para adicionar contas

Lista com filtros avançados

Cartões de resumo (Total, Pago, Pendente, Alertas)


2. Aba Categorias
Cadastro de categorias personalizadas

Lista de todas as categorias

Edição e exclusão

3. Aba Calendário
Visualização mensal de contas

Cores para vencimentos (amarelo: próximo, vermelho: atrasado)

Navegação entre meses


4. Aba Gráficos
Gráfico de categorias (barras/pizza/linha/rosca)

Gráfico de evolução mensal

Filtros por período

🎨 Personalização
Modo Escuro/Claro
Alternância automática

Configuração salva automaticamente

Cores otimizadas para cada modo



Categorias Padrão Incluídas:
text
INTERNET, CEMIG, CODAU, Mercado, GÁS, 
VAREJÃO, AÇOUGUE, FARMÁCIA, ACADEMIA, 
VIAGEM, TELEFONE, BANCO, NUBANK, 
Unimed, CONSTRUÇÃO, IPTU, Outros


📊 Estatísticas e Alertas
Alertas Automáticos:
🔴 Contas atrasadas (vermelho)

🟡 Contas próximas do vencimento (amarelo, 7 dias)

🟢 Contas pagas (verde)

Resumo Financeiro:
Total Geral: Soma de todas as contas

Total Pago: Contas já quitadas

Total Pendente: Contas em aberto

Alertas: Contas vencendo/vencidas


🔐 Backup e Segurança
Exportar Dados:
javascript
// Gera arquivo JSON com todos os dados
// Nome: backup_financeiro_AAAA-MM-DD.json



Importar Dados:
Clique em "Backup" no topo

Selecione "Importar Backup"

Escolha o arquivo JSON exportado anteriormente

Dicas de Backup:
Exporte 1x por mês para segurança extra

Guarde o arquivo em nuvem ou outro dispositivo

Teste a importação periodicamente


Dispositivos Suportados:
💻 Desktop (1200px+)

📱 Tablet (768px - 1024px)

📱 Smartphone (< 768px)

Layouts Adaptativos:
Desktop: 4 colunas de cartões, formulário em linha

Tablet: 2 colunas de cartões, formulário adaptado

Mobile: 1 coluna, menu vertical, botões maiores




🛠️ Tecnologias Utilizadas
Tecnologia	Versão	Finalidade
HTML5	-	Estrutura da aplicação
CSS3	-	Estilos e responsividade
JavaScript (ES6)	-	Lógica e interatividade
Chart.js	3.x	Gráficos interativos
Font Awesome	6.4.0	Ícones e símbolos
localStorage	-	Persistência de dados



📁 Estrutura do Projeto
text
controle-financeiro/
├── 📄 index.html          # Estrutura principal
├── 🎨 style.css           # Estilos e temas
├── ⚡ script.js           # Lógica da aplicação
└── 📊 README.md          # Este arquivo



🚨 Solução de Problemas
Dados sumiram?
Verifique se marcou "Cookies e dados de sites" ao limpar histórico

Importe seu último backup

Contate suporte se persistir



App lento?
Limpe cache antigo (o app faz isso automaticamente)

Exporte e reinicie se tiver muitas contas (> 1000)

Use um navegador atualizado

Gráficos não carregam?
Verifique conexão com internet (para CDN)

Recarregue a página (F5)

Troque tipo de gráfico temporariamente



🔄 Atualizações Futuras
Planejado para v2.1:
Login com Google/Facebook

Sincronização em nuvem

Relatórios em PDF

Notificações por email

App PWA (instalável)



Planejado para v2.2:
Orçamento mensal

Metas de economia

Categorias inteligentes

Importação de extrato bancário



👥 Contribuição
Como contribuir:
Fork o projeto

Crie uma branch (git checkout -b feature/nova-funcionalidade)

Commit suas mudanças (git commit -m 'Add nova funcionalidade')

Push para a branch (git push origin feature/nova-funcionalidade)

Abra um Pull Request

Código de Conduta:
Respeite outros contribuidores

Mantenha o foco na melhoria do projeto

Documente suas alterações


📄 Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

text
MIT License

Copyright (c) 2024 Controle Financeiro App

Permissão é concedida, gratuitamente, a qualquer pessoa que obtenha uma cópia
deste software e arquivos de documentação associados...


🙏 Agradecimentos
Chart.js por gráficos incríveis

Font Awesome pelos ícones

Comunidade Open Source por todas as bibliotecas

Você por usar este aplicativo! ❤️


📞 Suporte
Encontrou um bug? Tem uma sugestão?

Abra uma issue no repositório

Descreva detalhadamente o problema

Inclua prints se possível

Aguarde nossa resposta



<div align="center">
Desenvolvido com ❤️ por wanderson de farias para ajudar no controle financeiro pessoal
⭐ Dê uma estrela no projeto se gostou! ⭐

https://github.com/wandersondfarias

Versão 2.0 | Última atualização: Janeiro 2026



🎯 Guia Rápido de Uso
Dia a Dia:
Abra o aplicativo

Adicione suas contas conforme chegam

Marque como Pago quando pagar

Acompanhe no calendário

Analise nos gráficos mensalmente


Manutenção:
Exporte backup 1x por mês

LINK DO PROJETO = https://wandersondfarias.github.io/Controle-finaceiro-2


Limpe cache se notar lentidão

Atualize categorias conforme necessário


Pronto! Agora você tem um sistema completo de controle financeiro que salva tudo automaticamente! 💰🚀
