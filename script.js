/* ==================== SISTEMA DE PERSISTÊNCIA AUTOMÁTICA ==================== */

// Chave para armazenamento
const STORAGE_KEY = 'controle_financeiro_dados';
const BACKUP_KEY = '_financeiro_backup';

// Lista completa de categorias padrão
const CATEGORIAS_PADRAO = [
    "INTERNET", "CEMIG", "CODAU", "Mercado", "GÁS", 
    "VAREJÃO", "AÇOUGUE", "FARMÁCIA", "ACADEMIA", 
    "VIAGEM", "TELEFONE", "BANCO", "NUBANK", 
    "Unimed", "CONSTRUÇÃO", "IPTU", "Outros"
];

// Variáveis globais
let contas = [];
let cadastros = [];
let temaEscuro = false;
let graficoCategorias;
let graficoEvolucao;
let mesCalendarioAtual = new Date();
let ultimoSalvamento = null;

// Variáveis para edição/exclusão
let indiceParaExcluir = null;
let categoriaParaOcultar = null;
let categoriasOcultas = JSON.parse(localStorage.getItem('categoriasOcultas')) || [];

/* ==================== INICIALIZAÇÃO ==================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema Financeiro Iniciado');
    
    // Configurar data atual
    const hoje = new Date();
    document.getElementById('data').value = hoje.toISOString().slice(0, 10);
    document.getElementById('filtroMes').value = hoje.toISOString().slice(0, 7);
    document.getElementById('mesCalendario').value = hoje.toISOString().slice(0, 7);
    
    // Carregar dados salvos
    carregarDados();
    
    // Configurar tema
    const temaSalvo = localStorage.getItem('temaEscuro') === 'true';
    temaEscuro = temaSalvo;
    aplicarTema(temaEscuro);
    document.getElementById('themeToggle').checked = temaEscuro;
    
    // Event listeners
    document.getElementById('themeToggle').addEventListener('change', alternarTema);
    
    // Iniciar salvamento automático
    iniciarSalvamentoAutomatico();
    
    // Mostrar dica na primeira visita
    if (!localStorage.getItem('primeiro_acesso')) {
        setTimeout(() => {
            mostrarDicaInicial();
        }, 1500);
        localStorage.setItem('primeiro_acesso', 'true');
    }
});

/* ==================== SISTEMA DE SALVAMENTO AUTOMÁTICO ==================== */

function carregarDados() {
    console.log('📂 Carregando dados...');
    
    let dadosCarregados = false;
    
    // Tentar carregar do localStorage principal
    try {
        const dadosSalvos = localStorage.getItem(STORAGE_KEY);
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            contas = dados.contas || [];
            cadastros = dados.cadastros || [];
            temaEscuro = dados.temaEscuro || false;
            ultimoSalvamento = dados.ultimoSalvamento || new Date().toISOString();
            
            // Carregar categorias ocultas
            if (dados.categoriasOcultas) {
                categoriasOcultas = dados.categoriasOcultas;
            }
            
            console.log('✅ Dados carregados com sucesso');
            dadosCarregados = true;
        }
    } catch (e) {
        console.warn('⚠ Erro ao carregar dados principais:', e);
    }
    
    // Tentar carregar do backup se o principal falhou
    if (!dadosCarregados) {
        try {
            const backupSalvo = localStorage.getItem(BACKUP_KEY);
            if (backupSalvo) {
                const backup = JSON.parse(backupSalvo);
                if (backup.c && Array.isArray(backup.c)) {
                    contas = backup.c.map(item => ({
                        categoria: item.cat,
                        valor: item.v,
                        data: item.d,
                        status: item.s
                    }));
                    cadastros = backup.cad || [];
                    console.log('✅ Dados restaurados do backup');
                    dadosCarregados = true;
                    
                    // Salvar no principal novamente
                    salvarDados();
                }
            }
        } catch (e) {
            console.warn('⚠ Backup também falhou');
        }
    }
    
    // Criar dados iniciais se não houver nada
    if (!dadosCarregados || contas.length === 0) {
        console.log('📝 Criando dados iniciais...');
        criarDadosIniciais();
    }
    
    // Atualizar interface
    atualizarSelectCategorias();
    atualizarCadastros();
    atualizarListaCategoriasPadrao();
    renderizar();
}

function salvarDados() {
    const dados = {
        contas: contas,
        cadastros: cadastros,
        categoriasOcultas: categoriasOcultas,
        temaEscuro: temaEscuro,
        ultimoSalvamento: new Date().toISOString(),
        versao: '2.0'
    };
    
    try {
        // Salvar no localStorage principal
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        
        // Salvar backup compacto
        const backupCompacto = {
            c: contas.map(conta => ({
                cat: conta.categoria,
                v: conta.valor,
                d: conta.data,
                s: conta.status
            })),
            cad: cadastros,
            ocultas: categoriasOcultas,
            t: Date.now()
        };
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backupCompacto));
        
        // Atualizar timestamp
        localStorage.setItem('ultima_atualizacao', Date.now().toString());
        localStorage.setItem('total_contas', contas.length.toString());
        
        ultimoSalvamento = dados.ultimoSalvamento;
        
        // Atualizar status no modal
        atualizarStatusModal();
        
        console.log('💾 Dados salvos automaticamente');
        mostrarStatusSalvamento();
        
    } catch (e) {
        console.error('⚠ Erro ao salvar dados:', e);
        
        // Tentar limpar cache e salvar novamente
        if (e.name === 'QuotaExceededError') {
            limparCacheAutomatico();
            salvarDadosEssenciais();
        }
    }
}

function salvarDadosEssenciais() {
    // Salvar apenas o essencial
    const dadosEssenciais = {
        contas: contas.slice(-100), // Últimas 100 contas
        cadastros: cadastros,
        categoriasOcultas: categoriasOcultas,
        temaEscuro: temaEscuro
    };
    
    try {
        localStorage.setItem(STORAGE_KEY + '_lite', JSON.stringify(dadosEssenciais));
        console.log('💾 Dados essenciais salvos');
    } catch (e) {
        console.error('⚠ Não foi possível salvar dados essenciais');
    }
}

function limparCacheAutomatico() {
    // Manter apenas as chaves importantes
    const chavesImportantes = [
        STORAGE_KEY,
        BACKUP_KEY,
        'ultima_atualizacao',
        'temaEscuro',
        'primeiro_acesso'
    ];
    
    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (!chavesImportantes.includes(chave) && 
            !chave.startsWith(STORAGE_KEY)) {
            localStorage.removeItem(chave);
        }
    }
    console.log('🧹 Cache limpo automaticamente');
}

function iniciarSalvamentoAutomatico() {
    // Salvar a cada 30 segundos
    setInterval(() => {
        if (houveAlteracoes()) {
            salvarDados();
        }
    }, 30000);
    
    // Salvar quando a página for fechada
    window.addEventListener('beforeunload', salvarDados);
    
    // Salvar quando a página for minimizada
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            salvarDados();
        }
    });
    
    // Salvar quando houver alterações de rede
    window.addEventListener('online', salvarDados);
    
    console.log('🔄 Sistema de salvamento automático iniciado');
}

function houveAlteracoes() {
    const ultimoTotal = parseInt(localStorage.getItem('total_contas') || '0');
    return contas.length !== ultimoTotal;
}

function mostrarStatusSalvamento() {
    const status = document.getElementById('statusSalvamento');
    if (status) {
        status.innerHTML = '<i class="fas fa-check-circle"></i> Dados salvos agora';
        status.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            status.innerHTML = '<i class="fas fa-check-circle"></i> Dados salvos automaticamente';
            status.style.background = 'var(--success-color)';
        }, 2000);
    }
}

/* ==================== FUNÇÕES PRINCIPAIS ==================== */

function alternarTema() {
    temaEscuro = document.getElementById('themeToggle').checked;
    aplicarTema(temaEscuro);
    localStorage.setItem('temaEscuro', temaEscuro);
    salvarDados();
}

function aplicarTema(escuro) {
    if (escuro) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
}

function adicionarConta() {
    const categoria = document.getElementById('categoria').value;
    const valorInput = document.getElementById('valor').value;
    const valor = parseFloat(valorInput.replace(',', '.'));
    const data = document.getElementById('data').value;
    const status = document.getElementById('status').value;

    if (!categoria || !valorInput || !data) {
        mostrarAlerta('Preencha todos os campos!', 'error');
        return;
    }

    if (isNaN(valor) || valor <= 0) {
        mostrarAlerta('Valor inválido!', 'error');
        return;
    }

    contas.push({ categoria, valor, data, status });
    
    document.getElementById('valor').value = '';
    document.getElementById('data').value = new Date().toISOString().slice(0, 10);
    
    salvarDados();
    renderizar();
    renderizarCalendario();
    atualizarGraficos();
    
    mostrarAlerta('Conta adicionada e salva automaticamente!', 'success');
}

function mostrarAlerta(mensagem, tipo) {
    const alerta = document.getElementById('alerta');
    alerta.textContent = mensagem;
    alerta.className = 'alerta';
    
    switch(tipo) {
        case 'success':
            alerta.style.background = 'var(--success-color)';
            break;
        case 'error':
            alerta.style.background = 'var(--danger-color)';
            break;
        case 'warning':
            alerta.style.background = 'var(--warning-color)';
            break;
        case 'info':
            alerta.style.background = 'var(--info-color)';
            break;
    }
    
    setTimeout(() => {
        alerta.textContent = '';
        alerta.className = '';
    }, 3000);
}

function diasParaVencer(data) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const venc = new Date(data);
    venc.setHours(0, 0, 0, 0);
    return Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
}

function renderizar() {
    const lista = document.getElementById('listaContas');
    const filtroMes = document.getElementById('filtroMes').value;
    const filtroCategoria = document.getElementById('filtroCategoria').value;
    const filtroStatus = document.getElementById('filtroStatus').value;
    
    lista.innerHTML = '';
    
    let totalGeral = 0;
    let totalPago = 0;
    let totalPendente = 0;
    let alertas = 0;
    
    // Atualizar filtro de categorias
    atualizarFiltroCategorias();
    
    contas.forEach((conta, index) => {
        // Aplicar filtros
        if (filtroMes && !conta.data.startsWith(filtroMes)) return;
        if (filtroCategoria && conta.categoria !== filtroCategoria) return;
        if (filtroStatus && conta.status !== filtroStatus) return;
        
        // Calcular totais
        totalGeral += conta.valor;
        if (conta.status === 'Pago') {
            totalPago += conta.valor;
        } else {
            totalPendente += conta.valor;
        }
        
        // Verificar alertas
        const dias = diasParaVencer(conta.data);
        let classe = '';
        if (conta.status === 'Pendente') {
            if (dias < 0) {
                classe = 'atrasada';
                alertas++;
            } else if (dias <= 7) {
                classe = 'vencendo';
                alertas++;
            }
        }
        
        // Criar linha da tabela
        const tr = document.createElement('tr');
        if (classe) tr.className = classe;
        
        tr.innerHTML = `
            <td contenteditable="true" onblur="editarConta(${index}, 'categoria', this.innerText)">${conta.categoria}</td>
            <td contenteditable="true" onblur="editarConta(${index}, 'valor', this.innerText)">R$ ${conta.valor.toFixed(2)}</td>
            <td contenteditable="true" onblur="editarConta(${index}, 'data', this.innerText)">${formatarData(conta.data)}</td>
            <td>
                <select onchange="editarConta(${index}, 'status', this.value)">
                    <option value="Pendente" ${conta.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                    <option value="Pago" ${conta.status === 'Pago' ? 'selected' : ''}>Pago</option>
                </select>
            </td>
            <td>
                <button onclick="excluirConta(${index})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        
        lista.appendChild(tr);
    });
    
    // Atualizar totais
    document.getElementById('totalGeral').textContent = totalGeral.toFixed(2);
    document.getElementById('totalPago').textContent = totalPago.toFixed(2);
    document.getElementById('totalPendente').textContent = totalPendente.toFixed(2);
    document.getElementById('totalAlertas').textContent = alertas;
    
    // Mostrar alerta se houver contas vencendo
    if (alertas > 0) {
        mostrarAlerta(`⚠ Você tem ${alertas} conta(s) vencendo ou próximas do vencimento!`, 'warning');
    }
}

function formatarData(dataStr) {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
}

function editarConta(index, campo, valor) {
    if (campo === 'valor') {
        valor = parseFloat(valor.replace('R$', '').replace('.', '').replace(',', '.').trim());
        if (isNaN(valor)) return renderizar();
    }
    
    contas[index][campo] = valor;
    salvarDados();
    renderizar();
    renderizarCalendario();
    atualizarGraficos();
}

function excluirConta(index) {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
        contas.splice(index, 1);
        salvarDados();
        renderizar();
        renderizarCalendario();
        atualizarGraficos();
        mostrarAlerta('Conta excluída!', 'success');
    }
}

function salvarCadastro() {
    const nome = document.getElementById('nomeCadastro').value.trim();
    
    if (!nome) {
        mostrarAlerta('Digite um nome para a categoria!', 'error');
        return;
    }
    
    if (cadastros.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
        mostrarAlerta('Esta categoria já existe!', 'error');
        return;
    }
    
    cadastros.push({
        nome,
        dataCriacao: new Date().toISOString()
    });
    
    document.getElementById('nomeCadastro').value = '';
    salvarDados();
    atualizarCadastros();
    atualizarSelectCategorias();
    mostrarAlerta('Categoria salva automaticamente!', 'success');
}

function atualizarCadastros() {
    const lista = document.getElementById('listaCadastros');
    lista.innerHTML = '';
    
    cadastros.forEach((cadastro, index) => {
        // Verificar se a categoria está em uso
        const contasComCategoria = contas.filter(c => c.categoria === cadastro.nome);
        const estaEmUso = contasComCategoria.length > 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="editavel" onclick="abrirEditarModal(${index})" title="Clique para editar">
                ${cadastro.nome}
                ${estaEmUso ? `<span class="badge-contas">${contasComCategoria.length}</span>` : ''}
            </td>
            <td>${formatarData(cadastro.dataCriacao)}</td>
            <td class="acao-rapida">
                <button onclick="abrirEditarModal(${index})" class="btn-editar-tabela" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="abrirConfirmarExclusao(${index})" class="btn-excluir-tabela" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        lista.appendChild(tr);
    });
    
    // Atualizar estatísticas
    atualizarEstatisticasCategorias();
}

function editarCadastro(index, novoNome) {
    novoNome = novoNome.trim();
    if (!novoNome) {
        mostrarAlerta('Nome não pode ser vazio!', 'error');
        atualizarCadastros();
        return;
    }
    
    cadastros[index].nome = novoNome;
    salvarDados();
    atualizarSelectCategorias();
}

function excluirCadastro(index) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        const categoria = cadastros[index].nome;
        const contasComCategoria = contas.filter(c => c.categoria === categoria);
        
        if (contasComCategoria.length > 0) {
            if (!confirm(`Esta categoria está sendo usada em ${contasComCategoria.length} conta(s). Deseja excluir mesmo assim?`)) {
                return;
            }
        }
        
        cadastros.splice(index, 1);
        salvarDados();
        atualizarCadastros();
        atualizarSelectCategorias();
        renderizar();
        mostrarAlerta('Categoria excluída!', 'success');
    }
}

function atualizarSelectCategorias() {
    const select = document.getElementById('categoria');
    const filtroSelect = document.getElementById('filtroCategoria');
    
    select.innerHTML = '';
    filtroSelect.innerHTML = '<option value="">Todas as categorias</option>';
    
    // Adicionar categorias padrão NÃO OCULTAS
    CATEGORIAS_PADRAO.forEach(categoria => {
        if (!categoriasOcultas.includes(categoria)) {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            select.appendChild(option.cloneNode(true));
            filtroSelect.appendChild(option);
        }
    });
    
    // Adicionar categorias personalizadas
    cadastros.forEach(cadastro => {
        const option = document.createElement('option');
        option.value = cadastro.nome;
        option.textContent = cadastro.nome;
        select.appendChild(option.cloneNode(true));
        filtroSelect.appendChild(option);
    });
}

function atualizarFiltroCategorias() {
    const filtroSelect = document.getElementById('filtroCategoria');
    const categoriasExistentes = [...new Set(contas.map(c => c.categoria))];
    const selecaoAtual = filtroSelect.value;
    
    filtroSelect.innerHTML = '<option value="">Todas as categorias</option>';
    
    categoriasExistentes.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        filtroSelect.appendChild(option);
    });
    
    if (categoriasExistentes.includes(selecaoAtual)) {
        filtroSelect.value = selecaoAtual;
    }
}

function criarDadosIniciais() {
    const hoje = new Date();
    const mesAtual = hoje.toISOString().slice(0, 7);
    
    contas = [
        {
            categoria: "INTERNET",
            valor: 89.90,
            data: `${mesAtual}-05`,
            status: "Pendente"
        },
        {
            categoria: "Mercado",
            valor: 350.00,
            data: `${mesAtual}-10`,
            status: "Pago"
        },
        {
            categoria: "Academia",
            valor: 120.00,
            data: `${mesAtual}-15`,
            status: "Pendente"
        }
    ];
    
    cadastros = [
        { nome: "Aluguel", dataCriacao: new Date().toISOString() },
        { nome: "Transporte", dataCriacao: new Date().toISOString() },
        { nome: "Lazer", dataCriacao: new Date().toISOString() }
    ];
    
    temaEscuro = false;
    categoriasOcultas = [];
    
    salvarDados();
    console.log('📝 Dados iniciais criados');
}

/* ==================== GERENCIAMENTO DE CATEGORIAS PADRÃO ==================== */

function atualizarListaCategoriasPadrao() {
    const container = document.getElementById('listaCategoriasPadrao');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Filtrar categorias ativas (não ocultas)
    const categoriasAtivas = CATEGORIAS_PADRAO.filter(
        cat => !categoriasOcultas.includes(cat)
    );
    
    // Mostrar todas as categorias
    const todasCategorias = [
        ...categoriasAtivas.map(cat => ({ nome: cat, oculta: false })),
        ...categoriasOcultas.map(cat => ({ nome: cat, oculta: true }))
    ];
    
    // Adicionar cada categoria
    todasCategorias.forEach(categoria => {
        // Verificar se está sendo usada em contas
        const contasComCategoria = contas.filter(c => c.categoria === categoria.nome);
        const estaEmUso = contasComCategoria.length > 0;
        
        const item = document.createElement('div');
        item.className = `categoria-padrao-item ${categoria.oculta ? 'categoria-oculta' : ''}`;
        
        item.innerHTML = `
            <div class="categoria-info">
                <span class="categoria-nome">
                    ${categoria.nome}
                    ${estaEmUso ? `<span class="badge-contas">${contasComCategoria.length}</span>` : ''}
                </span>
                <span class="categoria-status ${categoria.oculta ? 'status-oculta' : estaEmUso ? 'status-em-uso' : 'status-ativa'}">
                    ${categoria.oculta ? '❌ Ocultada' : estaEmUso ? '✅ Em uso' : '✅ Visível'}
                </span>
            </div>
            <div class="categoria-acoes">
                ${categoria.oculta ? 
                    `<button onclick="mostrarCategoriaPadrao('${categoria.nome}')" class="btn-mostrar" title="Mostrar categoria">
                        <i class="fas fa-eye"></i> Mostrar
                    </button>` : 
                    `<button onclick="abrirOcultarCategoriaModal('${categoria.nome}')" class="btn-ocultar" title="Ocultar categoria">
                        <i class="fas fa-eye-slash"></i> Ocultar
                    </button>`
                }
                ${estaEmUso ? '' : 
                    `<button onclick="removerCategoriaPadrao('${categoria.nome}')" class="btn-excluir-tabela" title="Remover permanentemente">
                        <i class="fas fa-times"></i>
                    </button>`
                }
            </div>
        `;
        
        container.appendChild(item);
    });
    
    // Atualizar estatísticas
    atualizarEstatisticasCategorias();
}

function atualizarEstatisticasCategorias() {
    // Contar categorias visíveis
    const categoriasVisiveis = CATEGORIAS_PADRAO.filter(
        cat => !categoriasOcultas.includes(cat)
    ).length;
    
    // Contar categorias em uso
    const categoriasEmUsoSet = new Set(contas.map(c => c.categoria));
    const categoriasPadraoEmUso = CATEGORIAS_PADRAO.filter(
        cat => categoriasEmUsoSet.has(cat)
    ).length;
    
    // Atualizar estatísticas
    document.getElementById('totalCategorias').textContent = cadastros.length + CATEGORIAS_PADRAO.length;
    document.getElementById('categoriasVisiveis').textContent = categoriasVisiveis;
    document.getElementById('categoriasOcultas').textContent = categoriasOcultas.length;
    document.getElementById('categoriasEmUso').textContent = categoriasPadraoEmUso;
}

function abrirOcultarCategoriaModal(nomeCategoria) {
    categoriaParaOcultar = nomeCategoria;
    
    // Verificar se a categoria está em uso
    const contasComCategoria = contas.filter(c => c.categoria === nomeCategoria);
    const totalContas = contasComCategoria.length;
    
    document.getElementById('mensagemOcultar').textContent = 
        `Tem certeza que deseja ocultar a categoria "${nomeCategoria}"?`;
    
    let infoHTML = '';
    if (totalContas > 0) {
        infoHTML = `
            <p><strong>⚠ ATENÇÃO:</strong> Esta categoria está em uso!</p>
            <p>• <strong>${totalContas} conta(s)</strong> usam esta categoria</p>
            <p>• A categoria será removida dos menus, mas as contas continuarão</p>
            <p style="font-size: 12px; color: var(--warning-color); margin-top: 10px;">
                <i class="fas fa-info-circle"></i> Você poderá mostrar novamente a qualquer momento
            </p>
        `;
    } else {
        infoHTML = `
            <p><i class="fas fa-info-circle"></i> Esta categoria não está sendo usada.</p>
            <p style="font-size: 12px; margin-top: 5px;">A categoria será removida dos menus de seleção.</p>
        `;
    }
    
    document.getElementById('infoOcultar').innerHTML = infoHTML;
    
    // Mostrar modal
    document.getElementById('ocultarCategoriaModal').style.display = 'flex';
}

function fecharOcultarModal() {
    document.getElementById('ocultarCategoriaModal').style.display = 'none';
    categoriaParaOcultar = null;
}

function confirmarOcultarCategoria() {
    if (!categoriaParaOcultar) return;
    
    if (!categoriasOcultas.includes(categoriaParaOcultar)) {
        categoriasOcultas.push(categoriaParaOcultar);
        salvarDados();
        atualizarListaCategoriasPadrao();
        atualizarSelectCategorias();
        renderizar();
        
        mostrarAlerta(`Categoria "${categoriaParaOcultar}" ocultada com sucesso!`, 'warning');
    }
    
    fecharOcultarModal();
}

function mostrarCategoriaPadrao(nomeCategoria) {
    const index = categoriasOcultas.indexOf(nomeCategoria);
    if (index > -1) {
        categoriasOcultas.splice(index, 1);
        salvarDados();
        atualizarListaCategoriasPadrao();
        atualizarSelectCategorias();
        
        mostrarAlerta(`Categoria "${nomeCategoria}" está visível novamente!`, 'success');
    }
}

function removerCategoriaPadrao(nomeCategoria) {
    if (confirm(`Remover permanentemente a categoria "${nomeCategoria}"?`)) {
        // Se estiver oculta, remover da lista de ocultas
        const indexOculta = categoriasOcultas.indexOf(nomeCategoria);
        if (indexOculta > -1) {
            categoriasOcultas.splice(indexOculta, 1);
        }
        
        // Se não estiver em uso, podemos removê-la
        const contasComCategoria = contas.filter(c => c.categoria === nomeCategoria);
        if (contasComCategoria.length === 0) {
            // Atualizar interface
            salvarDados();
            atualizarListaCategoriasPadrao();
            atualizarSelectCategorias();
            
            mostrarAlerta(`Categoria "${nomeCategoria}" removida permanentemente!`, 'success');
        } else {
            mostrarAlerta(`Não é possível remover: categoria em uso em ${contasComCategoria.length} conta(s)`, 'error');
        }
    }
}

function filtrarCategorias(tipo) {
    const botoes = document.querySelectorAll('.filtro-categorias button');
    botoes.forEach(btn => btn.classList.remove('ativo'));
    event.target.classList.add('ativo');
    
    const container = document.getElementById('listaCategoriasPadrao');
    const itens = container.querySelectorAll('.categoria-padrao-item');
    
    itens.forEach(item => {
        const estaOculta = item.classList.contains('categoria-oculta');
        const nome = item.querySelector('.categoria-nome').textContent.trim();
        const contasComCategoria = contas.filter(c => c.categoria === nome).length;
        const estaEmUso = contasComCategoria > 0;
        
        let mostrar = true;
        
        switch(tipo) {
            case 'ativas':
                mostrar = !estaOculta;
                break;
            case 'ocultas':
                mostrar = estaOculta;
                break;
            case 'em-uso':
                mostrar = estaEmUso;
                break;
            case 'todas':
            default:
                mostrar = true;
        }
        
        item.style.display = mostrar ? 'flex' : 'none';
    });
}

function ocultarTodasCategorias() {
    if (confirm('Ocultar TODAS as categorias padrão?')) {
        // Adicionar todas as categorias que não estão ocultas
        CATEGORIAS_PADRAO.forEach(cat => {
            if (!categoriasOcultas.includes(cat)) {
                categoriasOcultas.push(cat);
            }
        });
        
        salvarDados();
        atualizarListaCategoriasPadrao();
        atualizarSelectCategorias();
        renderizar();
        
        mostrarAlerta('Todas as categorias padrão foram ocultadas!', 'warning');
    }
}

function mostrarTodasCategorias() {
    if (confirm('Mostrar TODAS as categorias padrão?')) {
        categoriasOcultas = [];
        salvarDados();
        atualizarListaCategoriasPadrao();
        atualizarSelectCategorias();
        
        mostrarAlerta('Todas as categorias padrão estão visíveis!', 'success');
    }
}

function restaurarCategoriasPadrao() {
    if (confirm('Restaurar todas as categorias padrão para o estado original?')) {
        categoriasOcultas = [];
        salvarDados();
        atualizarListaCategoriasPadrao();
        atualizarSelectCategorias();
        renderizar();
        
        mostrarAlerta('Categorias padrão restauradas com sucesso!', 'success');
    }
}

/* ==================== CALENDÁRIO ==================== */

function renderizarCalendario() {
    const mesInput = document.getElementById('mesCalendario').value;
    if (!mesInput) return;
    
    const [ano, mes] = mesInput.split('-').map(Number);
    mesCalendarioAtual = new Date(ano, mes - 1, 1);
    
    const divCalendario = document.getElementById('calendarioMes');
    divCalendario.innerHTML = '';
    
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(dia => {
        const divDia = document.createElement('div');
        divDia.className = 'diaCalendario';
        divDia.innerHTML = `<b>${dia}</b>`;
        divDia.style.fontWeight = 'bold';
        divDia.style.textAlign = 'center';
        divCalendario.appendChild(divDia);
    });
    
    const primeiroDia = new Date(ano, mes - 1, 1);
    const ultimoDia = new Date(ano, mes, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();
    
    for (let i = 0; i < diaSemanaInicio; i++) {
        const divVazio = document.createElement('div');
        divVazio.className = 'diaCalendario';
        divCalendario.appendChild(divVazio);
    }
    
    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const divDia = document.createElement('div');
        divDia.className = 'diaCalendario';
        divDia.innerHTML = `<b>${dia}</b>`;
        
        const contasDia = contas.filter(c => c.data === dataStr);
        
        contasDia.forEach(conta => {
            const divConta = document.createElement('div');
            divConta.textContent = `${conta.categoria}: R$ ${conta.valor.toFixed(2)}`;
            
            if (conta.status === 'Pendente') {
                const dias = diasParaVencer(conta.data);
                if (dias < 0) {
                    divConta.className = 'diaAtrasada';
                } else if (dias <= 7) {
                    divConta.className = 'diaVencendo';
                }
            }
            
            divDia.appendChild(divConta);
        });
        
        divCalendario.appendChild(divDia);
    }
}

function mesAnterior() {
    mesCalendarioAtual.setMonth(mesCalendarioAtual.getMonth() - 1);
    atualizarInputCalendario();
    renderizarCalendario();
}

function proximoMes() {
    mesCalendarioAtual.setMonth(mesCalendarioAtual.getMonth() + 1);
    atualizarInputCalendario();
    renderizarCalendario();
}

function mesAtual() {
    mesCalendarioAtual = new Date();
    atualizarInputCalendario();
    renderizarCalendario();
}

function atualizarInputCalendario() {
    const ano = mesCalendarioAtual.getFullYear();
    const mes = String(mesCalendarioAtual.getMonth() + 1).padStart(2, '0');
    document.getElementById('mesCalendario').value = `${ano}-${mes}`;
}

/* ==================== GRÁFICOS ==================== */

function atualizarGraficos() {
    const tipo = document.getElementById('tipoGrafico').value;
    const periodo = document.getElementById('periodoGrafico').value;
    
    atualizarGraficoCategorias(tipo, periodo);
    atualizarGraficoEvolucao(periodo);
}

function atualizarGraficoCategorias(tipo = 'bar', periodo = 'mes') {
    const ctx = document.getElementById('graficoCategorias').getContext('2d');
    
    if (graficoCategorias) {
        graficoCategorias.destroy();
    }
    
    let dadosFiltrados = contas;
    const hoje = new Date();
    
    if (periodo === 'mes') {
        const mesAtual = hoje.toISOString().slice(0, 7);
        dadosFiltrados = contas.filter(c => c.data.startsWith(mesAtual));
    } else if (periodo === 'ano') {
        const anoAtual = hoje.getFullYear();
        dadosFiltrados = contas.filter(c => new Date(c.data).getFullYear() === anoAtual);
    }
    
    const categorias = {};
    dadosFiltrados.forEach(conta => {
        if (!categorias[conta.categoria]) {
            categorias[conta.categoria] = 0;
        }
        categorias[conta.categoria] += conta.valor;
    });
    
    const categoriasOrdenadas = Object.entries(categorias)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = categoriasOrdenadas.map(item => item[0]);
    const valores = categoriasOrdenadas.map(item => item[1]);
    
    const cores = labels.map((_, i) => {
        const hue = (i * 137.508) % 360;
        return temaEscuro 
            ? `hsla(${hue}, 70%, 60%, 0.7)`
            : `hsla(${hue}, 80%, 60%, 0.7)`;
    });
    
    graficoCategorias = new Chart(ctx, {
        type: tipo,
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor (R$)',
                data: valores,
                backgroundColor: cores,
                borderColor: cores.map(c => c.replace('0.7', '1')),
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: temaEscuro ? '#fff' : '#333',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `R$ ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: tipo === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: temaEscuro ? '#fff' : '#333',
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: temaEscuro ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: temaEscuro ? '#fff' : '#333'
                    },
                    grid: {
                        color: temaEscuro ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                }
            } : undefined
        }
    });
}

function atualizarGraficoEvolucao(periodo = 'mes') {
    const ctx = document.getElementById('graficoEvolucao').getContext('2d');
    
    if (graficoEvolucao) {
        graficoEvolucao.destroy();
    }
    
    const dadosPorMes = {};
    
    contas.forEach(conta => {
        const mes = conta.data.slice(0, 7);
        if (!dadosPorMes[mes]) {
            dadosPorMes[mes] = { total: 0, pago: 0, pendente: 0 };
        }
        
        dadosPorMes[mes].total += conta.valor;
        if (conta.status === 'Pago') {
            dadosPorMes[mes].pago += conta.valor;
        } else {
            dadosPorMes[mes].pendente += conta.valor;
        }
    });
    
    const meses = Object.keys(dadosPorMes).sort();
    const ultimos12Meses = meses.slice(-12);
    
    const labels = ultimos12Meses.map(mes => {
        const [ano, mesNum] = mes.split('-');
        return `${mesNum}/${ano.slice(2)}`;
    });
    
    const totais = ultimos12Meses.map(mes => dadosPorMes[mes].total);
    const pagos = ultimos12Meses.map(mes => dadosPorMes[mes].pago);
    const pendentes = ultimos12Meses.map(mes => dadosPorMes[mes].pendente);
    
    graficoEvolucao = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total',
                    data: totais,
                    borderColor: temaEscuro ? '#4361ee' : '#3a0ca3',
                    backgroundColor: temaEscuro ? 'rgba(67, 97, 238, 0.1)' : 'rgba(58, 12, 163, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Pago',
                    data: pagos,
                    borderColor: temaEscuro ? '#2ecc71' : '#27ae60',
                    backgroundColor: temaEscuro ? 'rgba(46, 204, 113, 0.1)' : 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Pendente',
                    data: pendentes,
                    borderColor: temaEscuro ? '#e74c3c' : '#c0392b',
                    backgroundColor: temaEscuro ? 'rgba(231, 76, 60, 0.1)' : 'rgba(192, 57, 43, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: temaEscuro ? '#fff' : '#333',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: R$ ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: temaEscuro ? '#fff' : '#333',
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: temaEscuro ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: temaEscuro ? '#fff' : '#333'
                    },
                    grid: {
                        color: temaEscuro ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

/* ==================== NAVEGAÇÃO ==================== */

function abrirAba(id) {
    document.querySelectorAll('.aba').forEach(aba => {
        aba.classList.remove('ativa');
    });
    document.querySelector(`.aba[onclick="abrirAba('${id}')"]`).classList.add('ativa');
    
    document.querySelectorAll('.conteudo-aba').forEach(conteudo => {
        conteudo.classList.remove('ativo');
    });
    document.getElementById(id).classList.add('ativo');
    
    if (id === 'graficos') {
        atualizarGraficos();
    }
    
    if (id === 'calendario') {
        renderizarCalendario();
    }
}

/* ==================== EDIÇÃO DE CATEGORIAS ==================== */

function abrirEditarModal(index) {
    if (index < 0 || index >= cadastros.length) {
        mostrarAlerta('Categoria não encontrada!', 'error');
        return;
    }
    
    const categoria = cadastros[index];
    document.getElementById('editarNome').value = categoria.nome;
    document.getElementById('editarIndex').value = index;
    
    // Mostrar modal
    document.getElementById('editarModal').style.display = 'flex';
    
    // Focar no campo
    setTimeout(() => {
        const input = document.getElementById('editarNome');
        input.focus();
        input.select();
    }, 100);
}

function fecharEditarModal() {
    document.getElementById('editarModal').style.display = 'none';
    document.getElementById('editarNome').value = '';
    document.getElementById('editarIndex').value = '';
}

function salvarEdicao() {
    const index = parseInt(document.getElementById('editarIndex').value);
    const novoNome = document.getElementById('editarNome').value.trim();
    
    if (isNaN(index) || index < 0 || index >= cadastros.length) {
        mostrarAlerta('Categoria não encontrada!', 'error');
        return;
    }
    
    if (!novoNome) {
        mostrarAlerta('Digite um nome para a categoria!', 'error');
        return;
    }
    
    if (novoNome.length < 2) {
        mostrarAlerta('O nome deve ter pelo menos 2 caracteres!', 'error');
        return;
    }
    
    const nomeAntigo = cadastros[index].nome;
    
    // Verificar se já existe (ignorando a própria)
    const categoriaExistente = cadastros.find((c, i) => 
        i !== index && c.nome.toLowerCase() === novoNome.toLowerCase()
    );
    
    if (categoriaExistente) {
        mostrarAlerta(`Já existe uma categoria chamada "${novoNome}"!`, 'error');
        return;
    }
    
    // Atualizar categoria
    cadastros[index].nome = novoNome;
    
    // Atualizar TODAS as contas que usavam o nome antigo
    let contasAtualizadas = 0;
    contas.forEach(conta => {
        if (conta.categoria === nomeAntigo) {
            conta.categoria = novoNome;
            contasAtualizadas++;
        }
    });
    
    // Salvar dados
    salvarDados();
    
    // Atualizar interface
    atualizarCadastros();
    atualizarSelectCategorias();
    renderizar();
    
    // Mostrar mensagem de sucesso
    let mensagem = `Categoria alterada: "${nomeAntigo}" → "${novoNome}"`;
    if (contasAtualizadas > 0) {
        mensagem += ` (${contasAtualizadas} conta(s) atualizada(s))`;
    }
    
    mostrarAlerta(mensagem, 'success');
    fecharEditarModal();
}

/* ==================== EXCLUSÃO DE CATEGORIAS ==================== */

function abrirConfirmarExclusao(index) {
    if (index < 0 || index >= cadastros.length) {
        mostrarAlerta('Categoria não encontrada!', 'error');
        return;
    }
    
    const categoria = cadastros[index];
    indiceParaExcluir = index;
    
    // Verificar quantas contas usam esta categoria
    const contasComCategoria = contas.filter(c => c.categoria === categoria.nome);
    const totalContas = contasComCategoria.length;
    
    // Montar mensagem
    const mensagem = totalContas > 0 
        ? `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`
        : `Excluir a categoria "${categoria.nome}"?`;
    
    document.getElementById('mensagemExclusao').textContent = mensagem;
    
    // Montar informações detalhadas
    let infoHTML = '';
    if (totalContas > 0) {
        infoHTML = `
            <p><strong>⚠ ATENÇÃO:</strong> Esta categoria está em uso!</p>
            <p>• <strong>${totalContas} conta(s)</strong> usam esta categoria</p>
            <p>• Todas as contas serão excluídas junto com a categoria</p>
            <p style="font-size: 12px; color: var(--danger-color); margin-top: 10px;">
                <i class="fas fa-exclamation-circle"></i> Esta ação não pode ser desfeita!
            </p>
        `;
    } else {
        infoHTML = `
            <p><i class="fas fa-info-circle"></i> Esta categoria não está sendo usada em nenhuma conta.</p>
            <p style="font-size: 12px; margin-top: 5px;">A exclusão será permanente.</p>
        `;
    }
    
    document.getElementById('infoExclusao').innerHTML = infoHTML;
    
    // Mostrar modal
    document.getElementById('confirmarExclusaoModal').style.display = 'flex';
}

function fecharConfirmarExclusao() {
    document.getElementById('confirmarExclusaoModal').style.display = 'none';
    indiceParaExcluir = null;
}

function confirmarExclusao() {
    if (indiceParaExcluir === null || indiceParaExcluir < 0 || indiceParaExcluir >= cadastros.length) {
        mostrarAlerta('Erro ao excluir categoria!', 'error');
        return;
    }
    
    const categoria = cadastros[indiceParaExcluir];
    const nomeCategoria = categoria.nome;
    
    // Verificar contas que usam esta categoria
    const contasParaRemover = contas.filter(c => c.categoria === nomeCategoria);
    const totalContas = contasParaRemover.length;
    
    // Remover a categoria
    cadastros.splice(indiceParaExcluir, 1);
    
    // Remover contas associadas (se houver)
    if (totalContas > 0) {
        // Filtrar apenas contas que NÃO usam esta categoria
        contas = contas.filter(c => c.categoria !== nomeCategoria);
    }
    
    // Salvar dados
    salvarDados();
    
    // Atualizar interface
    atualizarCadastros();
    atualizarSelectCategorias();
    renderizar();
    atualizarGraficos();
    
    // Mostrar mensagem
    let mensagem = `Categoria "${nomeCategoria}" excluída com sucesso!`;
    if (totalContas > 0) {
        mensagem += ` (${totalContas} conta(s) também removida(s))`;
    }
    
    mostrarAlerta(mensagem, 'success');
    fecharConfirmarExclusao();
}

/* ==================== NOVAS FUNCIONALIDADES DE CATEGORIA ==================== */

function mostrarModalNovaCategoria() {
    document.getElementById('novaCategoriaModal').style.display = 'flex';
    document.getElementById('novaCategoriaNome').value = '';
    document.getElementById('novaCategoriaTipo').value = '';
    
    setTimeout(() => {
        document.getElementById('novaCategoriaNome').focus();
    }, 100);
}

function fecharNovaCategoriaModal() {
    document.getElementById('novaCategoriaModal').style.display = 'none';
}

function salvarNovaCategoria() {
    const nome = document.getElementById('novaCategoriaNome').value.trim();
    const tipo = document.getElementById('novaCategoriaTipo').value;
    
    if (!nome) {
        mostrarAlerta('Digite um nome para a categoria!', 'error');
        return;
    }
    
    if (nome.length < 2) {
        mostrarAlerta('O nome deve ter pelo menos 2 caracteres!', 'error');
        return;
    }
    
    // Verificar se já existe
    if (cadastros.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
        mostrarAlerta(`Já existe uma categoria chamada "${nome}"!`, 'error');
        return;
    }
    
    // Verificar se é uma categoria padrão
    if (CATEGORIAS_PADRAO.includes(nome)) {
        mostrarAlerta(`"${nome}" já é uma categoria padrão do sistema!`, 'error');
        return;
    }
    
    // Adicionar nova categoria
    cadastros.push({
        nome: nome,
        tipo: tipo || 'outros',
        dataCriacao: new Date().toISOString(),
        criadoPor: 'usuário'
    });
    
    salvarDados();
    atualizarCadastros();
    atualizarSelectCategorias();
    
    mostrarAlerta(`Categoria "${nome}" criada com sucesso!`, 'success');
    fecharNovaCategoriaModal();
}

function exportarCategorias() {
    const dados = {
        categorias: cadastros,
        categoriasOcultas: categoriasOcultas,
        dataExportacao: new Date().toISOString(),
        total: cadastros.length
    };
    
    const dadosStr = JSON.stringify(dados, null, 2);
    const blob = new Blob([dadosStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `categorias_financeiro_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarAlerta('Categorias exportadas com sucesso!', 'success');
}

function importarCategorias(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (!dados.categorias || !Array.isArray(dados.categorias)) {
                throw new Error('Arquivo inválido');
            }
            
            if (confirm(`Importar ${dados.categorias.length} categorias?`)) {
                // Adicionar novas categorias (evitando duplicatas)
                dados.categorias.forEach(novaCategoria => {
                    const existe = cadastros.some(c => 
                        c.nome.toLowerCase() === novaCategoria.nome.toLowerCase()
                    );
                    
                    if (!existe) {
                        cadastros.push({
                            nome: novaCategoria.nome,
                            dataCriacao: novaCategoria.dataCriacao || new Date().toISOString(),
                            tipo: novaCategoria.tipo || 'outros'
                        });
                    }
                });
                
                // Importar categorias ocultas se existirem
                if (dados.categoriasOcultas && Array.isArray(dados.categoriasOcultas)) {
                    categoriasOcultas = dados.categoriasOcultas;
                }
                
                salvarDados();
                atualizarCadastros();
                atualizarSelectCategorias();
                atualizarListaCategoriasPadrao();
                
                mostrarAlerta(`${dados.categorias.length} categorias importadas!`, 'success');
            }
        } catch (error) {
            mostrarAlerta('Erro ao importar categorias: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

/* ==================== BACKUP E PERSISTÊNCIA ==================== */

function mostrarModalBackup() {
    document.getElementById('backupModal').style.display = 'flex';
    atualizarStatusModal();
}

function fecharModal() {
    document.getElementById('backupModal').style.display = 'none';
}

function atualizarStatusModal() {
    const agora = new Date();
    const ultimo = ultimoSalvamento ? new Date(ultimoSalvamento) : agora;
    const diferenca = Math.floor((agora - ultimo) / 1000);
    
    let textoSalvamento = 'Agora mesmo';
    if (diferenca > 60) {
        textoSalvamento = `${Math.floor(diferenca / 60)} minutos atrás`;
    } else if (diferenca > 0) {
        textoSalvamento = `${diferenca} segundos atrás`;
    }
    
    document.getElementById('totalContasBackup').textContent = contas.length;
    document.getElementById('totalCategoriasBackup').textContent = cadastros.length + CATEGORIAS_PADRAO.length;
    document.getElementById('ultimoSalvamento').textContent = textoSalvamento;
}

function exportarBackup() {
    const dados = {
        contas,
        cadastros,
        categoriasOcultas,
        temaEscuro,
        dataExportacao: new Date().toISOString(),
        totalContas: contas.length,
        totalCategorias: cadastros.length + CATEGORIAS_PADRAO.length,
        aviso: '⚠ NÃO MARQUE "Cookies e dados de sites" AO LIMPAR HISTÓRICO'
    };
    
    const dadosStr = JSON.stringify(dados, null, 2);
    const blob = new Blob([dadosStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_financeiro_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarAlerta('Backup exportado com sucesso!', 'success');
    fecharModal();
}

function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (!dados.contas) {
                throw new Error('Arquivo de backup inválido');
            }
            
            if (confirm(`Importar ${dados.contas.length} contas e ${dados.cadastros?.length || 0} categorias?`)) {
                contas = dados.contas;
                cadastros = dados.cadastros || [];
                categoriasOcultas = dados.categoriasOcultas || [];
                
                if (dados.temaEscuro !== undefined) {
                    temaEscuro = dados.temaEscuro;
                    aplicarTema(temaEscuro);
                    document.getElementById('themeToggle').checked = temaEscuro;
                }
                
                salvarDados();
                atualizarSelectCategorias();
                atualizarCadastros();
                atualizarListaCategoriasPadrao();
                renderizar();
                atualizarGraficos();
                
                mostrarAlerta('Backup importado e salvo automaticamente!', 'success');
                fecharModal();
            }
        } catch (error) {
            mostrarAlerta('Erro ao importar: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

function mostrarDicaInicial() {
    const dica = confirm(
        '💡 DICA IMPORTANTE:\n\n' +
        'Seus dados são salvos AUTOMATICAMENTE!\n\n' +
        'Para não perder os dados ao limpar o navegador:\n' +
        '❌ NÃO marque "Cookies e dados de sites"\n' +
        '✅ Pode marcar "Histórico" e "Cache" normalmente\n\n' +
        'Deseja ver mais informações?'
    );
    
    if (dica) {
        mostrarModalBackup();
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('backupModal');
    const editarModal = document.getElementById('editarModal');
    const confirmarModal = document.getElementById('confirmarExclusaoModal');
    const novaCategoriaModal = document.getElementById('novaCategoriaModal');
    const ocultarModal = document.getElementById('ocultarCategoriaModal');
    
    if (event.target === modal) {
        fecharModal();
    }
    
    if (event.target === editarModal) {
        fecharEditarModal();
    }
    
    if (event.target === confirmarModal) {
        fecharConfirmarExclusao();
    }
    
    if (event.target === novaCategoriaModal) {
        fecharNovaCategoriaModal();
    }
    
    if (event.target === ocultarModal) {
        fecharOcultarModal();
    }
};