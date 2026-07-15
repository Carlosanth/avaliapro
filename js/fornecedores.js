// ============ FORNECEDORES ============
// ---------- ÍCONES (mesmo estilo lucide/outline usado no menu lateral) ----------
const SUP_ICON_PATHS = {
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  chart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497Z"/><path d="m15 5 4 4"/>',
  link: '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  paperclip: '<path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  alertTriangle: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  rotateCcw: '<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/>',
  moreVertical: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>'
};

function ic(nome, tamanho) {
  const s = tamanho || 14;
  return `<svg class="ic-svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SUP_ICON_PATHS[nome] || ''}</svg>`;
}

// Só corta a exibição no card — o nome de verdade (usado em relatório, certificado etc) não muda.
function truncarNomeForn(nome, max) {
  max = max || 51;
  if (!nome || nome.length <= max) return nome;
  return nome.slice(0, max).trimEnd() + '...';
}

// Quantas versões antigas de arquivo guardar por documento — depois disso, exclui a mais antiga
// (arquivo do Storage + linha da tabela) sempre que uma versão nova é criada.
const LIMITE_VERSOES_DOCUMENTO = 5;

async function limparVersoesAntigasDocumento(documentoId) {
  const { data, error } = await supabaseClient
    .from('documentos_versoes')
    .select('id, caminho_storage')
    .eq('documento_id', documentoId)
    .order('substituido_em', { ascending: false }); // mais nova primeiro

  if (error || !data || data.length <= LIMITE_VERSOES_DOCUMENTO) return;

  const excedentes = data.slice(LIMITE_VERSOES_DOCUMENTO); // o que passar do limite
  for (const v of excedentes) {
    if (v.caminho_storage) {
      await supabaseClient.storage.from('documentos-fornecedores').remove([v.caminho_storage]);
    }
    await supabaseClient.from('documentos_versoes').delete().eq('id', v.id);
  }
}

// ---------- FORNECEDORES ----------
function campoCustomInputHTML(campo, prefix, valor) {
  const id = `${prefix}${campo.chave}`;
  const v = (valor !== undefined && valor !== null) ? valor : '';
  if (campo.tipo === 'select') {
    const opcoes = campo.opcoes || [];
    return `<div class="form-group"><label>${campo.label}</label><select id="${id}"><option value="">—</option>${opcoes.map(o => `<option value="${o}" ${o === v ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
  }
  if (campo.tipo === 'data') {
    return `<div class="form-group"><label>${campo.label}</label><input type="date" id="${id}" value="${v}"></div>`;
  }
  return `<div class="form-group"><label>${campo.label}</label><input type="text" id="${id}" value="${v}"></div>`;
}

let _abaFornecedoresAtual = 'ativos';
let _filtroFornecedores = { busca: '', tipo: '', setor: '', criticidade: '', vencimento: '' };
let _novoFornecedorAberto = false;

function labelTipoFornecedor(tipo) {
  if (tipo === 'produto') return 'Produto';
  if (tipo === 'ambos') return 'Produtos e Serviços';
  return 'Serviço';
}

function optionsTipoFornecedorHTML(valorAtual) {
  return `
    <option value="servico" ${valorAtual === 'servico' ? 'selected' : ''}>Serviço</option>
    <option value="produto" ${valorAtual === 'produto' ? 'selected' : ''}>Produto</option>
    <option value="ambos" ${valorAtual === 'ambos' ? 'selected' : ''}>Produtos e Serviços</option>
  `;
}

function renderAdFornecedores() {
  const d = db();
  const vencendoCount = contarDocumentosVencendo(d);
  const totalVencendo = vencendoCount.vencidos.length + vencendoCount.proximos.length;
  const ativos = d.fornecedores.filter(f => f.ativo !== false && !f.diverso);
  const desativados = d.fornecedores.filter(f => f.ativo === false);
  const diversos = d.fornecedores.filter(f => f.ativo !== false && f.diverso);
  const setoresUnicos = [...new Set(d.fornecedores.map(f => f.setor).filter(Boolean))].sort();

  document.getElementById('ad-page-fornecedores').innerHTML = `
    <div class="page-header">
      <div><h2>Fornecedores</h2><p>Cadastro de fornecedores e arquivo de documentações (alvará, contratos, certidões etc)</p></div>
    </div>
    ${totalVencendo ? `
      <div class="alert ${vencendoCount.vencidos.length ? 'alert-danger' : 'alert-warn'}" style="display:flex; align-items:center; gap:8px; font-size:12px">
        <span style="display:flex; align-items:center; gap:10px">${vencendoCount.vencidos.length ? `<span style="display:inline-flex; align-items:center; gap:5px">${ic('alertTriangle', 13)} ${vencendoCount.vencidos.length} vencido(s)</span>` : ''}${vencendoCount.proximos.length ? `<span style="display:inline-flex; align-items:center; gap:5px">${ic('clock', 13)} ${vencendoCount.proximos.length} vencendo em breve</span>` : ''}</span>
        <span style="color:var(--text-muted); margin-left:auto">use o filtro "Vencimento" abaixo pra ver quais são</span>
      </div>` : ''}
    <div class="card" style="display:none; border-left: 3px solid var(--accent)">
      <div class="card-title" style="display:flex; align-items:center; gap:7px">${ic('inbox', 15)} Documentos enviados pelo portal — aguardando aprovação</div>
      <div id="pendentes-aprovacao-wrap"></div>
    </div>
    <div class="card sup-new-card ${_novoFornecedorAberto ? 'open' : ''}" id="novo-fornecedor-card">
      <div class="sup-new-card-header" onclick="toggleNovoFornecedorCard()">
        <div class="sup-new-icon">+</div>
        <div class="sup-new-card-title-wrap">
          <div class="sup-new-card-title">Novo fornecedor</div>
          <div class="sup-new-card-subtitle">Preencha o CNPJ para autopreencher os campos.</div>
        </div>
        <div class="sup-new-chevron">⌄</div>
      </div>
      <div class="sup-new-card-body" id="novo-fornecedor-body" style="${_novoFornecedorAberto ? '' : 'display:none'}">
        <div class="form-row" style="grid-template-columns:1fr 1fr 1fr 1fr">
          <div class="form-group"><label>CNPJ</label>
            <div style="display:flex; gap:6px">
              <input type="text" id="nf-cnpj" placeholder="00.000.000/0000-00" style="flex:1" oninput="this.value = formatarCNPJ(this.value)">
              <button type="button" class="btn btn-secondary btn-sm" onclick="buscarNomePorCnpjCadastro()" style="display:inline-flex; align-items:center; gap:6px">${ic('search', 13)} Buscar</button>
            </div>
            <p id="nf-cnpj-status" style="font-size:11px; margin-top:4px"></p>
          </div>
          <div class="form-group"><label>Nome</label><input type="text" id="nf-nome" placeholder="Nome do fornecedor"></div>
          <div class="form-group"><label>Tipo</label><select id="nf-tipo">${optionsTipoFornecedorHTML('servico')}</select></div>
          <div class="form-group"><label>Setor</label><input type="text" id="nf-setor" placeholder="Ex: Qualidade"></div>
        </div>
        <div class="form-row" style="grid-template-columns:1fr 1fr 1fr 1fr">
          <div class="form-group"><label>E-mail</label><input type="email" id="nf-email" placeholder="contato@fornecedor.com"></div>
          <div class="form-group"><label>Telefone</label><input type="text" id="nf-telefone" placeholder="(00) 00000-0000" oninput="this.value = formatarTelefone(this.value)"></div>
          <div class="form-group"><label>Endereço</label><input type="text" id="nf-endereco" placeholder="Rua, número, cidade/UF"></div>
          <div class="form-group"><label>Criticidade</label>
            <select id="nf-criticidade">
              <option value="baixa">Baixa</option>
              <option value="media" selected>Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>
        ${d.camposFornecedorCustom.length ? `<div class="form-row three">${d.camposFornecedorCustom.map(c => campoCustomInputHTML(c, 'nf-extra-')).join('')}</div>` : ''}
        <button class="btn btn-primary" onclick="addFornecedorAd()">Adicionar fornecedor</button>
        <p style="font-size:11px; color:var(--text-muted); margin-top:8px">Quer adicionar outros campos (contrato, contato, categoria etc)? Vá em <b>Configurações › Campos do fornecedor</b>.</p>
      </div>
    </div>
    <div class="card">
      <div class="tab-bar" style="margin-bottom:0">
        <button class="tab ${_abaFornecedoresAtual === 'ativos' ? 'active' : ''}" onclick="mudarAbaFornecedores('ativos')">Ativos (${ativos.length})</button>
        <button class="tab ${_abaFornecedoresAtual === 'diversos' ? 'active' : ''}" onclick="mudarAbaFornecedores('diversos')">Diversos (${diversos.length})</button>
        <button class="tab ${_abaFornecedoresAtual === 'desativados' ? 'active' : ''}" onclick="mudarAbaFornecedores('desativados')">Desativados (${desativados.length})</button>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; margin:16px 0">
        <div class="form-group" style="min-width:180px; flex:1"><label>Buscar (nome, e-mail ou CNPJ)</label><input type="text" id="ff-busca" value="${_filtroFornecedores.busca}" oninput="aplicarFiltroFornecedores()" placeholder="Digite para buscar..."></div>
        <div class="form-group" style="min-width:150px"><label>Tipo</label><select id="ff-tipo" onchange="aplicarFiltroFornecedores()"><option value="">Todos</option>${optionsTipoFornecedorHTML(_filtroFornecedores.tipo)}</select></div>
        <div class="form-group" style="min-width:150px"><label>Setor/Categoria</label><select id="ff-setor" onchange="aplicarFiltroFornecedores()"><option value="">Todos</option>${setoresUnicos.map(s => `<option value="${s}" ${_filtroFornecedores.setor === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="form-group" style="min-width:130px"><label>Criticidade</label><select id="ff-criticidade" onchange="aplicarFiltroFornecedores()"><option value="">Todas</option><option value="alta" ${_filtroFornecedores.criticidade === 'alta' ? 'selected' : ''}>Alta</option><option value="media" ${_filtroFornecedores.criticidade === 'media' ? 'selected' : ''}>Média</option><option value="baixa" ${_filtroFornecedores.criticidade === 'baixa' ? 'selected' : ''}>Baixa</option></select></div>
        <div class="form-group" style="min-width:170px"><label>Vencimento</label><select id="ff-vencimento" onchange="aplicarFiltroFornecedores()"><option value="">Todos</option><option value="proximo" ${_filtroFornecedores.vencimento === 'proximo' ? 'selected' : ''}>Vencendo em breve</option><option value="vencido" ${_filtroFornecedores.vencimento === 'vencido' ? 'selected' : ''}>Vencidos</option></select></div>
        <button class="sup-toolbar-btn" onclick="abrirColunasVisiveisFornecedor()">${ic('settings', 13)} Colunas visíveis</button>
      </div>
    </div>
    <div id="fornecedores-lista-ad"></div>
  `;
  renderFornecedoresListaAd();
  renderPendentesAprovacao();
}

function mudarAbaFornecedores(aba) {
  _abaFornecedoresAtual = aba;
  renderAdFornecedores();
}

// Card "Novo fornecedor": vem recolhido por padrão, abre/fecha clicando no
// próprio cabeçalho do cartão (ícone "+" gira e vira "×").
function toggleNovoFornecedorCard(forcarAberto) {
  _novoFornecedorAberto = typeof forcarAberto === 'boolean' ? forcarAberto : !_novoFornecedorAberto;
  const card = document.getElementById('novo-fornecedor-card');
  const body = document.getElementById('novo-fornecedor-body');
  if (card) card.classList.toggle('open', _novoFornecedorAberto);
  if (body) body.style.display = _novoFornecedorAberto ? 'block' : 'none';
  if (_novoFornecedorAberto && card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function aplicarFiltroFornecedores() {
  _filtroFornecedores.busca = document.getElementById('ff-busca').value.trim().toLowerCase();
  _filtroFornecedores.tipo = document.getElementById('ff-tipo').value;
  _filtroFornecedores.setor = document.getElementById('ff-setor').value;
  _filtroFornecedores.criticidade = document.getElementById('ff-criticidade').value;
  _filtroFornecedores.vencimento = document.getElementById('ff-vencimento').value;
  renderFornecedoresListaAd();
}

const DIAS_AVISO_PADRAO = 30; // usado quando o documento não tem um valor customizado

function diasParaVencer(dataISO) {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const venc = new Date(dataISO + 'T00:00:00');
  return Math.ceil((venc - hoje) / (1000*60*60*24));
}

function contarDocumentosVencendo(d) {
  const vencidos = [], proximos = [];
  d.documentos.forEach(doc => {
    const dias = diasParaVencer(doc.validade);
    const aviso = doc.diasAviso ?? DIAS_AVISO_PADRAO;
    if (dias < 0) vencidos.push(doc);
    else if (dias <= aviso) proximos.push(doc);
  });
  return { vencidos, proximos };
}

// Reaproveitado na tela de Avaliar → Produto pra avisar (sem mexer em nota)
// quando o fornecedor selecionado tem algum documento vencido no cadastro.
function fornecedorTemDocumentoVencido(fornecedorId) {
  const d = db();
  return d.documentos.some(doc => doc.fornecedorId === fornecedorId && diasParaVencer(doc.validade) < 0);
}

// 'vencido' | 'proximo' | 'ok' — pior status entre os documentos do fornecedor.
// Usado tanto pro filtro "Vencimento" quanto pra pintar a linha na listagem.
function piorStatusDocumentosFornecedor(d, fornecedorId) {
  const docs = d.documentos.filter(doc => doc.fornecedorId === fornecedorId);
  return docs.reduce((acc, doc) => {
    const dias = diasParaVencer(doc.validade);
    const aviso = doc.diasAviso ?? DIAS_AVISO_PADRAO;
    if (dias < 0) return 'vencido';
    if (dias <= aviso && acc !== 'vencido') return 'proximo';
    return acc;
  }, 'ok');
}

function statusDocumento(doc) {
  const dias = diasParaVencer(doc.validade);
  const aviso = doc.diasAviso ?? DIAS_AVISO_PADRAO;
  if (dias < 0) return { cls: 'badge-danger', label: `Vencido há ${Math.abs(dias)}d` };
  if (dias <= aviso) return { cls: 'badge-warn', label: `Vence em ${dias}d` };
  return { cls: 'badge-success', label: 'Em dia' };
}

const COLUNAS_FORNECEDOR_BASE = [
  { chave: 'tipo', label: 'Tipo' },
  { chave: 'setor', label: 'Setor' },
  { chave: 'criticidade', label: 'Criticidade' },
  { chave: 'email', label: 'E-mail' },
  { chave: 'telefone', label: 'Telefone' },
  { chave: 'endereco', label: 'Endereço' },
  { chave: 'cnpj', label: 'CNPJ' },
  { chave: 'documentos', label: 'Resumo de documentos' },
  { chave: 'criado_em', label: 'Data de cadastro' },
  { chave: 'desempenho', label: 'Conceito / desempenho' }
];

function badgeHTML(texto, classe) {
  return `<span class="sup-badge ${classe || ''}">${texto}</span>`;
}

function formatarCNPJ(valor) {
  let v = (valor || '').replace(/\D/g, '').slice(0, 14);
  if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2}).*/, '$1.$2.$3/$4-$5');
  else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4}).*/, '$1.$2.$3/$4');
  else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d{1,3}).*/, '$1.$2');
  return v;
}

function formatarTelefone(valor) {
  let v = (valor || '').replace(/\D/g, '').slice(0, 11);
  if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{1,4}).*/, '($1) $2-$3');
  else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{1,4}).*/, '($1) $2-$3');
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d{1,4}).*/, '($1) $2');
  else if (v.length > 0) v = v.replace(/^(\d{1,2}).*/, '($1');
  return v;
}

function metaItemHTML(iconeSvg, texto, mono) {
  return `<span class="sup-meta-item${mono ? ' mono' : ''}"><span class="ic">${iconeSvg}</span>${texto}</span>`;
}

function pluralDocs(n) {
  if (n === 0) return 'sem documentos';
  if (n === 1) return '1 documento';
  return `${n} documentos`;
}

function abrirColunasVisiveisFornecedor() {
  const d = db();
  const todas = [...COLUNAS_FORNECEDOR_BASE, ...d.camposFornecedorCustom.map(c => ({ chave: 'extra_' + c.chave, label: c.label }))];
  const vis = d.colunasFornecedorVisiveis;
  openModal(`
    <h3>Colunas visíveis na listagem</h3>
    <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Escolha quais informações aparecem em cada fornecedor.</p>
    <div style="display:flex; flex-direction:column; gap:4px; max-height:320px; overflow-y:auto">
      ${todas.map(c => `<label class="checklist-item"><input type="checkbox" value="${c.chave}" ${vis.includes(c.chave) ? 'checked' : ''}> ${c.label}</label>`).join('')}
    </div>
    <div style="display:flex; gap:8px; margin-top:18px">
      <button class="btn btn-primary btn-block" onclick="salvarColunasVisiveisFornecedor()">Salvar</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    </div>
  `);
}

async function salvarColunasVisiveisFornecedor() {
  const checks = document.querySelectorAll('#modal-box input[type=checkbox]:checked');
  const vis = Array.from(checks).map(c => c.value);

  const { error } = await supabaseClient
    .from('empresas')
    .update({ colunas_fornecedor_visiveis: vis })
    .eq('id', currentUser.empresaId);

  if (error) { toast('Erro ao salvar colunas: ' + error.message); return; }

  empresaConfigCache.colunas_fornecedor_visiveis = vis;
  addLog('colunas_fornecedor_atualizadas', `${currentUser.email} alterou as colunas visíveis da listagem de fornecedores`);
  closeModal();
  renderFornecedoresListaAd();
  toast('Colunas atualizadas!');
}

function renderFornecedoresListaAd() {
  const d = db();
  const wrap = document.getElementById('fornecedores-lista-ad');
  const aba = _abaFornecedoresAtual;
  let lista = d.fornecedores.filter(f => {
    if (aba === 'desativados') return f.ativo === false;
    if (aba === 'diversos') return f.ativo !== false && f.diverso;
    return f.ativo !== false && !f.diverso;
  });

  const filtro = _filtroFornecedores;
  if (filtro.busca) {
    const buscaDigitos = filtro.busca.replace(/\D/g, '');
    lista = lista.filter(f =>
      (f.nome || '').toLowerCase().includes(filtro.busca) ||
      (f.email || '').toLowerCase().includes(filtro.busca) ||
      (buscaDigitos && (f.cnpj || '').replace(/\D/g, '').includes(buscaDigitos))
    );
  }
  if (filtro.tipo) lista = lista.filter(f => f.tipo === filtro.tipo);
  if (filtro.setor) lista = lista.filter(f => f.setor === filtro.setor);
  if (filtro.criticidade) lista = lista.filter(f => (f.criticidade || 'media') === filtro.criticidade);
  if (filtro.vencimento) lista = lista.filter(f => piorStatusDocumentosFornecedor(d, f.id) === filtro.vencimento);

  if (!lista.length) {
    wrap.innerHTML = `<div class="card"><div class="empty-state"><p>${aba === 'desativados' ? 'Nenhum fornecedor desativado.' : aba === 'diversos' ? 'Nenhum fornecedor diverso — eles aparecem aqui quando cadastrados rápido pela tela de Avaliar.' : 'Nenhum fornecedor encontrado com esses filtros.'}</p></div></div>`;
    return;
  }

  const colVis = d.colunasFornecedorVisiveis;

  wrap.innerHTML = lista.map(f => {
    const docs = d.documentos.filter(doc => doc.fornecedorId === f.id);
    const piorStatus = piorStatusDocumentosFornecedor(d, f.id);
    const dotCor = piorStatus === 'vencido' ? 'var(--danger)' : piorStatus === 'proximo' ? 'var(--warn)' : 'var(--success)';

    // Badges de status (linha do nome)
    const badges = [];
    if (colVis.includes('criticidade')) {
      const crit = f.criticidade || 'media';
      const classe = crit === 'alta' ? 'sup-badge-crit-alta' : crit === 'baixa' ? 'sup-badge-crit-baixa' : 'sup-badge-crit-media';
      const txt = crit === 'alta' ? 'Crítico' : crit === 'baixa' ? 'Não crítico' : 'Média criticidade';
      badges.push(badgeHTML(txt, classe));
    }
    if (colVis.includes('tipo')) {
      if (f.tipo === 'ambos') {
        badges.push(badgeHTML('Serviço', 'sup-badge-tipo-servico'));
        badges.push(badgeHTML('Produto', 'sup-badge-tipo-produto'));
      } else {
        badges.push(badgeHTML(f.tipo === 'produto' ? 'Produto' : 'Serviço', f.tipo === 'produto' ? 'sup-badge-tipo-produto' : 'sup-badge-tipo-servico'));
      }
    }

    // Metadados em texto simples, separados por "|" (linha de baixo)
    const meta = [];
    if (colVis.includes('email') && f.email) meta.push(metaItemHTML(ic('mail', 12.5), f.email));
    if (colVis.includes('telefone') && f.telefone) meta.push(metaItemHTML(ic('phone', 12.5), f.telefone));
    if (colVis.includes('endereco') && f.endereco) meta.push(metaItemHTML(ic('pin', 12.5), f.endereco));
    if (colVis.includes('cnpj') && f.cnpj) meta.push(metaItemHTML(ic('building', 12.5), f.cnpj, true));
    if (colVis.includes('setor') && f.setor) meta.push(metaItemHTML(ic('tag', 12.5), f.setor));
    d.camposFornecedorCustom.forEach(c => {
      const v = (f.extras || {})[c.chave];
      if (colVis.includes('extra_' + c.chave) && v) meta.push(metaItemHTML(ic('tag', 12.5), `${c.label}: ${v}`));
    });
    if (colVis.includes('documentos')) {
      const classeDoc = piorStatus === 'vencido' ? 'sup-badge-doc-danger' : piorStatus === 'proximo' ? 'sup-badge-doc-warn' : docs.length ? 'sup-badge-doc-ok' : 'sup-badge-doc-none';
      meta.push(badgeHTML(`${ic('folder', 11)} ${pluralDocs(docs.length)}`, classeDoc));
    }
    if (colVis.includes('criado_em') && f.criado_em) meta.push(metaItemHTML(ic('calendar', 12.5), tempoDesde(f.criado_em)));
    // Conceito médio ao vivo (calculado na hora, não guardado) — só aparece se a coluna estiver ligada.
    if (colVis.includes('desempenho')) {
      if (f.tipo === 'produto' || f.tipo === 'ambos') {
        const avaliacoesForn = d.avaliacoesProduto.filter(av => av.fornecedorId === f.id);
        if (avaliacoesForn.length) {
          const media = avaliacoesForn.reduce((s, av) => s + av.notaGeral, 0) / avaliacoesForn.length;
          const faixaMedia = getConceitoPorFaixa(media, d.faixasConceitoProduto);
          meta.push(metaItemHTML(ic('chart', 12.5), `Conceito médio: ${media.toFixed(1)}${faixaMedia ? ' (' + faixaMedia.nome + ')' : ''}`));
        } else {
          meta.push(metaItemHTML(ic('chart', 12.5), 'Sem avaliação de produto ainda'));
        }
      }
      if (f.tipo === 'servico' || f.tipo === 'ambos') {
        const avaliacoesForn = d.avaliacoes.filter(av => av.fornecedorId === f.id);
        if (avaliacoesForn.length) meta.push(metaItemHTML(ic('chart', 12.5), `${avaliacoesForn.length} avaliação${avaliacoesForn.length > 1 ? 'ões' : ''} de serviço`));
      }
    }
    const metaSep = '<span class="sup-meta-sep">|</span>';

    return `
    <div id="fornecedor-row-${f.id}" class="sup-row-wrap ${aba === 'desativados' ? 'inactive' : ''}">
      <div class="sup-row ${aba !== 'desativados' ? 'clickable' : ''}" ${aba !== 'desativados' ? `onclick="toggleFornecedorDocsList('${f.id}')"` : ''}>
        <div style="display:flex; gap:10px; flex:1; min-width:0">
          <span class="sup-status-dot" style="background:${dotCor}"></span>
          <div style="flex:1; min-width:0">
            <div class="sup-name-line">
              <span class="sup-name" title="${f.nome}">${truncarNomeForn(f.nome)}</span>
              ${badges.join('')}
            </div>
            ${meta.length ? `<div class="sup-meta">${meta.join(metaSep)}</div>` : ''}
          </div>
        </div>
        <div class="sup-actions" onclick="event.stopPropagation()">
          ${aba !== 'desativados' ? `
            ${(piorStatus === 'vencido' || piorStatus === 'proximo') ? `<button class="sup-btn sup-btn-strong" onclick="enviarCobrancaConsolidadaFornecedor('${f.id}')">Cobrar Pendências</button>` : ''}
            <button class="sup-btn-solid" onclick="toggleFornecedorDocsForm('${f.id}')">Novo Documento</button>
            <div class="sup-dropdown-wrap">
              <button class="sup-more-btn" onclick="toggleMenuFornecedor('${f.id}', event)" title="Mais opções">${ic('moreVertical', 17)}</button>
              <div class="sup-dropdown" id="menu-forn-${f.id}">
                <button onclick="abrirEdicaoFornecedor('${f.id}')">${ic('pencil', 14)} Editar</button>
                <button onclick="gerarLinkPortalFornecedor('${f.id}')">${ic('link', 14)} Link do portal</button>
                <button onclick="abrirAnexosFornecedor('${f.id}'); document.getElementById('menu-forn-${f.id}').classList.remove('open')">${ic('paperclip', 14)} Anexos</button>
                ${aba === 'diversos' ? `<button onclick="moverFornecedorParaFixo('${f.id}')">${ic('pin', 14)} Mover pra fixo</button>` : ''}
                <button onclick="desativarFornecedorAd('${f.id}')" class="sup-dropdown-danger">${ic('trash', 14)} Remover</button>
              </div>
            </div>
          ` : `
            <button class="sup-btn sup-btn-success" onclick="reativarFornecedorAd('${f.id}')">${ic('rotateCcw', 13)} Reativar</button>
            <button class="sup-btn sup-btn-danger" onclick="excluirFornecedorDefinitivo('${f.id}')">Excluir definitivo</button>
          `}
        </div>
        ${aba !== 'desativados' ? `<span class="sup-chevron-ind">${ic('chevronDown', 15)}</span>` : ''}
      </div>
      ${aba !== 'desativados' ? `
      <div id="docs-wrap-${f.id}" style="display:none; padding:14px 18px 18px 37px; border-top:1px solid var(--border)">
        <div id="doc-form-${f.id}" class="card" style="display:none; margin-bottom:10px; background:var(--surface2)">
          <p style="font-size:12px; font-weight:600; margin-bottom:10px">Novo documento</p>
          <div class="form-row three">
            <div class="form-group">
              <label>Nome do documento</label>
              <input type="text" id="doc-nome-${f.id}" list="doc-tipos-datalist-${f.id}" placeholder="Selecione ou digite...">
              <datalist id="doc-tipos-datalist-${f.id}">${(d.tiposDocumento || []).map(t => `<option value="${t}">`).join('')}</datalist>
            </div>
            <div class="form-group"><label>Validade</label><input type="date" id="doc-validade-${f.id}"></div>
            <div class="form-group"><label>Avisar com quantos dias <span style="color:var(--text-muted); font-weight:400">(padrão 30)</span></label><input type="number" min="0" id="doc-dias-aviso-${f.id}" placeholder="30"></div>
            <div class="form-group"><label>Observação</label><input type="text" id="doc-obs-${f.id}" placeholder="opcional"></div>
          </div>
          <div style="display:flex; align-items:flex-end; gap:10px; margin-bottom:2px">
            <div class="form-group" style="flex:1; margin-bottom:0">
              <label style="font-size:12px; font-weight:500; color:var(--text-sec)">Arquivo (PDF ou imagem — opcional)</label>
              <div class="file-drop" onclick="document.getElementById('doc-file-${f.id}').click()" style="padding:10px; cursor:pointer">
                <input type="file" id="doc-file-${f.id}" accept=".pdf,.png,.jpg,.jpeg" style="display:none" onchange="previewDocFile('${f.id}', this)">
                <p id="doc-file-label-${f.id}" style="font-size:12px; color:var(--text-muted); display:flex; align-items:center; gap:6px; margin:0">${ic('paperclip', 13)} Clique para selecionar arquivo</p>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" style="flex-shrink:0" onclick="addDocumento('${f.id}')">Adicionar documento</button>
          </div>
        </div>
        <div id="docs-lista-${f.id}"></div>
      </div>` : ''}
    </div>`;
  }).join('');

  if (aba === 'ativos') lista.forEach(f => renderDocsLista(f.id));
}

// Clique na linha (fora dos botões): mostra só a lista de documentos já cadastrados
function toggleFornecedorDocsList(id) {
  const el = document.getElementById('docs-wrap-' + id);
  const row = document.getElementById('fornecedor-row-' + id);
  const form = document.getElementById('doc-form-' + id);
  const abrir = el.style.display === 'none';
  el.style.display = abrir ? 'block' : 'none';
  if (form) form.style.display = 'none';
  if (row) row.classList.toggle('expanded', abrir);
}

// Clique no botão "Documentos": abre o painel (se preciso) e mostra/esconde o formulário de cadastro
function toggleFornecedorDocsForm(id) {
  const el = document.getElementById('docs-wrap-' + id);
  const row = document.getElementById('fornecedor-row-' + id);
  const form = document.getElementById('doc-form-' + id);
  const jaAberto = el.style.display !== 'none';
  const formVisivel = form.style.display !== 'none';
  if (jaAberto && formVisivel) {
    form.style.display = 'none';
  } else {
    el.style.display = 'block';
    form.style.display = 'block';
    if (row) row.classList.add('expanded');
  }
}

function previewDocFile(fid, input) {
  const label = document.getElementById('doc-file-label-' + fid);
  if (input.files && input.files[0]) {
    label.innerHTML = `${ic('paperclip', 13)} ${input.files[0].name}`;
    label.style.color = 'var(--accent)';
  }
}

function renderDocsLista(fornecedorId) {
  const d = db();
  const wrap = document.getElementById('docs-lista-' + fornecedorId);
  if (!wrap) return;
  const docs = d.documentos.filter(doc => doc.fornecedorId === fornecedorId).sort((a,b) => new Date(a.validade) - new Date(b.validade));
  if (!docs.length) { wrap.innerHTML = '<p style="font-size:12px; color:var(--text-muted)">Nenhum documento arquivado.</p>'; return; }

  wrap.innerHTML = `
    <div class="sup-doc-list-header">
      <span>Documentação ativa</span>
      <span class="sup-doc-count-badge">${pluralDocs(docs.length)}</span>
    </div>
    <div class="sup-doc-list">
      ${docs.map(doc => {
        const st = statusDocumento(doc);
        const temArquivo = !!doc.caminhoStorage;
        const precisaAtencao = st.cls !== 'badge-success'; // vencido ou dentro da janela de aviso
        const falhouRecente = doc.ultimoErroCobranca && (!doc.cobradoEm || new Date(doc.ultimoErroCobrancaEm) > new Date(doc.cobradoEm));
        let statusNota = '';
        if (falhouRecente) statusNota = `<div class="sup-doc-status-note danger">${ic('x', 11)} Envio automático falhou</div>`;
        else if (doc.cobradoEm) statusNota = `<div class="sup-doc-status-note success">${ic('send', 11)} Cobrado em ${new Date(doc.cobradoEm).toLocaleDateString('pt-BR')}</div>`;

        return `
        <div class="sup-doc-card">
          <div class="sup-doc-col sup-doc-col-nome">
            <div class="sup-doc-label">Documento</div>
            <div class="sup-doc-value strong">${doc.nome}</div>
          </div>
          <div class="sup-doc-col">
            <div class="sup-doc-label">Validade</div>
            <div class="sup-doc-value">${new Date(doc.validade + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
          </div>
          <div class="sup-doc-col">
            <div class="sup-doc-label">Status</div>
            <span class="badge ${st.cls}">${st.label}</span>
            ${statusNota}
          </div>
          <div class="sup-doc-col sup-doc-col-obs">
            <div class="sup-doc-label">Observação</div>
            <div class="sup-doc-value muted">${doc.obs || '—'}</div>
          </div>
          <div class="sup-doc-actions">
            ${temArquivo
              ? `<button class="sup-doc-btn-abrir" onclick="abrirArquivoDoc('${doc.id}')">${ic('fileText', 13)} Abrir</button>`
              : `<span class="sup-doc-sem-arquivo">—</span>`}
            ${precisaAtencao ? `<button class="sup-doc-icon-btn" onclick="enviarCobrancaDocumento('${doc.id}')" title="${diasParaVencer(doc.validade) < 0 ? 'Cobrar' : 'Avisar'} (abre seu e-mail)">${ic('send', 14)}</button>` : ''}
            <button class="sup-doc-icon-btn" onclick="abrirEdicaoDocumento('${doc.id}','${fornecedorId}')" title="Editar">${ic('pencil', 14)}</button>
            <button class="sup-doc-icon-btn" onclick="abrirHistoricoDocumento('${doc.id}')" title="Histórico">${ic('history', 14)}</button>
            <button class="sup-doc-icon-btn sup-doc-icon-btn-danger" onclick="removeDocumento('${doc.id}','${fornecedorId}')" title="Excluir">${ic('trash', 14)}</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function abrirEdicaoDocumento(docId, fornecedorId) {
  const d = db();
  const doc = d.documentos.find(x => x.id === docId);
  if (!doc) return;
  openModal(`
    <h3>Editar documento</h3>
    <div class="form-group" style="margin-bottom:10px"><label>Nome do documento</label><input type="text" id="edoc-nome" value="${doc.nome || ''}"></div>
    <div class="form-group" style="margin-bottom:10px"><label>Validade</label><input type="date" id="edoc-validade" value="${doc.validade || ''}"></div>
    <div class="form-group" style="margin-bottom:10px"><label>Avisar com quantos dias <span style="color:var(--text-muted); font-weight:400">(padrão 30)</span></label><input type="number" min="0" id="edoc-dias-aviso" value="${doc.diasAviso ?? ''}" placeholder="30"></div>
    <div class="form-group" style="margin-bottom:10px"><label>Observação</label><input type="text" id="edoc-obs" value="${doc.obs || ''}"></div>
    <div class="form-group" style="margin-bottom:6px">
      <label>Atualizar arquivo <span style="color:var(--text-muted); font-weight:400">(opcional)</span></label>
      <input type="file" id="edoc-arquivo-input" accept=".pdf,.png,.jpg,.jpeg">
    </div>
    <p style="font-size:11px; color:var(--text-muted); margin-bottom:14px">Se você não selecionar um arquivo novo, o arquivo atual continua o mesmo. Se selecionar, o arquivo anterior${doc.caminhoStorage ? ' fica salvo no histórico' : ''} e o documento passa a mostrar "atualizado em" no histórico.</p>
    <div style="display:flex; gap:8px">
      <button class="btn btn-primary btn-block" onclick="salvarEdicaoDocumento('${docId}','${fornecedorId}')">Salvar alterações</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    </div>
  `);
}

async function salvarEdicaoDocumento(docId, fornecedorId) {
  const nome = document.getElementById('edoc-nome').value.trim();
  const validade = document.getElementById('edoc-validade').value;
  const diasAvisoVal = document.getElementById('edoc-dias-aviso').value;
  const obs = document.getElementById('edoc-obs').value.trim();
  if (!nome || !validade) { toast('Informe o nome do documento e a validade.'); return; }

  const d = db();
  const doc = d.documentos.find(x => x.id === docId);
  if (!doc) return;

  // Mudou a validade → a cobrança antiga não tem mais sentido pro novo prazo,
  // então zera o "cobrado em" pra esse documento voltar a poder ser avisado.
  const mudouValidade = doc.validade !== validade;

  const fileInput = document.getElementById('edoc-arquivo-input');
  const novoArquivo = fileInput && fileInput.files[0];
  const updatePayload = {
    tipo_documento: nome,
    validade,
    dias_aviso: diasAvisoVal === '' ? null : parseInt(diasAvisoVal, 10),
    obs,
    ...(mudouValidade ? { cobrado_em: null } : {}),
  };

  // Se um arquivo novo foi selecionado, guarda o atual no histórico e sobe o novo.
  if (novoArquivo) {
    if (doc.caminhoStorage) {
      const { error: histErr } = await supabaseClient.from('documentos_versoes').insert({
        documento_id: docId,
        empresa_id: currentUser.empresaId,
        nome_arquivo: doc.nomeArquivo,
        caminho_storage: doc.caminhoStorage,
        substituido_por: currentUser.id,
      });
      if (histErr) { toast('Erro ao guardar a versão anterior: ' + histErr.message); return; }
    }

    const ext = novoArquivo.name.split('.').pop();
    const nomeArquivoFinal = `${nome}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.${ext}`;
    const nomeArquivoSeguro = sanitizarNomeArquivo(nomeArquivoFinal);
    const caminhoStorage = `${currentUser.empresaId}/${fornecedorId}/${Date.now()}_${nomeArquivoSeguro}`;

    const { error: uploadErr } = await supabaseClient.storage.from('documentos-fornecedores').upload(caminhoStorage, novoArquivo);
    if (uploadErr) { toast('Erro ao enviar arquivo: ' + uploadErr.message); return; }

    updatePayload.nome_arquivo = nomeArquivoFinal;
    updatePayload.caminho_storage = caminhoStorage;
  }

  const { error } = await supabaseClient.from('documentos').update(updatePayload).eq('id', docId);
  if (error) { toast('Erro ao atualizar documento: ' + error.message); return; }

  if (novoArquivo) await limparVersoesAntigasDocumento(docId);

  addLog(
    novoArquivo ? 'documento_atualizado' : 'documento_editado',
    novoArquivo
      ? `${currentUser.email} atualizou o documento "${nome}" (validade: ${validade}) e trocou o arquivo`
      : `${currentUser.email} editou o documento "${nome}" (validade: ${validade})`
  );
  closeModal();
  await carregarDocumentos();
  if (novoArquivo) await carregarDocumentosVersoes();
  renderDocsLista(fornecedorId);
  toast(novoArquivo ? 'Documento e arquivo atualizados!' : 'Documento atualizado!');
}

function abrirHistoricoDocumento(docId) {
  const d = db();
  const doc = d.documentos.find(x => x.id === docId);
  const versoes = d.documentosVersoes.filter(v => v.documentoId === docId).sort((a, b) => new Date(b.substituidoEm) - new Date(a.substituidoEm));
  openModal(`
    <h3>Histórico — ${doc ? doc.nome : ''}</h3>
    <div style="max-height:360px; overflow-y:auto; margin-top:12px">
      ${versoes.length ? versoes.map(v => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border); font-size:13px">
          <span>Atualizado em ${new Date(v.substituidoEm).toLocaleDateString('pt-BR')} às ${new Date(v.substituidoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          ${v.caminhoStorage ? `<button class="btn btn-secondary btn-sm" onclick="baixarVersaoDocumento('${v.id}')">${ic('fileText', 13)} Baixar</button>` : ''}
        </div>
      `).join('') : '<p style="font-size:12px; color:var(--text-muted)">Nenhuma versão anterior — esse documento ainda não foi atualizado.</p>'}
    </div>
  `);
}

async function baixarVersaoDocumento(versaoId) {
  const d = db();
  const v = d.documentosVersoes.find(x => x.id === versaoId);
  if (!v || !v.caminhoStorage) return;

  const { data, error } = await supabaseClient.storage.from('documentos-fornecedores').download(v.caminhoStorage);
  if (error) { toast('Erro ao abrir arquivo: ' + error.message); return; }

  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = v.nomeArquivo || 'documento';
  link.click();
  URL.revokeObjectURL(url);
}

function toggleMenuFornecedor(id, event) {
  event.stopPropagation();
  const menu = document.getElementById('menu-forn-' + id);
  if (!menu) return;
  const jaAberto = menu.classList.contains('open');
  document.querySelectorAll('.sup-dropdown.open').forEach(m => m.classList.remove('open'));
  if (jaAberto) return;
  menu.classList.add('open');
  setTimeout(() => {
    document.addEventListener('click', function fechar(e) {
      if (!menu.contains(e.target)) {
        menu.classList.remove('open');
        document.removeEventListener('click', fechar);
      }
    });
  }, 0);
}

// ---------- Anexos gerais do fornecedor (sem validade — ficha cadastral, questionário assinado etc) ----------
// Cache temporário só pra função de baixar não precisar escapar nome de arquivo dentro do onclick.
let anexosFornecedorTemp = {};

async function abrirAnexosFornecedor(fornecedorId) {
  const f = db().fornecedores.find(x => x.id === fornecedorId);
  openModal(`
    <h3>Anexos gerais${f ? ' — ' + f.nome : ''}</h3>
    <p style="font-size:11px; color:var(--text-muted); margin-bottom:14px">Arquivos de referência sem data de validade (ex: ficha cadastral, questionário de qualificação assinado). Pra documento com vencimento, use "Novo Documento".</p>
    <div class="form-group" style="margin-bottom:14px">
      <div class="file-drop" onclick="document.getElementById('anexo-file-input').click()" style="padding:10px; cursor:pointer">
        <input type="file" id="anexo-file-input" style="display:none" onchange="enviarAnexoFornecedor('${fornecedorId}', this)">
        <p id="anexo-file-label" style="font-size:12px; color:var(--text-muted); display:flex; align-items:center; gap:6px; margin:0">${ic('paperclip', 13)} Clique para selecionar arquivo</p>
      </div>
    </div>
    <div id="anexos-lista-wrap"><p style="font-size:12px; color:var(--text-muted)">Carregando...</p></div>
  `);
  await renderAnexosLista(fornecedorId);
}

async function renderAnexosLista(fornecedorId) {
  const wrap = document.getElementById('anexos-lista-wrap');
  if (!wrap) return;

  const { data, error } = await supabaseClient
    .from('fornecedores_anexos')
    .select('*')
    .eq('fornecedor_id', fornecedorId)
    .order('enviado_em', { ascending: false });

  if (error) { wrap.innerHTML = `<p style="font-size:12px; color:var(--danger)">Erro ao carregar anexos: ${error.message}</p>`; return; }

  if (!data || !data.length) { wrap.innerHTML = '<p style="font-size:12px; color:var(--text-muted)">Nenhum anexo ainda.</p>'; return; }

  data.forEach(a => { anexosFornecedorTemp[a.id] = { caminhoStorage: a.caminho_storage, nomeArquivo: a.nome_arquivo }; });

  wrap.innerHTML = data.map(a => `
    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:9px 0; border-bottom:1px solid var(--border); font-size:12.5px">
      <div style="min-width:0">
        <div style="font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${a.nome_arquivo}</div>
        <div style="font-size:11px; color:var(--text-muted)">${new Date(a.enviado_em).toLocaleDateString('pt-BR')}</div>
      </div>
      <div style="display:flex; gap:6px; flex-shrink:0">
        <button class="sup-doc-icon-btn" onclick="baixarAnexoFornecedor('${a.id}')" title="Baixar">${ic('fileText', 14)}</button>
        <button class="sup-doc-icon-btn sup-doc-icon-btn-danger" onclick="removerAnexoFornecedor('${a.id}','${fornecedorId}')" title="Excluir">${ic('trash', 14)}</button>
      </div>
    </div>
  `).join('');
}

async function enviarAnexoFornecedor(fornecedorId, input) {
  const file = input.files[0];
  if (!file) return;

  const label = document.getElementById('anexo-file-label');
  if (label) label.innerHTML = `${ic('paperclip', 13)} Enviando...`;

  const nomeArquivoSeguro = sanitizarNomeArquivo(file.name);
  const caminhoStorage = `anexos/${currentUser.empresaId}/${fornecedorId}/${Date.now()}_${nomeArquivoSeguro}`;

  const { error: uploadErr } = await supabaseClient.storage.from('documentos-fornecedores').upload(caminhoStorage, file);
  if (uploadErr) {
    toast('Erro ao enviar arquivo: ' + uploadErr.message);
    if (label) label.innerHTML = `${ic('paperclip', 13)} Clique para selecionar arquivo`;
    return;
  }

  const { error } = await supabaseClient.from('fornecedores_anexos').insert({
    empresa_id: currentUser.empresaId,
    fornecedor_id: fornecedorId,
    nome_arquivo: file.name,
    caminho_storage: caminhoStorage,
    enviado_por: currentUser.id,
  });

  if (error) { toast('Erro ao salvar anexo: ' + error.message); return; }

  addLog('anexo_fornecedor_adicionado', `${currentUser.email} adicionou o anexo "${file.name}"`);
  if (label) label.innerHTML = `${ic('paperclip', 13)} Clique para selecionar arquivo`;
  input.value = '';
  toast('Anexo adicionado!');
  await renderAnexosLista(fornecedorId);
}

async function baixarAnexoFornecedor(anexoId) {
  const info = anexosFornecedorTemp[anexoId];
  if (!info) return;

  const { data, error } = await supabaseClient.storage.from('documentos-fornecedores').download(info.caminhoStorage);
  if (error) { toast('Erro ao abrir arquivo: ' + error.message); return; }

  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = info.nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}

async function removerAnexoFornecedor(anexoId, fornecedorId) {
  if (!confirm('Excluir esse anexo?')) return;

  const { error } = await supabaseClient.from('fornecedores_anexos').delete().eq('id', anexoId);
  if (error) { toast('Erro ao excluir: ' + error.message); return; }

  delete anexosFornecedorTemp[anexoId];
  addLog('anexo_fornecedor_removido', `${currentUser.email} removeu um anexo`);
  toast('Anexo removido.');
  await renderAnexosLista(fornecedorId);
}

async function gerarLinkPortalFornecedor(fornecedorId) {
  toast('Gerando link...');
  const { data, error } = await supabaseClient.functions.invoke('gerar-link-portal-fornecedor', { body: { fornecedorId } });

  if (error || !data || data.ok === false) { toast((data && data.error) || 'Erro ao gerar o link.'); return; }

  addLog('portal_link_gerado', `${currentUser.email} gerou o link do portal pra "${d_nomeFornecedor(fornecedorId)}"`);

  if (!data.link) {
    toast('Link gerado, mas falta configurar APP_URL no servidor pra montar a URL completa.');
    return;
  }

  openModal(`
    <h3>Link do portal</h3>
    <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Válido por 15 dias. Manda esse link pro fornecedor — ele consegue ver e renovar os documentos vencidos/vencendo dele, sem precisar de senha.</p>
    <div class="form-group" style="margin-bottom:14px">
      <input type="text" id="portal-link-copiar" value="${data.link}" readonly onclick="this.select()">
    </div>
    <button class="btn btn-primary btn-block" onclick="navigator.clipboard.writeText('${data.link}'); toast('Link copiado!')">${ic('copy', 13)} Copiar link</button>
  `);
}

function d_nomeFornecedor(id) {
  const d = db();
  const f = d.fornecedores.find(x => x.id === id);
  return f ? f.nome : id;
}

function renderPendentesAprovacao() {
  const d = db();
  const wrap = document.getElementById('pendentes-aprovacao-wrap');
  if (!wrap) return;
  const pendentes = (d.documentosPendentesAprovacao || []).filter(p => p.status === 'pendente');

  if (!pendentes.length) { wrap.parentElement.style.display = 'none'; return; }
  wrap.parentElement.style.display = 'block';

  wrap.innerHTML = pendentes.map(p => {
    const forn = d.fornecedores.find(f => f.id === p.fornecedorId);
    const doc = d.documentos.find(x => x.id === p.documentoId);
    return `
      <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); font-size:13px">
        <div style="flex:1">
          <b>${forn ? forn.nome : '—'}</b> enviou <b>${doc ? doc.nome : p.nomeArquivo}</b>
          <div style="font-size:11px; color:var(--text-muted)">Nova validade: ${new Date(p.novaValidade + 'T00:00:00').toLocaleDateString('pt-BR')} · enviado em ${new Date(p.enviadoEm).toLocaleDateString('pt-BR')}</div>
        </div>
        ${p.caminhoStorage ? `<button class="btn btn-secondary btn-sm" onclick="baixarPendenteAprovacao('${p.id}')">${ic('fileText', 13)} Ver</button>` : ''}
        <button class="btn btn-primary btn-sm" onclick="aprovarPendenteAprovacao('${p.id}')">${ic('check', 13)} Aprovar</button>
        <button class="btn btn-danger btn-sm" onclick="rejeitarPendenteAprovacao('${p.id}')">${ic('x', 13)} Rejeitar</button>
      </div>`;
  }).join('');
}

async function baixarPendenteAprovacao(pendenteId) {
  const d = db();
  const p = (d.documentosPendentesAprovacao || []).find(x => x.id === pendenteId);
  if (!p || !p.caminhoStorage) return;
  const { data, error } = await supabaseClient.storage.from('documentos-fornecedores').download(p.caminhoStorage);
  if (error) { toast('Erro ao abrir arquivo: ' + error.message); return; }
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url; link.download = p.nomeArquivo || 'documento';
  link.click();
  URL.revokeObjectURL(url);
}

async function aprovarPendenteAprovacao(pendenteId) {
  const d = db();
  const p = (d.documentosPendentesAprovacao || []).find(x => x.id === pendenteId);
  if (!p) return;
  const doc = d.documentos.find(x => x.id === p.documentoId);
  if (!doc) { toast('Documento original não existe mais.'); return; }

  // Mesma lógica de "substituir arquivo": guarda a versão atual no histórico.
  if (doc.caminhoStorage) {
    await supabaseClient.from('documentos_versoes').insert({
      documento_id: doc.id, empresa_id: currentUser.empresaId,
      nome_arquivo: doc.nomeArquivo, caminho_storage: doc.caminhoStorage, substituido_por: currentUser.id,
    });
  }

  const { error: updErr } = await supabaseClient.from('documentos').update({
    validade: p.novaValidade, nome_arquivo: p.nomeArquivo, caminho_storage: p.caminhoStorage, cobrado_em: null,
  }).eq('id', doc.id);
  if (updErr) { toast('Erro ao aprovar: ' + updErr.message); return; }

  const { error: pendErr } = await supabaseClient.from('documentos_pendentes_aprovacao').update({
    status: 'aprovado', revisado_por: currentUser.id, revisado_em: new Date().toISOString(),
  }).eq('id', pendenteId);
  if (pendErr) { toast('Erro ao atualizar status: ' + pendErr.message); return; }

  if (doc.caminhoStorage) await limparVersoesAntigasDocumento(doc.id);

  addLog('documento_pendente_aprovado', `${currentUser.email} aprovou o documento enviado pelo portal (documento: "${doc.nome}")`);
  await carregarDocumentos();
  await carregarDocumentosVersoes();
  await carregarDocumentosPendentesAprovacao();
  renderPendentesAprovacao();
  renderAdFornecedores();
  toast('Aprovado! O documento já está atualizado.');
}

async function rejeitarPendenteAprovacao(pendenteId) {
  const motivo = prompt('Motivo da rejeição (opcional, o fornecedor não vê isso — é só pra seu controle):') || null;
  const { error } = await supabaseClient.from('documentos_pendentes_aprovacao').update({
    status: 'rejeitado', motivo_rejeicao: motivo, revisado_por: currentUser.id, revisado_em: new Date().toISOString(),
  }).eq('id', pendenteId);
  if (error) { toast('Erro ao rejeitar: ' + error.message); return; }

  addLog('documento_pendente_rejeitado', `${currentUser.email} rejeitou um documento enviado pelo portal`);
  await carregarDocumentosPendentesAprovacao();
  renderPendentesAprovacao();
  toast('Rejeitado. O fornecedor pode enviar de novo pelo mesmo link.');
}

async function abrirArquivoDoc(docId) {
  const d = db();
  const doc = d.documentos.find(x => x.id === docId);
  if (!doc || !doc.caminhoStorage) return;

  const { data, error } = await supabaseClient.storage.from('documentos-fornecedores').download(doc.caminhoStorage);
  if (error) { toast('Erro ao abrir arquivo: ' + error.message); return; }

  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = doc.nomeArquivo || doc.nome;
  link.click();
  URL.revokeObjectURL(url);
}

// Baixa um anexo de avaliação de serviço (mesmo padrão do documento de fornecedor,
// só muda o bucket).
async function baixarAnexoAvaliacao(caminhoStorage, nomeArquivo) {
  if (!caminhoStorage) return;
  const { data, error } = await supabaseClient.storage.from('anexos-avaliacoes').download(caminhoStorage);
  if (error) { toast('Erro ao abrir anexo: ' + error.message); return; }

  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}

async function addDocumento(fornecedorId) {
  const nome = document.getElementById(`doc-nome-${fornecedorId}`).value.trim();
  const validade = document.getElementById(`doc-validade-${fornecedorId}`).value;
  const diasAvisoVal = document.getElementById(`doc-dias-aviso-${fornecedorId}`).value;
  const obs = document.getElementById(`doc-obs-${fornecedorId}`).value.trim();
  if (!nome || !validade) { toast('Informe o nome do documento e a validade.'); return; }

  const fileInput = document.getElementById('doc-file-' + fornecedorId);
  const file = fileInput && fileInput.files[0];

  let caminhoStorage = null;
  let nomeArquivoFinal = null;

  if (file) {
    const validadeFormatada = new Date(validade + 'T00:00:00').toLocaleDateString('pt-BR').replace(/\//g, '-');
    const ext = file.name.split('.').pop();
    nomeArquivoFinal = `${nome}_${validadeFormatada}.${ext}`; // nome "bonito", guardado só pra exibir/baixar
    // O Storage do Supabase rejeita acento/espaço na CHAVE do arquivo ("Invalid key").
    // Por isso, o caminho salvo usa uma versão sanitizada — só o nome de exibição
    // (nome_arquivo, no banco) mantém acentos.
    const nomeArquivoSeguro = sanitizarNomeArquivo(nomeArquivoFinal);
    // Pasta por empresa/fornecedor — é o que a policy de RLS do Storage confere.
    caminhoStorage = `${currentUser.empresaId}/${fornecedorId}/${Date.now()}_${nomeArquivoSeguro}`;

    const { error: uploadErr } = await supabaseClient.storage
      .from('documentos-fornecedores')
      .upload(caminhoStorage, file);

    if (uploadErr) { toast('Erro ao enviar arquivo: ' + uploadErr.message); return; }
  }

  const { error } = await supabaseClient.from('documentos').insert({
    empresa_id: currentUser.empresaId,
    fornecedor_id: fornecedorId,
    tipo_documento: nome,
    validade,
    dias_aviso: diasAvisoVal === '' ? null : parseInt(diasAvisoVal, 10),
    obs,
    nome_arquivo: nomeArquivoFinal,
    caminho_storage: caminhoStorage,
  });

  if (error) { toast('Erro ao arquivar documento: ' + error.message); return; }

  const d = db();
  const forn = d.fornecedores.find(f => f.id === fornecedorId);
  addLog('documento_arquivado', `${currentUser.email} arquivou o documento "${nome}" para o fornecedor "${forn.nome}" (validade: ${validade})`);
  document.getElementById(`doc-nome-${fornecedorId}`).value = '';
  document.getElementById(`doc-validade-${fornecedorId}`).value = '';
  document.getElementById(`doc-dias-aviso-${fornecedorId}`).value = '';
  document.getElementById(`doc-obs-${fornecedorId}`).value = '';
  if (fileInput) { fileInput.value = ''; }
  const label = document.getElementById('doc-file-label-' + fornecedorId);
  if (label) { label.innerHTML = `${ic('paperclip', 13)} Clique para selecionar arquivo`; label.style.color = ''; }

  await carregarDocumentos();
  renderDocsLista(fornecedorId);
  renderFornecedoresListaAd();
  document.getElementById('docs-wrap-' + fornecedorId).style.display = 'block';
  const formEl = document.getElementById('doc-form-' + fornecedorId); if (formEl) formEl.style.display = 'block';
  const rowEl = document.getElementById('fornecedor-row-' + fornecedorId); if (rowEl) rowEl.classList.add('expanded');
  toast('Documento arquivado!');
}

async function removeDocumento(docId, fornecedorId) {
  if (!confirm('Excluir este documento do arquivo?')) return;
  const d = db();
  const doc = d.documentos.find(x => x.id === docId);
  if (!doc) return;

  if (doc.caminhoStorage) {
    const { error: storageErr } = await supabaseClient.storage.from('documentos-fornecedores').remove([doc.caminhoStorage]);
    if (storageErr) { toast('Erro ao excluir arquivo: ' + storageErr.message); return; }
  }

  const { error } = await supabaseClient.from('documentos').delete().eq('id', docId);
  if (error) { toast('Erro ao excluir documento: ' + error.message); return; }

  addLog('documento_removido', `${currentUser.email} excluiu o documento "${doc.nome}"`);
  await carregarDocumentos();
  renderDocsLista(fornecedorId);
  renderFornecedoresListaAd();
  document.getElementById('docs-wrap-' + fornecedorId).style.display = 'block';
  const rowEl = document.getElementById('fornecedor-row-' + fornecedorId); if (rowEl) rowEl.classList.add('expanded');
  toast('Documento excluído.');
}

// Monta "Rua, número - bairro, cidade/UF" a partir dos campos que a
// OpenCNPJ ou a BrasilAPI devolverem (nem sempre vêm todos preenchidos).
function montarEnderecoPorCnpj(j) {
  if (!j) return '';
  const logradouro = j.logradouro || j.tipo_logradouro ? `${j.tipo_logradouro || ''} ${j.logradouro || ''}`.trim() : '';
  const numero = j.numero || '';
  const bairro = j.bairro || '';
  const cidade = j.municipio || j.cidade || '';
  const uf = j.uf || j.estado || '';
  let parte1 = logradouro;
  if (numero) parte1 = parte1 ? `${parte1}, ${numero}` : numero;
  if (bairro) parte1 = parte1 ? `${parte1} - ${bairro}` : bairro;
  let parte2 = cidade;
  if (uf) parte2 = parte2 ? `${parte2}/${uf}` : uf;
  return [parte1, parte2].filter(Boolean).join(', ');
}

function montarTelefonePorCnpj(j) {
  if (!j) return '';
  if (j.ddd_telefone_1) return j.ddd_telefone_1.replace(/\D/g, '');
  if (j.ddd && j.telefone) return `${j.ddd}${j.telefone}`.replace(/\D/g, '');
  if (j.telefone) return String(j.telefone).replace(/\D/g, '');
  return '';
}

async function buscarNomePorCnpjCadastro() {
  const cnpjInput = document.getElementById('nf-cnpj');
  const nomeInput = document.getElementById('nf-nome');
  const enderecoInput = document.getElementById('nf-endereco');
  const telefoneInput = document.getElementById('nf-telefone');
  const statusEl = document.getElementById('nf-cnpj-status');
  const cnpjLimpo = cnpjInput.value.replace(/\D/g, '');

  if (cnpjLimpo.length !== 14) { toast('CNPJ inválido — precisa ter 14 dígitos.'); return; }

  const d = db();
  const existente = d.fornecedores.find(f => (f.cnpj || '').replace(/\D/g, '') === cnpjLimpo);
  let avisoDuplicado = '';
  if (existente) {
    // Não bloqueia mais — cadastro duplicado é permitido (fornecedores com
    // filiais/CNPJs diferentes por unidade, por exemplo). Só avisa.
    avisoDuplicado = `<div style="color:var(--warn); font-weight:600; margin-bottom:2px; display:flex; align-items:center; gap:6px">${ic('alertTriangle', 13)} Esse CNPJ já está cadastrado como "${existente.nome}" — você pode cadastrar mesmo assim.</div>`;
  }

  statusEl.innerHTML = avisoDuplicado + '<span style="color:var(--text-muted)">Buscando...</span>';

  let dadosEncontrados = null;
  try {
    const r = await fetch(`https://api.opencnpj.org/${cnpjLimpo}`);
    if (r.ok) dadosEncontrados = await r.json();
  } catch (e) { /* segue pra reserva abaixo */ }

  if (!dadosEncontrados || !(dadosEncontrados.razao_social || dadosEncontrados.nome_fantasia)) {
    try {
      const r2 = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (r2.ok) dadosEncontrados = await r2.json();
    } catch (e) { /* segue sem achar — admin digita na mão */ }
  }

  const nomeEncontrado = dadosEncontrados ? (dadosEncontrados.razao_social || dadosEncontrados.nome_fantasia || null) : null;

  if (nomeEncontrado) {
    nomeInput.value = nomeEncontrado;
    const endereco = montarEnderecoPorCnpj(dadosEncontrados);
    if (endereco) enderecoInput.value = endereco;
    const telefone = montarTelefonePorCnpj(dadosEncontrados);
    if (telefone) telefoneInput.value = formatarTelefone(telefone);
    statusEl.innerHTML = avisoDuplicado + `<span style="color:var(--success); font-weight:600; display:inline-flex; align-items:center; gap:6px">${ic('check', 12)} Encontrado — confira os dados antes de salvar</span>`;
  } else {
    statusEl.innerHTML = avisoDuplicado + '<span style="color:var(--warn); font-weight:600">Não achamos os dados automaticamente, digite manualmente</span>';
  }
}

async function addFornecedorAd() {
  const nome = document.getElementById('nf-nome').value.trim();
  const tipo = document.getElementById('nf-tipo').value;
  const setor = document.getElementById('nf-setor').value.trim();
  const email = document.getElementById('nf-email').value.trim();
  const telefone = document.getElementById('nf-telefone').value.trim();
  const endereco = document.getElementById('nf-endereco').value.trim();
  const cnpj = document.getElementById('nf-cnpj').value.trim();
  const criticidade = document.getElementById('nf-criticidade').value;
  if (!nome) { toast('Informe o nome do fornecedor.'); return; }
  const d = db();

  if (d.limiteFornecedores !== null && d.fornecedores.length >= d.limiteFornecedores) {
    toast(`Limite de ${d.limiteFornecedores} fornecedores do seu plano atingido. Fale com a gente para aumentar.`);
    return;
  }

  const extras = {};
  d.camposFornecedorCustom.forEach(c => {
    const el = document.getElementById('nf-extra-' + c.chave);
    if (el) extras[c.chave] = el.value;
  });

  const { error } = await supabaseClient.from('fornecedores').insert({
    empresa_id: currentUser.empresaId,
    nome, tipo, setor, email, telefone, endereco, cnpj, criticidade,
    ativo: true, campos_custom: extras,
  });

  if (error) { toast('Erro ao cadastrar fornecedor: ' + error.message); return; }

  addLog('fornecedor_criado', `${currentUser.email} cadastrou o fornecedor "${nome}"`);
  _novoFornecedorAberto = false;
  await carregarFornecedores();
  renderAdFornecedores();
  toast('Fornecedor adicionado!');
}

function abrirEdicaoFornecedor(id) {
  const d = db();
  const f = d.fornecedores.find(x => x.id === id);
  if (!f) return;
  openModal(`
    <h3>Editar fornecedor</h3>
    <div class="form-group" style="margin-bottom:10px"><label>Nome</label><input type="text" id="ef-nome" value="${f.nome || ''}"></div>
    <div class="form-row" style="margin-bottom:10px">
      <div class="form-group"><label>Tipo</label><select id="ef-tipo">${optionsTipoFornecedorHTML(f.tipo)}</select></div>
      <div class="form-group"><label>Setor</label><input type="text" id="ef-setor" value="${f.setor || ''}"></div>
    </div>
    <div class="form-row" style="margin-bottom:10px; grid-template-columns:1fr 1fr 1fr">
      <div class="form-group"><label>E-mail</label><input type="email" id="ef-email" value="${f.email || ''}"></div>
      <div class="form-group"><label>Telefone</label><input type="text" id="ef-telefone" value="${f.telefone || ''}" oninput="this.value = formatarTelefone(this.value)"></div>
      <div class="form-group"><label>CNPJ</label><input type="text" id="ef-cnpj" value="${f.cnpj || ''}" oninput="this.value = formatarCNPJ(this.value)"></div>
    </div>
    <div class="form-group" style="margin-bottom:10px"><label>Endereço</label><input type="text" id="ef-endereco" value="${f.endereco || ''}"></div>
    <div class="form-group" style="margin-bottom:10px">
      <label>Criticidade</label>
      <select id="ef-criticidade">
        <option value="baixa" ${f.criticidade === 'baixa' ? 'selected' : ''}>Baixa</option>
        <option value="media" ${(!f.criticidade || f.criticidade === 'media') ? 'selected' : ''}>Média</option>
        <option value="alta" ${f.criticidade === 'alta' ? 'selected' : ''}>Alta</option>
      </select>
    </div>
    ${d.camposFornecedorCustom.map(c => `<div style="margin-bottom:10px">${campoCustomInputHTML(c, 'ef-extra-', (f.extras || {})[c.chave])}</div>`).join('')}
    <div style="display:flex; gap:8px; margin-top:16px">
      <button class="btn btn-primary btn-block" onclick="salvarEdicaoFornecedor('${f.id}')">Salvar alterações</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    </div>
  `);
}

async function salvarEdicaoFornecedor(id) {
  const d = db();
  const f = d.fornecedores.find(x => x.id === id);
  if (!f) return;
  const nome = document.getElementById('ef-nome').value.trim();
  if (!nome) { toast('Informe o nome do fornecedor.'); return; }
  const extras = f.extras || {};
  d.camposFornecedorCustom.forEach(c => {
    const el = document.getElementById('ef-extra-' + c.chave);
    if (el) extras[c.chave] = el.value;
  });

  const { error } = await supabaseClient.from('fornecedores').update({
    nome,
    tipo: document.getElementById('ef-tipo').value,
    setor: document.getElementById('ef-setor').value.trim(),
    email: document.getElementById('ef-email').value.trim(),
    telefone: document.getElementById('ef-telefone').value.trim(),
    endereco: document.getElementById('ef-endereco').value.trim(),
    cnpj: document.getElementById('ef-cnpj').value.trim(),
    criticidade: document.getElementById('ef-criticidade').value,
    campos_custom: extras,
  }).eq('id', id);

  if (error) { toast('Erro ao atualizar fornecedor: ' + error.message); return; }

  addLog('fornecedor_editado', `${currentUser.email} editou o cadastro do fornecedor "${nome}"`);
  closeModal();
  await carregarFornecedores();
  renderAdFornecedores();
  toast('Fornecedor atualizado!');
}

async function moverFornecedorParaFixo(id) {
  const d = db();
  const f = d.fornecedores.find(x => x.id === id);
  if (!f) return;

  const { error } = await supabaseClient.from('fornecedores').update({ diverso: false }).eq('id', id);
  if (error) { toast('Erro ao mover fornecedor: ' + error.message); return; }

  addLog('fornecedor_movido_fixo', `${currentUser.email} moveu o fornecedor "${f.nome}" de Diversos para Ativos (fixo)`);
  await carregarFornecedores();
  renderFornecedoresListaAd();
  toast('Fornecedor movido para Ativos!');
}

async function desativarFornecedorAd(id) {
  const d = db();
  const f = d.fornecedores.find(x => x.id === id);
  if (!f) return;
  if (!confirm(`Desativar "${f.nome}"? Ele sai da lista de ativos, mas fica em "Desativados" e pode ser reativado a qualquer momento. Avaliações e documentos são mantidos.`)) return;

  const { error } = await supabaseClient.from('fornecedores').update({ ativo: false }).eq('id', id);
  if (error) { toast('Erro ao desativar fornecedor: ' + error.message); return; }

  addLog('fornecedor_desativado', `${currentUser.email} desativou o fornecedor "${f.nome}"`);
  await carregarFornecedores();
  renderAdFornecedores();
  toast('Fornecedor desativado.');
}

async function reativarFornecedorAd(id) {
  const d = db();
  const f = d.fornecedores.find(x => x.id === id);
  if (!f) return;

  const { error } = await supabaseClient.from('fornecedores').update({ ativo: true }).eq('id', id);
  if (error) { toast('Erro ao reativar fornecedor: ' + error.message); return; }

  addLog('fornecedor_reativado', `${currentUser.email} reativou o fornecedor "${f.nome}"`);
  await carregarFornecedores();
  renderAdFornecedores();
  toast('Fornecedor reativado!');
}

async function excluirFornecedorDefinitivo(id) {
  const d = db();
  const f = d.fornecedores.find(x => x.id === id);
  if (!f) return;
  if (!confirm(`Excluir "${f.nome}" definitivamente? Essa ação NÃO pode ser desfeita. Documentos e avaliações ligados a ele permanecem no histórico, mas o cadastro será apagado.`)) return;

  const { error } = await supabaseClient.from('fornecedores').delete().eq('id', id);
  if (error) { toast('Erro ao excluir fornecedor: ' + error.message); return; }

  addLog('fornecedor_excluido_definitivo', `${currentUser.email} excluiu definitivamente o fornecedor "${f.nome}"`);
  await carregarFornecedores();
  renderAdFornecedores();
  toast('Fornecedor excluído definitivamente.');
}


// ---------- FORMULÁRIOS ----------
