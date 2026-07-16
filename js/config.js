// ============ CONFIGURAÇÕES: matriz, textos e editor de layout dos documentos ============
function getDefaultTextos() {
  // Vazio de propósito: cada empresa escreve o texto do jeito dela — não faz
  // sentido todo cliente novo do SaaS herdar um texto-modelo de uma empresa específica.
  return { 'cert-prod': '', 'cert-serv': '', 'aprov-prod': '', 'aprov-serv': '', 'parcial': '', 'reprov': '' };
}

// ============ LAYOUT CONFIGURÁVEL DOS DOCUMENTOS (blocos dinâmicos) ============
// cert = certificado (paisagem, nota 10) · carta = aprovado/parcial/reprovado (retrato)
// Cada documento tem uma LISTA de blocos (não mais chaves fixas): cada bloco pode ser
// texto fixo ou uma variável dinâmica, e pode ser livremente adicionado/removido/estilizado.
function getLayoutDefaults() {
  return {
    cert: { blocos: [
      { id: 'titulo',    label: 'Título', tipo: 'fixo', conteudo: 'CERTIFICADO DE APROVAÇÃO', fonte: 'helvetica', tamanho: 26, cor: '#7c2d12', negrito: true, italico: true, align: 'center', x: 148.5, y: 38, largura: 230 },
      { id: 'saudacao',  label: 'Saudação', tipo: 'fixo', conteudo: 'Certificamos que:', fonte: 'helvetica', tamanho: 13, cor: '#282828', negrito: false, italico: false, align: 'center', x: 148.5, y: 58, largura: 200 },
      { id: 'nome',      label: 'Nome do fornecedor', tipo: 'variavel', variavel: 'fornecedor', fonte: 'helvetica', tamanho: 18, cor: '#141414', negrito: true, italico: false, align: 'center', x: 148.5, y: 80, largura: 220 },
      { id: 'corpo',     label: 'Corpo do texto', tipo: 'variavel', variavel: 'corpo_texto', fonte: 'helvetica', tamanho: 13, cor: '#323232', negrito: false, italico: false, align: 'center', x: 148.5, y: 98, largura: 177 },
      { id: 'nota',      label: 'Nota', tipo: 'variavel', variavel: 'nota', fonte: 'helvetica', tamanho: 18, cor: '#141414', negrito: true, italico: false, align: 'center', x: 148.5, y: 160, largura: 120 },
      { id: 'rodape',    label: 'Endereço (rodapé)', tipo: 'variavel', variavel: 'rodape_empresa', fonte: 'helvetica', tamanho: 8, cor: '#505050', negrito: false, italico: false, align: 'left', x: 30, y: 200, largura: 150 },
      { id: 'data',      label: 'Data/local', tipo: 'variavel', variavel: 'data_hoje', fonte: 'helvetica', tamanho: 8, cor: '#505050', negrito: false, italico: false, align: 'right', x: 267, y: 200, largura: 100 }
    ]},
    carta: { blocos: [
      { id: 'data',      label: 'Data/local', tipo: 'variavel', variavel: 'data_hoje', fonte: 'helvetica', tamanho: 10, cor: '#646464', negrito: false, italico: false, align: 'left', x: 25, y: 30, largura: 150 },
      { id: 'nome',      label: 'Nome do fornecedor', tipo: 'variavel', variavel: 'fornecedor', fonte: 'helvetica', tamanho: 13, cor: '#000000', negrito: true, italico: false, align: 'left', x: 25, y: 42, largura: 160 },
      { id: 'subtitulo', label: 'Situação (Aprovado/Parcial/Reprovado)', tipo: 'variavel', variavel: 'situacao', fonte: 'helvetica', tamanho: 12, cor: '#009942', negrito: false, italico: false, align: 'left', x: 25, y: 50, largura: 160 },
      { id: 'corpo',     label: 'Corpo do texto', tipo: 'variavel', variavel: 'corpo_texto', fonte: 'helvetica', tamanho: 11, cor: '#000000', negrito: false, italico: false, align: 'left', x: 25, y: 62, largura: 160 },
      { id: 'rodape',    label: 'Endereço (rodapé)', tipo: 'variavel', variavel: 'rodape_empresa', fonte: 'helvetica', tamanho: 9, cor: '#787878', negrito: false, italico: false, align: 'center', x: 105, y: 281, largura: 160 }
    ]}
  };
}

// Converte um layout salvo no formato antigo (objeto com chaves fixas: titulo/nome/corpo...)
// pro novo formato de blocos, preservando posição/tamanho/alinhamento que o usuário já ajustou.
function migrarLayoutAntigoParaBlocos(salvoAntigo, def) {
  const resultado = {};
  ['cert', 'carta'].forEach(tipo => {
    const antigos = salvoAntigo[tipo] || {};
    resultado[tipo] = { blocos: def[tipo].blocos.map(defBloco => {
      const antigo = antigos[defBloco.id];
      if (!antigo) return { ...defBloco };
      return { ...defBloco, x: antigo.x ?? defBloco.x, y: antigo.y ?? defBloco.y, tamanho: antigo.size ?? defBloco.tamanho, align: antigo.align ?? defBloco.align, largura: antigo.largura ?? defBloco.largura };
    })};
  });
  return resultado;
}

function getLayout() {
  const saved = empresaConfigCache.config.layout;
  const def = getLayoutDefaults();
  if (!saved) return JSON.parse(JSON.stringify(def));
  const formatoNovo = saved.cert && Array.isArray(saved.cert.blocos);
  const resultado = !formatoNovo ? migrarLayoutAntigoParaBlocos(saved, def) : {
    cert:  { blocos: Array.isArray(saved.cert.blocos)  && saved.cert.blocos.length  ? saved.cert.blocos  : def.cert.blocos },
    carta: { blocos: Array.isArray(saved.carta.blocos) && saved.carta.blocos.length ? saved.carta.blocos : def.carta.blocos }
  };
  // Autocorreção: se algum bloco ficou apontando pra uma fonte que não existe mais
  // (ex: fonte personalizada removida sem atualizar os blocos, ou dado salvo antigo/corrompido),
  // volta pra Helvetica em vez de deixar o editor quebrado pra sempre.
  const chavesValidas = new Set(Object.keys(FONTES_PADRAO).concat((empresaConfigCache.config.fontesCustom || []).map(f => f.chave)));
  ['cert', 'carta'].forEach(tipo => {
    resultado[tipo].blocos.forEach(b => {
      if (!chavesValidas.has(b.fonte)) b.fonte = 'helvetica';
    });
  });
  return resultado;
}

// Variáveis dinâmicas disponíveis pra associar a um bloco (inclui campos personalizados do fornecedor)
function getVariaveisDoc() {
  const d = db();
  const vars = {
    fornecedor:     { label: 'Nome do fornecedor' },
    nota:           { label: 'Nota final' },
    periodo:        { label: 'Período avaliado' },
    situacao:       { label: 'Situação (Aprovado/Parcial/Reprovado)' },
    cnpj:           { label: 'CNPJ do fornecedor' },
    setor:          { label: 'Setor do fornecedor' },
    corpo_texto:    { label: 'Texto do status (edite clicando neste bloco)' },
    data_hoje:      { label: 'Data de hoje (por extenso)' },
    rodape_empresa: { label: 'Endereço/contato da empresa' }
  };
  (d.camposFornecedorCustom || []).forEach(c => { vars['extra_' + c.chave] = { label: 'Campo personalizado: ' + c.label }; });
  return vars;
}

// Resolve o valor de uma variável pro texto final (usado tanto no preview do editor quanto no PDF)
function resolveVariavelValor(chave, ctx) {
  switch (chave) {
    case 'fornecedor': return ctx.fornecedor.nome + (ctx.isCert ? '' : '.');
    case 'empresa': return ctx.empresaNome;
    case 'nota': return ctx.isCert ? `NOTA: ${ctx.nota}` : ctx.nota;
    case 'periodo': return ctx.periodo;
    case 'situacao': return getSubtituloDoc(ctx.sit);
    case 'cnpj': return ctx.fornecedor.cnpj || '';
    case 'setor': return ctx.fornecedor.setor || '';
    case 'criticidade': return ctx.fornecedor.criticidade || '';
    case 'corpo_texto': return ctx.corpoTexto;
    case 'saudacao': return `${ctx.empresaNome} certifica que:`;
    case 'data_hoje': {
      const hoje = new Date();
      const txt = `${ctx.dadosEmpresa.cidade || ''}, ${hoje.getDate()} de ${MESES[hoje.getMonth()+1]} de ${hoje.getFullYear()}`;
      return ctx.isCert ? txt : txt + '.';
    }
    case 'rodape_empresa': {
      const e = ctx.dadosEmpresa;
      return ctx.isCert
        ? ([e.endereco, e.tel ? `Fones: ${e.tel}` : '', e.cep ? `CEP: ${e.cep} | ${e.cidade||''}` : e.cidade].filter(Boolean).join(' | ') || ctx.empresaNome)
        : ([e.endereco, e.cidade, e.cep ? `CEP: ${e.cep}` : '', e.tel].filter(Boolean).join(' | ') || ctx.empresaNome);
    }
    default:
      if (chave.startsWith('extra_')) return (ctx.fornecedor.extras || {})[chave.slice(6)] || '';
      return '';
  }
}


function renderAdConfig() {
  const d = db();

  // ---- dados da assinatura (usados no card "Assinatura" dentro de Minha empresa) ----
  const STATUS_LABELS = { trial: 'Trial', ativa: 'Ativa', expirada: 'Expirada', cancelada: 'Cancelada' };
  const STATUS_BADGE_CLASS = { trial: 'trial', ativa: 'ativo', expirada: 'expirado', cancelada: 'cancelado' };
  const PLANO_LABELS = { essencial: 'Essencial', profissional: 'Profissional', enterprise: 'Enterprise' };
  const statusAtual = d.statusEmpresa || 'ativa';
  const planoLabel = d.plano ? (PLANO_LABELS[d.plano] || d.plano) : null;
  // pill de status (só "Ativa"/"Trial"/etc.) e a tag do nome do plano ficam separados agora
  const badgeTexto = STATUS_LABELS[statusAtual] || statusAtual;
  const badgeClasse = STATUS_BADGE_CLASS[statusAtual] || 'ativo';
  const planoTagHtml = planoLabel ? `<span class="plan-name-tag">${planoLabel}</span>` : '';

  let trialBannerHtml = '';
  if (statusAtual === 'trial' && d.trialTerminaEm) {
    const hoje0h = new Date(); hoje0h.setHours(0, 0, 0, 0);
    const fimTrial0h = new Date(d.trialTerminaEm); fimTrial0h.setHours(0, 0, 0, 0);
    const diasRestantes = Math.round((fimTrial0h - hoje0h) / 86400000);
    trialBannerHtml = `<div class="trial-banner-inline">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ${diasRestantes > 0 ? `Faltam ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} pro fim do teste grátis` : 'Seu teste grátis acabou'}
    </div>`;
  }

  const totalFornecedores = d.fornecedores.length;
  const totalAdmins = d.usuarios.filter(u => (u.papel === 'admin' || u.papel === 'admin_master') && u.ativo).length;

  function usageRowHtml(iconSvg, label, atual, limite) {
    const pct = limite ? Math.min(100, Math.round(atual / limite * 100)) : 0;
    return `
      <div class="usage-row">
        <div class="usage-row-icon">${iconSvg}</div>
        <div class="usage-row-body">
          <div class="usage-row-label">${label}</div>
          ${limite !== null ? `<div class="usage-bar"><div class="usage-bar-fill" style="width:${pct}%"></div></div>` : ''}
        </div>
        <div class="usage-row-value">${atual}${limite !== null ? ' / ' + limite : ' · sem limite'}</div>
      </div>`;
  }

  const iconFornecedores = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>';
  const iconAdmins = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>';

  // ---- só admin_master vê valores/cancela; admin comum vê tudo mascarado (***) ----
  const isAdminMaster = currentUser.papel === 'admin_master';
  // só considera "plano assinado" quando realmente ativa — trial não conta, mesmo já tendo um plano escolhido
  const planoAtivo = (statusAtual === 'ativa') ? d.plano : null;

  const PLANOS_INFO = {
    essencial: { nome: 'Essencial', preco: 149, recomendado: false },
    profissional: { nome: 'Profissional', preco: 349, recomendado: true },
  };

  function precoTextoPlano(preco) {
    return isAdminMaster ? `R$ ${preco}` : '***';
  }

  // Card de um plano ainda não assinado — botão "Assinar" (só aparece quando NÃO tem nenhum plano ativo ainda)
  function cardAssinarHtml(planoKey) {
    const { nome, preco, recomendado } = PLANOS_INFO[planoKey];
    const botao = isAdminMaster
      ? `<button class="btn ${recomendado ? 'btn-primary' : 'btn-secondary'} btn-block" onclick="assinarPlano('${planoKey}')">Assinar ${nome}</button>`
      : `<button class="btn ${recomendado ? 'btn-primary' : 'btn-secondary'} btn-block" disabled style="opacity:.5; cursor:not-allowed" title="Só o Admin+ pode gerenciar a assinatura">Assinar ${nome}</button>`;
    return `
      <div class="upgrade-card${recomendado ? ' recommended' : ''}">
        ${recomendado ? '<span class="upgrade-card-tag">Recomendado</span>' : ''}
        <div style="font-weight:700; margin-bottom:4px">${nome}</div>
        <div style="font-size:19px; font-weight:700; color:var(--accent); margin-bottom:10px">${precoTextoPlano(preco)}<span style="font-size:11.5px; font-weight:400; color:var(--text-muted)">/mês</span></div>
        ${botao}
      </div>`;
  }

  // Card do plano já assinado — no lugar de "Assinar" fica "CANCELAR"
  function cardAssinadoHtml(planoKey) {
    const { nome, preco, recomendado } = PLANOS_INFO[planoKey];
    const acoes = isAdminMaster
      ? `<button class="btn btn-danger btn-block btn-cancelar" onclick="abrirCancelarAssinatura()">Cancelar</button>`
      : `<button class="btn btn-secondary btn-block" disabled style="display:flex; align-items:center; justify-content:center; gap:6px; opacity:.7; cursor:default">
           <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
           Assinado
         </button>`;
    return `
      <div class="upgrade-card${recomendado ? ' recommended' : ''}">
        ${recomendado ? '<span class="upgrade-card-tag">Recomendado</span>' : ''}
        <div style="font-weight:700; margin-bottom:4px">${nome}</div>
        <div style="font-size:19px; font-weight:700; color:var(--accent); margin-bottom:10px">${precoTextoPlano(preco)}<span style="font-size:11.5px; font-weight:400; color:var(--text-muted)">/mês</span></div>
        ${acoes}
      </div>`;
  }

  // Card do OUTRO plano (o que não tá ativo) enquanto já existe uma assinatura ativa —
  // fica acinzentado e bloqueado; só dá pra escolher ele depois de cancelar o atual.
  function cardBloqueadoHtml(planoKey) {
    const { nome, preco, recomendado } = PLANOS_INFO[planoKey];
    return `
      <div class="upgrade-card disabled${recomendado ? ' recommended' : ''}">
        ${recomendado ? '<span class="upgrade-card-tag">Recomendado</span>' : ''}
        <div style="font-weight:700; margin-bottom:4px">${nome}</div>
        <div style="font-size:19px; font-weight:700; color:var(--accent); margin-bottom:10px">${precoTextoPlano(preco)}<span style="font-size:11.5px; font-weight:400; color:var(--text-muted)">/mês</span></div>
        <button class="btn btn-secondary btn-block" disabled style="opacity:.5; cursor:not-allowed" title="Cancele a assinatura atual antes de trocar de plano">Assinar ${nome}</button>
      </div>`;
  }

  let upgradeCardsHtml;
  if (planoAtivo && PLANOS_INFO[planoAtivo]) {
    const planoOutro = planoAtivo === 'essencial' ? 'profissional' : 'essencial';
    upgradeCardsHtml = `
      <div class="upgrade-cards">
        ${cardAssinadoHtml(planoAtivo)}
        ${cardBloqueadoHtml(planoOutro)}
      </div>`;
  } else {
    upgradeCardsHtml = `
      <div class="upgrade-cards">
        ${cardAssinarHtml('essencial')}
        ${cardAssinarHtml('profissional')}
      </div>`;

  }

  document.getElementById('ad-page-config').innerHTML = `
    <div class="page-header"><div><h2>Configurações</h2><p>Matriz de qualificação, layout dos documentos e dados da empresa</p></div></div>

    <div class="config-tab-bar">
      <button class="config-tab-btn active" onclick="showConfigTabAd('matriz', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 17H5"/><path d="M19 7h-9"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
        Matriz de qualificação
      </button>
      <button class="config-tab-btn" onclick="showConfigTabAd('layout', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>
        Layout e textos
      </button>
      <button class="config-tab-btn" onclick="showConfigTabAd('camposfor', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>
        Campos do fornecedor
      </button>
      <button class="config-tab-btn" onclick="showConfigTabAd('tiposdoc', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
        Tipos de documento
      </button>
      <button class="config-tab-btn" onclick="showConfigTabAd('cobranca', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
        Cobrança automática
      </button>
      <button class="config-tab-btn" onclick="showConfigTabAd('empresa', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>
        Minha empresa
      </button>
      <button class="config-tab-btn" onclick="showConfigTabAd('retencao', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
        Retenção de dados
      </button>
    </div>

    <div id="config-tab-matriz" class="config-tab-ad">
      <div class="card">
        <div class="card-title">Faixas de pontuação</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px">Cada faixa exige que a nota atenda ou supere o valor mínimo definido.</p>
        <div class="matrix-rows">
          <div class="matrix-row">
            <div class="status-icon amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>
            </div>
            <div class="matrix-row-body">
              <div class="matrix-row-title">Certificado</div>
              <div class="matrix-row-sub">Nota exata mínima</div>
            </div>
            <div class="matrix-row-input">
              <input type="number" id="corte-cert" step="0.1" value="${d.matriz.cert}">
              <span>/ 10</span>
            </div>
          </div>
          <div class="matrix-row">
            <div class="status-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div class="matrix-row-body">
              <div class="matrix-row-title">Aprovado</div>
              <div class="matrix-row-sub">Nota mínima</div>
            </div>
            <div class="matrix-row-input">
              <input type="number" id="corte-aprov" step="0.1" value="${d.matriz.aprov}">
              <span>/ 10</span>
            </div>
          </div>
          <div class="matrix-row">
            <div class="status-icon amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <div class="matrix-row-body">
              <div class="matrix-row-title">Parcialmente aprovado</div>
              <div class="matrix-row-sub">Nota mínima</div>
            </div>
            <div class="matrix-row-input">
              <input type="number" id="corte-parcial" step="0.1" value="${d.matriz.parcial}">
              <span>/ 10</span>
            </div>
          </div>
          <div class="matrix-row">
            <div class="status-icon rose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            </div>
            <div class="matrix-row-body">
              <div class="matrix-row-title">Reprovado</div>
              <div class="matrix-row-sub">Abaixo do parcialmente aprovado — exige indicação obrigatória de melhoria pelo avaliador.</div>
            </div>
            <span class="badge-auto">Automático</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="salvarMatriz()">Salvar matriz</button>
      </div>
    </div>

    <div id="config-tab-layout" class="config-tab-ad" style="display:none">
      <div class="card">
        <div class="card-title">Posição dos textos no documento</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:6px">Arraste os blocos na pré-visualização para reposicionar, ou digite as coordenadas exatas (em mm) na tabela ao lado.</p>
        <div class="tab-bar">
          <button class="tab active" onclick="showLayoutSubtab('cert', this)">Certificado (paisagem · nota 10)</button>
          <button class="tab" onclick="showLayoutSubtab('carta', this)">Carta (retrato · demais notas)</button>
        </div>
        <div id="layout-editor-cert" class="layout-editor-wrap"></div>
        <div id="layout-editor-carta" class="layout-editor-wrap" style="display:none"></div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px">
        <div class="card" style="margin-bottom:0">
          <div class="card-title">Imagem de fundo — Certificado (paisagem A4)</div>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Faça upload de uma imagem (PNG ou JPG) para usar como fundo do certificado de aprovação. O sistema sobrepõe o texto automaticamente. Tamanho ideal: 3508 × 2480 px.</p>
          <div id="fundo-cert-preview" style="margin-bottom:12px"></div>
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap">
            <button class="btn btn-secondary" onclick="document.getElementById('upload-fundo-cert').click()">📎 Selecionar imagem</button>
            <button class="btn btn-danger btn-sm" onclick="removerFundo('ap_fundo_certificado', 'fundo-cert-preview')">Remover fundo</button>
          </div>
          <input type="file" id="upload-fundo-cert" accept="image/*" style="display:none" onchange="uploadFundo('ap_fundo_certificado', this, 'fundo-cert-preview')">
        </div>
        <div class="card" style="margin-bottom:0">
          <div class="card-title">Imagem de fundo — Cartas (retrato A4)</div>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Fundo usado nas cartas de aprovação, parcial e reprovação. Tamanho ideal: 2480 × 3508 px.</p>
          <div id="fundo-carta-preview" style="margin-bottom:12px"></div>
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap">
            <button class="btn btn-secondary" onclick="document.getElementById('upload-fundo-carta').click()">📎 Selecionar imagem</button>
            <button class="btn btn-danger btn-sm" onclick="removerFundo('ap_fundo_carta', 'fundo-carta-preview')">Remover fundo</button>
          </div>
          <input type="file" id="upload-fundo-carta" accept="image/*" style="display:none" onchange="uploadFundo('ap_fundo_carta', this, 'fundo-carta-preview')">
        </div>
      </div>
      <div class="card">
        <div class="card-title">Fontes personalizadas</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Além das 3 fontes padrão (Helvetica, Times, Courier), você pode importar qualquer fonte no formato <b>.ttf</b>. Pra ter negrito/itálico de verdade nos PDFs, importe um <b>.zip</b> com os pesos da família (ex: <code>Regular.ttf</code>, <code>Bold.ttf</code>, <code>Italic.ttf</code>, <code>BoldItalic.ttf</code>) — o sistema detecta sozinho qual arquivo é qual pelo nome. Se importar só um <code>.ttf</code>, negrito/itálico usam o mesmo desenho da fonte regular.</p>
        <p id="fontes-custom-contador" style="font-size:11.5px; font-weight:600; color:var(--text-sec); margin-bottom:10px">0/8 fontes importadas</p>
        <div style="display:flex; gap:10px; align-items:end; flex-wrap:wrap; margin-bottom:14px">
          <div class="form-group" style="margin:0"><label>Nome da fonte</label><input type="text" id="fonte-custom-nome" placeholder="Ex: Montserrat" style="width:220px"></div>
          <input type="file" id="fonte-custom-arquivo" accept=".ttf,.zip" style="max-width:260px">
          <button id="fonte-custom-btn-add" class="btn btn-primary" onclick="adicionarFontePersonalizada()">+ Importar fonte</button>
        </div>
        <div id="fontes-custom-lista"></div>
      </div>
    </div>

    <div id="config-tab-camposfor" class="config-tab-ad" style="display:none">
      <div class="card">
        <div class="card-title">Campos do fornecedor</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px">Além de nome, tipo, setor, e-mail, CNPJ e criticidade, adicione campos personalizados que aparecem automaticamente no cadastro.</p>

        <div class="subcard">
          <div class="subcard-title">Novo campo personalizado</div>
          <div id="campos-fornecedor-lista"></div>
          <div class="subcard-divider"></div>
          <div class="form-row three">
            <div class="form-group"><label>Chave (sem espaço/acento)</label><input type="text" id="ncf-chave" placeholder="ex: categoria"></div>
            <div class="form-group"><label>Rótulo (exibido)</label><input type="text" id="ncf-label" placeholder="ex: Categoria"></div>
            <div class="form-group"><label>Tipo de campo</label>
              <select id="ncf-tipo" onchange="document.getElementById('ncf-opcoes-wrap').style.display = this.value === 'select' ? 'flex' : 'none'">
                <option value="texto">Texto</option>
                <option value="select">Lista (opções)</option>
                <option value="data">Data</option>
              </select>
            </div>
          </div>
          <div class="form-group" id="ncf-opcoes-wrap" style="display:none; margin-bottom:14px">
            <label>Opções (separadas por vírgula)</label>
            <input type="text" id="ncf-opcoes" placeholder="ex: Nacional, Importado, Local">
          </div>
          <button class="btn btn-primary" onclick="addCampoFornecedorCustom()">+ Adicionar campo</button>
        </div>
      </div>
    </div>

    <div id="config-tab-tiposdoc" class="config-tab-ad" style="display:none">
      <div class="card">
        <div class="card-title">Tipos de documento</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Cadastre os tipos de documento mais usados (ex: Alvará de Funcionamento, CRT, Contrato). Eles aparecem como sugestão ao arquivar um documento de fornecedor — você ainda pode digitar um nome diferente se precisar.</p>
        <div id="tipos-documento-lista" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px"></div>
        <div class="form-row" style="grid-template-columns:1fr auto">
          <div class="form-group"><label>Novo tipo de documento</label><input type="text" id="ntd-nome" placeholder="ex: Licença Ambiental" onkeydown="if(event.key==='Enter'){event.preventDefault(); addTipoDocumento();}"></div>
          <button class="btn btn-primary" style="align-self:flex-end; height:38px" onclick="addTipoDocumento()">Adicionar</button>
        </div>
      </div>
    </div>

    <div id="config-tab-cobranca" class="config-tab-ad" style="display:none">
      <div class="card">
        <div class="card-title">Cobrança automática de documentos</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px">Quando ligado, o sistema manda sozinho o e-mail de "documento vencendo/vencido" pro fornecedor, sem você precisar clicar em nada. Só vale pra documentos de <b>Fornecedores</b> com e-mail cadastrado (não se aplica a Meus Documentos, que não tem destinatário).</p>

        <div class="toggle-row">
          <div class="toggle-row-body">
            <div class="toggle-row-title">Ativar cobrança automática por e-mail</div>
            <div class="toggle-row-sub">Aviso enviado ao fornecedor com e-mail cadastrado quando um documento estiver perto de vencer.</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="cfg-cobranca-ativa" ${d.cobrancaAutomaticaAtiva ? 'checked' : ''}>
            <span class="switch-slider"></span>
          </label>
        </div>

        <div class="form-group" style="max-width:360px; margin-bottom:16px">
          <label>Frequência do aviso</label>
          <select id="cfg-cobranca-frequencia">
            <option value="chave" ${d.cobrancaAutomaticaFrequencia === 'chave' ? 'selected' : ''}>Só 2x — ao entrar na janela de aviso e no dia do vencimento</option>
            <option value="semanal" ${d.cobrancaAutomaticaFrequencia === 'semanal' ? 'selected' : ''}>1x por semana, enquanto estiver pendente</option>
            <option value="diaria" ${d.cobrancaAutomaticaFrequencia === 'diaria' ? 'selected' : ''}>Todo dia, enquanto estiver pendente</option>
          </select>
        </div>

        <button class="btn btn-primary" onclick="salvarConfigCobrancaAutomatica()">Salvar</button>
      </div>

      <div class="card">
        <div class="card-title">Lembrete automático pros avaliadores</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px">Manda e-mail sozinho pro avaliador quando ele tem avaliação pendente/atrasada, com o link de acesso. Independente disso, você sempre pode disparar manualmente em Usuários e acessos → "Enviar lembrete pra todos os pendentes".</p>

        <div class="toggle-row">
          <div class="toggle-row-body">
            <div class="toggle-row-title">Ativar lembrete automático pros avaliadores</div>
            <div class="toggle-row-sub">Manda e-mail ao avaliador com o link de acesso quando ele tem avaliação pendente ou atrasada.</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="cfg-lembrete-ativo" ${d.lembreteAvaliadorAtivo ? 'checked' : ''}>
            <span class="switch-slider"></span>
          </label>
        </div>

        <div class="form-group" style="max-width:360px; margin-bottom:16px">
          <label>Frequência do lembrete</label>
          <select id="cfg-lembrete-frequencia">
            <option value="chave" ${d.lembreteAvaliadorFrequencia === 'chave' ? 'selected' : ''}>Só 2x — ao ficar pendente e ao atrasar</option>
            <option value="semanal" ${d.lembreteAvaliadorFrequencia === 'semanal' ? 'selected' : ''}>1x por semana, enquanto estiver pendente</option>
            <option value="diaria" ${d.lembreteAvaliadorFrequencia === 'diaria' ? 'selected' : ''}>Todo dia, enquanto estiver pendente</option>
          </select>
        </div>

        <button class="btn btn-primary" onclick="salvarConfigLembreteAvaliador()">Salvar</button>
      </div>

      <div class="card">
        <div class="card-title">Receber notificações de atualizações por e-mail</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px">Quando ligado, os admins marcados como "recebe notificação" (em Usuários e acessos) recebem um e-mail na hora — sem esperar cron — assim que um fornecedor envia um documento pra aprovação, ou assim que um avaliador conclui uma avaliação de serviço.</p>

        <div class="toggle-row">
          <div class="toggle-row-body">
            <div class="toggle-row-title">Ativar notificações de atualizações por e-mail</div>
            <div class="toggle-row-sub">Documento enviado pelo fornecedor ou avaliação concluída avisam os admins marcados na hora.</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="cfg-notif-atividade-ativo" ${d.notificarAtividadeAtivo ? 'checked' : ''}>
            <span class="switch-slider"></span>
          </label>
        </div>

        <button class="btn btn-primary" onclick="salvarConfigNotificacaoAtividade()">Salvar</button>
      </div>
    </div>

    <div id="config-tab-empresa" class="config-tab-ad" style="display:none">
      <div class="account-cards">

        <div class="card" style="margin-bottom:0">
          <div class="card-title">
            <span class="card-title-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>
              Dados cadastrais
            </span>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Nome da empresa</label><input type="text" id="emp-nome" value="${d.nomeEmpresa || d.empresa.nome || ''}"></div>
            <div class="form-group"><label>Cidade/UF</label><input type="text" id="emp-cidade" value="${d.empresa.cidade||''}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Endereço</label><input type="text" id="emp-endereco" value="${d.empresa.endereco||''}"></div>
            <div class="form-group"><label>CEP</label><input type="text" id="emp-cep" value="${d.empresa.cep||''}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Telefone</label><input type="text" id="emp-tel" value="${d.empresa.tel||''}"></div>
            <div class="form-group"><label>E-mail</label><input type="text" id="emp-email" value="${d.empresa.email||''}"></div>
          </div>
          <button class="btn btn-primary" onclick="salvarEmpresaAd()">Salvar dados</button>
        </div>

        <div class="card" style="margin-bottom:0">
          <div class="card-title">
            <span style="display:flex; align-items:center; gap:8px">
              <span class="card-title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                Assinatura
              </span>
              ${planoTagHtml}
            </span>
            <span class="plan-badge ${badgeClasse}">${badgeTexto}</span>
          </div>

          ${trialBannerHtml}

          ${usageRowHtml(iconFornecedores, 'Fornecedores cadastrados', totalFornecedores, d.limiteFornecedores)}
          ${usageRowHtml(iconAdmins, 'Admins ativos', totalAdmins, d.limiteAdmins)}

          ${upgradeCardsHtml}
          <p style="font-size:11px; color:var(--text-muted); margin-top:14px">Enterprise é negociado diretamente — fale com a gente em <a href="mailto:contato@homologpro.com.br" style="color:var(--accent)">contato@homologpro.com.br</a>.</p>
        </div>

      </div>
    </div>

    <div id="config-tab-retencao" class="config-tab-ad" style="display:none">
      <div class="card">
        <div class="card-title">Retenção de avaliações de serviço</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Desligado por padrão — nada é sinalizado pra exclusão até você definir um prazo. Depois de configurado, avaliações mais antigas que esse prazo aparecem em "Avaliações → Retenção" pra você revisar e decidir (nada é apagado sozinho).</p>
        <div class="form-row">
          <div class="form-group">
            <label>Guardar avaliações por quantos anos?</label>
            <input type="number" id="cfg-anos-retencao" min="1" step="1" value="${d.anosRetencaoAvaliacao || ''}" placeholder="Deixe em branco para desligar">
          </div>
        </div>
        <button class="btn btn-primary" onclick="salvarRetencaoAvaliacao()">Salvar</button>
      </div>
    </div>
  `;
}

function showConfigTabAd(tab, btn) {
  document.querySelectorAll('.config-tab-ad').forEach(el => el.style.display = 'none');
  document.querySelectorAll('#ad-page-config .config-tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('config-tab-' + tab).style.display = 'block';
  btn.classList.add('active');
}

async function salvarConfigCobrancaAutomatica() {
  const ativa = document.getElementById('cfg-cobranca-ativa').checked;
  const frequencia = document.getElementById('cfg-cobranca-frequencia').value;

  const { error } = await supabaseClient.from('empresas').update({
    cobranca_automatica_ativa: ativa,
    cobranca_automatica_frequencia: frequencia,
  }).eq('id', currentUser.empresaId);

  if (error) { toast('Erro ao salvar: ' + error.message); return; }

  empresaConfigCache.cobranca_automatica_ativa = ativa;
  empresaConfigCache.cobranca_automatica_frequencia = frequencia;
  addLog('config_cobranca_automatica', `${currentUser.email} ${ativa ? 'ativou' : 'desativou'} a cobrança automática (frequência: ${frequencia})`);
  toast('Configuração salva!');
}

async function assinarPlano(plano) {
  toast('Preparando checkout...');
  const { data, error } = await supabaseClient.functions.invoke('criar-checkout-sessao', { body: { plano } });

  if (error || !data || data.ok === false) {
    toast((data && data.error) || 'Não foi possível iniciar o checkout agora.');
    return;
  }
  if (!data.url) { toast('Checkout ainda não configurado no servidor.'); return; }

  window.location.href = data.url;
}

// Só admin_master chama isso (o botão nem aparece pra admin comum, e o
// front confere de novo aqui — a Edge Function também confere no servidor).
function abrirCancelarAssinatura() {
  if (currentUser.papel !== 'admin_master') return;
  openModal(`
    <h3>Cancelar assinatura</h3>
    <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">
      Isso desliga a renovação automática. O acesso ao plano atual continua valendo até o fim do período já pago — depois disso a conta cai pra bloqueada.
      Pra confirmar, digite sua senha.
    </p>
    <div class="form-group">
      <label>Sua senha</label>
      <input type="password" id="cancel-assinatura-senha" placeholder="••••••••">
    </div>
    <div style="display:flex; gap:8px; margin-top:10px">
      <button class="btn btn-danger btn-block" onclick="confirmarCancelamentoAssinatura()">Confirmar cancelamento</button>
      <button class="btn btn-secondary" onclick="closeModal()">Voltar</button>
    </div>
  `);
}

async function confirmarCancelamentoAssinatura() {
  const senha = document.getElementById('cancel-assinatura-senha').value;
  if (!senha) { toast('Digite sua senha pra confirmar.'); return; }

  // reautentica com a própria senha antes de deixar cancelar qualquer coisa
  const { error: erroSenha } = await supabaseClient.auth.signInWithPassword({ email: currentUser.email, password: senha });
  if (erroSenha) { toast('Senha incorreta.'); return; }

  toast('Cancelando assinatura...');
  const { data, error } = await supabaseClient.functions.invoke('cancelar-assinatura', { body: {} });

  if (error || (data && data.ok === false)) {
    toast((data && data.error) || 'Não foi possível cancelar agora. Tenta de novo em instantes.');
    return;
  }

  closeModal();
  addLog('assinatura_cancelada', `${currentUser.email} cancelou a assinatura da empresa`);
  toast('Assinatura cancelada. O acesso continua até o fim do período já pago.');
  await carregarEmpresaConfig();
  renderAdConfig();
}

async function salvarConfigLembreteAvaliador() {
  const ativo = document.getElementById('cfg-lembrete-ativo').checked;
  const frequencia = document.getElementById('cfg-lembrete-frequencia').value;

  const { error } = await supabaseClient.from('empresas').update({
    lembrete_avaliador_ativo: ativo,
    lembrete_avaliador_frequencia: frequencia,
  }).eq('id', currentUser.empresaId);

  if (error) { toast('Erro ao salvar: ' + error.message); return; }

  empresaConfigCache.lembrete_avaliador_ativo = ativo;
  empresaConfigCache.lembrete_avaliador_frequencia = frequencia;
  addLog('config_lembrete_avaliador', `${currentUser.email} ${ativo ? 'ativou' : 'desativou'} o lembrete automático dos avaliadores (frequência: ${frequencia})`);
  toast('Configuração salva!');
}

async function salvarConfigNotificacaoAtividade() {
  const ativo = document.getElementById('cfg-notif-atividade-ativo').checked;

  const { error } = await supabaseClient.from('empresas').update({
    notificar_atividade_ativo: ativo,
  }).eq('id', currentUser.empresaId);

  if (error) { toast('Erro ao salvar: ' + error.message); return; }

  empresaConfigCache.notificar_atividade_ativo = ativo;
  addLog('config_notificacao_atividade', `${currentUser.email} ${ativo ? 'ativou' : 'desativou'} a notificação de atualizações por e-mail`);
  toast('Configuração salva!');
}
// Helper compartilhado: mescla uma chave dentro de empresas.config (jsonb)
// sem sobrescrever as outras chaves que já estão lá.
async function salvarConfigEmpresa(chave, valor) {
  const novoConfig = { ...empresaConfigCache.config, [chave]: valor };
  const { error } = await supabaseClient.from('empresas').update({ config: novoConfig }).eq('id', currentUser.empresaId);
  if (error) return { error };
  empresaConfigCache.config = novoConfig;
  return { error: null };
}

async function salvarMatriz() {
  const matriz = {
    cert: parseFloat(document.getElementById('corte-cert').value),
    aprov: parseFloat(document.getElementById('corte-aprov').value),
    parcial: parseFloat(document.getElementById('corte-parcial').value)
  };
  const { error } = await salvarConfigEmpresa('matriz', matriz);
  if (error) { toast('Erro ao salvar matriz: ' + error.message); return; }
  addLog('matriz_atualizada', `${currentUser.email} atualizou a matriz de qualificação (cert:${matriz.cert} aprov:${matriz.aprov} parcial:${matriz.parcial})`);
  toast('Matriz de qualificação salva!');
}


async function salvarEmpresaAd() {
  const empresa = {};
  ['nome','cidade','endereco','cep','tel','email'].forEach(k => {
    empresa[k] = document.getElementById('emp-' + k).value.trim();
  });
  const { error } = await salvarConfigEmpresa('empresa', empresa);
  if (error) { toast('Erro ao salvar dados da empresa: ' + error.message); return; }

  // "nome" também vive numa coluna própria (é o que aparece no menu lateral,
  // em Meus Documentos e nos e-mails) — mantém as duas fontes sincronizadas.
  if (empresa.nome) {
    const { error: nomeErr } = await supabaseClient.from('empresas').update({ nome: empresa.nome }).eq('id', currentUser.empresaId);
    if (!nomeErr) empresaConfigCache.nome = empresa.nome;
  }

  addLog('empresa_atualizada', `${currentUser.email} atualizou os dados da empresa`);
  toast('Dados da empresa salvos!');
}

async function salvarRetencaoAvaliacao() {
  const valorInput = document.getElementById('cfg-anos-retencao').value.trim();
  const anos = valorInput ? parseInt(valorInput) : null;
  if (valorInput && (!anos || anos < 1)) { toast('Informe um número de anos válido, ou deixe em branco pra desligar.'); return; }

  const { error } = await supabaseClient.from('empresas').update({ anos_retencao_avaliacao: anos }).eq('id', currentUser.empresaId);
  if (error) { toast('Erro ao salvar: ' + error.message); return; }

  empresaConfigCache.anos_retencao_avaliacao = anos;
  addLog('retencao_avaliacao_atualizada', `${currentUser.email} ${anos ? `definiu retenção de ${anos} ano(s) pras avaliações de serviço` : 'desligou a retenção de avaliações de serviço'}`);
  toast(anos ? `Retenção definida: ${anos} ano(s).` : 'Retenção desligada.');
}

// ---- Upload de fundo de documento ----
// Fundos ficam salvos em empresas.config (Supabase), não mais no localStorage —
// assim qualquer usuário da empresa, em qualquer dispositivo, vê o mesmo fundo.
const FUNDO_CONFIG_KEY = { ap_fundo_certificado: 'fundoCertificado', ap_fundo_carta: 'fundoCarta' };
function getFundoConfig(storageKey) {
  return empresaConfigCache.config[FUNDO_CONFIG_KEY[storageKey]] || null;
}
async function uploadFundo(storageKey, input, previewId) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) { toast('Imagem muito grande. Use até 3MB.'); return; }
  const reader = new FileReader();
  reader.onload = async e => {
    const { error } = await salvarConfigEmpresa(FUNDO_CONFIG_KEY[storageKey], e.target.result);
    if (error) { toast('Erro ao salvar fundo: ' + error.message); return; }
    renderFundoPreview(storageKey, previewId);
    atualizarFundoNoEditorLayout(storageKey);
    addLog('fundo_atualizado', `${currentUser.email} atualizou o fundo do documento (${storageKey})`);
    toast('Imagem de fundo salva!');
  };
  reader.readAsDataURL(file);
}

async function removerFundo(storageKey, previewId) {
  const { error } = await salvarConfigEmpresa(FUNDO_CONFIG_KEY[storageKey], null);
  if (error) { toast('Erro ao remover fundo: ' + error.message); return; }
  renderFundoPreview(storageKey, previewId);
  atualizarFundoNoEditorLayout(storageKey);
  toast('Fundo removido.');
}

// Atualiza o fundo direto no canvas do editor de layout, sem precisar sair e voltar da aba
function atualizarFundoNoEditorLayout(storageKey) {
  const tipo = storageKey === 'ap_fundo_certificado' ? 'cert' : 'carta';
  if (layoutEditorState) renderLayoutEditorTipo(tipo);
}

function renderFundoPreview(storageKey, previewId) {
  const wrap = document.getElementById(previewId);
  if (!wrap) return;
  const fundo = getFundoConfig(storageKey);
  if (fundo) {
    wrap.innerHTML = `<img src="${fundo}" style="max-width:240px; max-height:140px; border-radius:8px; border:1px solid var(--border); object-fit:cover">
      <p style="font-size:11px; color:var(--success); margin-top:6px">✅ Fundo configurado</p>`;
  } else {
    wrap.innerHTML = `<p style="font-size:12px; color:var(--text-muted)">Nenhum fundo configurado — será gerado com fundo branco.</p>`;
  }
}

// ---- Editor de layout (posição dos textos) ----
const LAYOUT_DIMS = { cert: { W: 297, H: 210, scale: 640/297 }, carta: { W: 210, H: 297, scale: 320/210 } };
const FONTES_PADRAO = { helvetica: { label: 'Helvetica (sem serifa)', css: "'Helvetica Neue', Arial, sans-serif" }, times: { label: 'Times (serifada)', css: "'Times New Roman', Times, serif" }, courier: { label: 'Courier (monoespaçada)', css: "'Courier New', Courier, monospace" } };
let FONTES_DOC = { ...FONTES_PADRAO };

// Uma fonte personalizada pode vir no formato antigo ({chave, nome, base64}, 1 peso só)
// ou no novo ({chave, nome, arquivos:{normal,bold,italic,bolditalic}}). Essa função sempre
// devolve o formato novo, então o resto do código só precisa lidar com um formato.
function normalizarArquivosFonte(f) {
  return f.arquivos || { normal: f.base64 };
}

// Junta as 3 fontes padrão com as fontes .ttf que a empresa importou, e injeta um
// @font-face pra cada peso disponível, pra elas aparecerem certinho (incl. negrito/itálico
// reais, quando importados) já na pré-visualização do editor.
function atualizarFontesDisponiveis() {
  const customs = empresaConfigCache.config.fontesCustom || [];
  FONTES_DOC = { ...FONTES_PADRAO };
  customs.forEach(f => { FONTES_DOC[f.chave] = { label: `${f.nome} (importada)`, css: `'${f.chave}'` }; });

  let styleTag = document.getElementById('fontes-custom-style');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'fontes-custom-style';
    document.head.appendChild(styleTag);
  }
  const DESCRITOR_PESO = {
    normal:     { weight: 400, style: 'normal' },
    bold:       { weight: 700, style: 'normal' },
    italic:     { weight: 400, style: 'italic' },
    bolditalic: { weight: 700, style: 'italic' }
  };
  styleTag.textContent = customs.map(f => {
    const arquivos = normalizarArquivosFonte(f);
    return Object.keys(DESCRITOR_PESO).filter(peso => arquivos[peso]).map(peso => {
      const { weight, style } = DESCRITOR_PESO[peso];
      return `@font-face { font-family: '${f.chave}'; font-weight: ${weight}; font-style: ${style}; src: url(data:font/ttf;base64,${arquivos[peso]}) format('truetype'); }`;
    }).join('\n');
  }).join('\n');
}

// Registra as fontes personalizadas no jsPDF (isso precisa ser feito de novo a cada PDF
// gerado, porque cada `new jsPDF()` tem seu próprio sistema de arquivos de fontes).
function registrarFontesCustomNoPDF(doc) {
  const customs = empresaConfigCache.config.fontesCustom || [];
  customs.forEach(f => {
    const arquivos = normalizarArquivosFonte(f);
    // Sempre existe pelo menos um peso (garantido na importação); usamos ele como
    // "reserva" pros pesos que não foram importados, pra não dar erro no jsPDF —
    // só não vai ficar visualmente diferente no PDF pro peso que faltou.
    const reserva = arquivos.normal || arquivos.bold || arquivos.italic || arquivos.bolditalic;
    ['normal', 'bold', 'italic', 'bolditalic'].forEach(peso => {
      const base64 = arquivos[peso] || reserva;
      const arquivo = `${f.chave}_${peso}.ttf`;
      doc.addFileToVFS(arquivo, base64);
      doc.addFont(arquivo, f.chave, peso);
    });
  });
}

const LIMITE_FONTES_CUSTOM = 8;

function arquivoParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result.split(',')[1]); // tira o prefixo "data:...;base64,"
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

// Lê um .zip com os pesos de uma família de fonte e detecta automaticamente qual arquivo
// é Regular/Bold/Italic/BoldItalic pelo nome (ex: "Montserrat-Bold.ttf", "Montserrat Italic Oblique.ttf").
// Arquivo sem nenhuma dessas palavras no nome é tratado como o peso "normal" (Regular).
async function extrairPesosFonteDoZip(file) {
  const zip = await JSZip.loadAsync(file);
  const arquivos = {};
  const entradas = Object.values(zip.files).filter(f => !f.dir && f.name.toLowerCase().endsWith('.ttf'));
  for (const entrada of entradas) {
    const nomeBase = entrada.name.toLowerCase();
    const temBold = /bold/.test(nomeBase);
    const temItalic = /italic|oblique/.test(nomeBase);
    const peso = temBold && temItalic ? 'bolditalic' : temBold ? 'bold' : temItalic ? 'italic' : 'normal';
    if (arquivos[peso]) continue; // já achou esse peso — mantém o primeiro, ignora duplicata
    const base64 = await entrada.async('base64');
    if (base64.length * 0.75 > 2 * 1024 * 1024) continue; // ignora peso individual > 2MB
    arquivos[peso] = base64;
  }
  return arquivos;
}

async function adicionarFontePersonalizada() {
  const nomeInput = document.getElementById('fonte-custom-nome');
  const fileInput = document.getElementById('fonte-custom-arquivo');
  const nome = nomeInput.value.trim();
  const file = fileInput.files[0];

  if (!nome) { toast('Dê um nome pra essa fonte (ex: Montserrat).'); return; }
  if (!file) { toast('Selecione um arquivo .ttf ou .zip.'); return; }

  const nomeArquivo = file.name.toLowerCase();
  const isZip = nomeArquivo.endsWith('.zip');
  const isTtf = nomeArquivo.endsWith('.ttf');
  if (!isZip && !isTtf) { toast('Envie um arquivo .ttf (um peso só) ou .zip (com Regular/Bold/Italic/BoldItalic).'); return; }
  if (file.size > 9 * 1024 * 1024) { toast('Arquivo muito grande. O total não pode passar de 9MB.'); return; }

  const qtdAtual = (empresaConfigCache.config.fontesCustom || []).length;
  if (qtdAtual >= LIMITE_FONTES_CUSTOM) { toast(`Limite de ${LIMITE_FONTES_CUSTOM} fontes personalizadas atingido. Remova uma pra importar outra.`); return; }

  const btnAdd = document.getElementById('fonte-custom-btn-add');
  if (btnAdd) { btnAdd.disabled = true; btnAdd.textContent = 'Importando...'; }

  try {
    const arquivos = isZip ? await extrairPesosFonteDoZip(file) : { normal: await arquivoParaBase64(file) };

    if (!arquivos.normal && !arquivos.bold && !arquivos.italic && !arquivos.bolditalic) {
      toast('Não encontrei nenhum arquivo .ttf válido (ou até 2MB) dentro do zip.');
      return;
    }
    // Se o zip não tinha um "Regular" claro, usa o primeiro peso encontrado como base —
    // assim sempre sobra pelo menos um arquivo pra usar de reserva nos pesos que faltarem.
    if (!arquivos.normal) {
      const primeiroPeso = ['bold', 'italic', 'bolditalic'].find(p => arquivos[p]);
      arquivos.normal = arquivos[primeiroPeso];
    }

    const chave = 'custom_' + nome.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + Date.now().toString(36);
    const listaAtual = empresaConfigCache.config.fontesCustom || [];
    const novaLista = [...listaAtual, { chave, nome, arquivos }];

    const { error } = await salvarConfigEmpresa('fontesCustom', novaLista);
    if (error) { toast('Erro ao salvar fonte: ' + error.message); return; }

    const pesosImportados = ['normal', 'bold', 'italic', 'bolditalic'].filter(p => arquivos[p]).join(', ');
    addLog('fonte_importada', `${currentUser.email} importou a fonte "${nome}" (pesos: ${pesosImportados})`);
    toast(`Fonte "${nome}" importada! (${pesosImportados.split(', ').length} peso(s))`);
    nomeInput.value = '';
    fileInput.value = '';
    atualizarFontesDisponiveis();
    renderFontesCustomLista();
  } catch (e) {
    toast('Erro ao processar o arquivo: ' + e.message);
  } finally {
    if (btnAdd) { btnAdd.disabled = false; btnAdd.textContent = '+ Importar fonte'; }
  }
}

async function removerFontePersonalizada(chave) {
  if (!confirm('Remover essa fonte? Blocos que já usam ela voltam pra Helvetica.')) return;
  const listaAtual = empresaConfigCache.config.fontesCustom || [];
  const novaLista = listaAtual.filter(f => f.chave !== chave);
  const { error } = await salvarConfigEmpresa('fontesCustom', novaLista);
  if (error) { toast('Erro ao remover fonte: ' + error.message); return; }

  // Corrige os blocos do layout (certificado e carta) que usavam a fonte removida,
  // senão eles ficam "presos" apontando pra uma fonte inexistente e quebram o editor
  // (era isso que causava o erro "Cannot read properties of undefined (reading 'css')").
  const layoutAtual = getLayout();
  let layoutMudou = false;
  ['cert', 'carta'].forEach(tipo => {
    layoutAtual[tipo].blocos.forEach(b => {
      if (b.fonte === chave) { b.fonte = 'helvetica'; layoutMudou = true; }
    });
  });
  if (layoutMudou) {
    await salvarConfigEmpresa('layout', layoutAtual);
    if (typeof layoutEditorState !== 'undefined' && layoutEditorState) layoutEditorState = layoutAtual;
  }

  toast('Fonte removida.');
  atualizarFontesDisponiveis();
  renderFontesCustomLista();
}

function renderFontesCustomLista() {
  const wrap = document.getElementById('fontes-custom-lista');
  if (!wrap) return;
  const customs = empresaConfigCache.config.fontesCustom || [];
  const contador = document.getElementById('fontes-custom-contador');
  if (contador) contador.textContent = `${customs.length}/${LIMITE_FONTES_CUSTOM} fontes importadas`;
  const btnAdd = document.getElementById('fonte-custom-btn-add');
  if (btnAdd) btnAdd.disabled = customs.length >= LIMITE_FONTES_CUSTOM;

  if (!customs.length) {
    wrap.innerHTML = '<p style="font-size:11.5px; color:var(--text-muted)">Nenhuma fonte importada ainda.</p>';
    return;
  }
  const LABEL_PESO = { normal: 'Regular', bold: 'Negrito', italic: 'Itálico', bolditalic: 'Negrito+Itálico' };
  wrap.innerHTML = customs.map(f => {
    const arquivos = normalizarArquivosFonte(f);
    const badges = ['normal', 'bold', 'italic', 'bolditalic'].filter(p => arquivos[p]).map(p =>
      `<span style="font-size:10px; padding:2px 6px; border-radius:4px; background:var(--surface2); color:var(--text-sec); margin-right:4px">${LABEL_PESO[p]}</span>`
    ).join('');
    return `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid var(--border)">
      <div>
        <span style="font-family:'${f.chave}'">${f.nome}</span>
        <div style="margin-top:3px">${badges}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="removerFontePersonalizada('${f.chave}')">Remover</button>
    </div>
  `;
  }).join('');
}

let layoutEditorState = null;
let layoutSelecionado = { cert: null, carta: null };
let layoutSimulado = { cert: 'certificado', carta: 'aprovado' };
// Produto/Serviço só importa pra situações que têm texto diferente pra cada um
// (certificado e aprovado); parcial/reprovado usam um texto único.
let layoutTipoProdServ = { cert: 'servico', carta: 'servico' };
let dragInfo = null;
// Guia de alinhamento (estilo Word/PowerPoint): guarda a posição em px, na tela,
// da linha vertical e/ou horizontal que aparece enquanto se arrasta um bloco.
let layoutGuides = { cert: { v: null, h: null }, carta: { v: null, h: null } };
const SNAP_PX = 6; // tolerância de encaixe (em pixels de tela) pra considerar "alinhado"
let resizeInfo = null;
let layoutIdCounter = 1;

function showLayoutSubtab(tipo, btn) {
  document.querySelectorAll('.layout-editor-wrap').forEach(el => el.style.display = 'none');
  btn.parentElement.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.getElementById('layout-editor-' + tipo).style.display = 'block';
  btn.classList.add('active');
}

function initLayoutEditor() {
  layoutEditorState = getLayout();
  layoutSelecionado = { cert: null, carta: null };
  atualizarFontesDisponiveis();
  renderFontesCustomLista();
  renderLayoutEditorTipo('cert');
  renderLayoutEditorTipo('carta');
}

// Só "certificado" e "aprovado" têm texto separado por Produto/Serviço.
// Parcial e Reprovado usam um texto único, então o toggle não se aplica.
function situacaoTemProdServ(statusSim) {
  return statusSim === 'certificado' || statusSim === 'aprovado';
}

// Resolve qual chave de d.textos (cert-prod, aprov-serv, parcial, reprov...) está
// "em foco" agora, de acordo com o que está selecionado no simulador do editor de layout.
function getChaveTextoAtual(tipo) {
  const statusSim = tipo === 'cert' ? 'certificado' : layoutSimulado[tipo];
  return getTipoDoc(statusSim, layoutTipoProdServ[tipo]);
}

// Monta um contexto de dados de exemplo (usando textos e nome da empresa reais já configurados)
// pra simular como o documento vai ficar sem precisar de uma avaliação de verdade.
function contextoSimuladoLayout(tipo, statusSim) {
  const d = db();
  const empNome = d.empresa.nome || 'Empresa';
  const notaSim = statusSim === 'certificado' ? '10.0' : statusSim === 'parcial' ? '6.5' : statusSim === 'reprovado' ? '3.0' : '8.5';
  const tipoDocSim = getChaveTextoAtual(tipo);
  const corpoTexto = aplicarTexto(d.textos[tipoDocSim] || '', 'Fornecedor Exemplo Ltda', notaSim, '06/2026', empNome);
  return {
    fornecedor: { nome: 'Fornecedor Exemplo Ltda', cnpj: '12.345.678/0001-90', setor: 'Qualidade', criticidade: 'Alta', extras: {} },
    nota: notaSim, periodo: '06/2026', empresaNome: empNome, sit: statusSim, dadosEmpresa: d.empresa, corpoTexto, isCert: tipo === 'cert'
  };
}

// Gera um PDF REAL (não uma prévia aproximada) usando o estado ATUAL do editor — mesmo que ainda não tenha
// clicado em "Salvar layout". Assim dá pra comparar o resultado de verdade, e não só o preview em miniatura.
function baixarPDFTesteLayout(tipo) {
  const isCert = tipo === 'cert';
  const sitSimulada = isCert ? 'certificado' : (layoutSimulado[tipo] || 'aprovado');
  const notaSample = { certificado: 10, aprovado: 8.5, parcial: 6.0, reprovado: 3.0 }[sitSimulada];
  const fornecedorFake = { nome: 'Fornecedor Exemplo Ltda', tipo: layoutTipoProdServ[tipo], sit: sitSimulada, media: notaSample, cnpj: '', setor: '', criticidade: '' };
  const hoje = new Date();
  const periodoLabel = `${MESES[hoje.getMonth() + 1]}/${hoje.getFullYear()}`;
  const pdf = gerarPDFDoc(fornecedorFake, periodoLabel, layoutEditorState[tipo]);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Teste_Layout_${isCert ? 'Certificado' : 'Carta_' + sitSimulada}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
  toast('PDF de teste gerado com o layout atual (mesmo sem clicar em Salvar)!');
}

function renderLayoutEditorTipo(tipo) {
  const dims = LAYOUT_DIMS[tipo];
  const wrap = document.getElementById('layout-editor-' + tipo);
  if (!wrap) return;
  const fundo = getFundoConfig(tipo === 'cert' ? 'ap_fundo_certificado' : 'ap_fundo_carta');
  const w = Math.round(dims.W * dims.scale), h = Math.round(dims.H * dims.scale);
  const opcoesStatus = tipo === 'cert'
    ? `<option value="certificado">Certificado (nota 10)</option>`
    : `<option value="aprovado" ${layoutSimulado[tipo]==='aprovado'?'selected':''}>Aprovado</option><option value="parcial" ${layoutSimulado[tipo]==='parcial'?'selected':''}>Parcialmente aprovado</option><option value="reprovado" ${layoutSimulado[tipo]==='reprovado'?'selected':''}>Reprovado</option>`;
  wrap.innerHTML = `
    <div class="blkedit-wrap">
      <div class="blkedit-canvas-area">
        <div class="blkedit-sim-bar">
          <label>🔄 Simular:</label>
          <select onchange="layoutSimulado['${tipo}']=this.value; renderLayoutEditorTipo('${tipo}')">${opcoesStatus}</select>
          ${tipo === 'cert' || situacaoTemProdServ(layoutSimulado[tipo])
            ? `<select onchange="layoutTipoProdServ['${tipo}']=this.value; renderLayoutBlocks('${tipo}')">
                 <option value="servico" ${layoutTipoProdServ[tipo]==='servico'?'selected':''}>Serviço</option>
                 <option value="produto" ${layoutTipoProdServ[tipo]==='produto'?'selected':''}>Produto</option>
               </select>`
            : ''}
          <span style="font-size:11px; color:var(--text-muted)">— clique no bloco "Corpo do texto" pra editar o texto desta situação</span>
        </div>
        <div id="layout-canvas-${tipo}" class="blkedit-canvas" style="width:${w}px; height:${h}px; background:${fundo ? `#fff url(${fundo})` : '#fff'}; background-size:100% 100%; background-position:center"></div>
        <div class="blkedit-toolbar">
          <button class="btn btn-primary btn-sm" onclick="adicionarBlocoLayout('${tipo}')">＋ Adicionar bloco</button>
          <button class="btn btn-secondary btn-sm" onclick="baixarPDFTesteLayout('${tipo}')">📄 Baixar PDF de teste</button>
          <button class="btn btn-secondary btn-sm" onclick="salvarLayout('${tipo}')">💾 Salvar layout</button>
          <button class="btn btn-secondary btn-sm" onclick="restaurarLayoutPadrao('${tipo}')">↺ Restaurar padrão</button>
        </div>
      </div>
      <div class="blkedit-sidebar" id="layout-sidebar-${tipo}"></div>
    </div>
  `;
  renderLayoutBlocks(tipo);
}

function renderLayoutBlocks(tipo) {
  const dims = LAYOUT_DIMS[tipo];
  const canvas = document.getElementById('layout-canvas-' + tipo);
  if (!canvas) return;
  const blocos = layoutEditorState[tipo].blocos;
  const ctx = contextoSimuladoLayout(tipo, layoutSimulado[tipo]);
  canvas.innerHTML = '';
  blocos.forEach(b => {
    const div = document.createElement('div');
    const selecionado = layoutSelecionado[tipo] === b.id;
    div.className = 'blkedit-block' + (selecionado ? ' selected' : '');
    const valorResolvido = b.tipo === 'fixo' ? b.conteudo : resolveVariavelValor(b.variavel, ctx);
    const vazio = !valorResolvido;
    const texto = vazio ? (b.variavel === 'corpo_texto' ? 'Insira o corpo do texto aqui' : `{${b.variavel}}`) : valorResolvido;
    div.textContent = texto;
    const translate = b.align === 'center' ? '-50%' : b.align === 'right' ? '-100%' : '0%';
    // b.tamanho é em pontos (pt), igual ao doc.setFontSize() do jsPDF. Precisa converter
    // pt -> mm (1pt = 0.352778mm) -> px da tela (dims.scale), senão o preview fica com
    // um tamanho de fonte totalmente diferente do PDF gerado.
    const fsPx = b.tamanho * 0.352778 * dims.scale;
    // Mesmo incremento de linha usado no gerarPDFDoc (y += tamanho*0.5 + 1, em mm),
    // convertido pra px, senão textos com quebra de linha desalinham no PDF.
    const lhPx = (b.tamanho * 0.5 + 1) * dims.scale;
    // No jsPDF, x/y é a linha de base do texto; no CSS, top é o topo da caixa.
    // Aproxima a ascendente da fonte (~80% do tamanho) em vez do "-10" fixo antigo,
    // que só "acertava por acaso" num tamanho de fonte específico.
    const topPx = b.y * dims.scale - fsPx * 0.8;
    const corTexto = (vazio && b.variavel === 'corpo_texto') ? '#b7b6b0' : (b.variavel==='situacao' ? {aprovado:'#008238',parcial:'#b46400',reprovado:'#b40000'}[layoutSimulado[tipo]]||b.cor : b.cor);
    const estiloTexto = (vazio && b.variavel === 'corpo_texto') ? 'italic' : (b.italico?'italic':'normal');
    // Se o bloco aponta pra uma fonte que não existe mais (ex: fonte personalizada
    // removida), cai pra Helvetica em vez de quebrar o editor inteiro.
    const fonteResolvida = FONTES_DOC[b.fonte] || FONTES_DOC.helvetica;
    div.style.cssText = `left:${b.x*dims.scale}px; top:${topPx}px; width:${b.largura*dims.scale}px; transform:translateX(${translate}); font-family:${fonteResolvida.css}; font-size:${fsPx}px; line-height:${lhPx}px; color:${corTexto}; font-weight:${b.negrito?'700':'400'}; font-style:${estiloTexto}; text-align:${b.align};`;
    const delX = document.createElement('span');
    delX.className = 'blkedit-del'; delX.textContent = '✕';
    delX.onclick = (e) => { e.stopPropagation(); removerBlocoLayout(tipo, b.id); };
    div.appendChild(delX);
    ['left','right'].forEach(lado => {
      const h = document.createElement('span');
      h.className = 'blkedit-resize ' + lado;
      h.onmousedown = (e) => startResizeLayout(e, tipo, b.id, lado);
      div.appendChild(h);
    });
    div.addEventListener('mousedown', (e) => startDragBlock(e, tipo, b.id));
    div.addEventListener('click', (e) => { e.stopPropagation(); selecionarBlocoLayout(tipo, b.id); });
    canvas.appendChild(div);
  });
  canvas.onclick = () => selecionarBlocoLayout(tipo, null);

  // Linhas-guia de alinhamento (aparecem só durante o arraste, quando encaixa no centro
  // da página ou no centro/posição de outro bloco — igual ao Word/PowerPoint).
  const guias = layoutGuides[tipo] || {};
  if (guias.v != null) {
    const vLine = document.createElement('div');
    vLine.style.cssText = `position:absolute; left:${guias.v}px; top:0; width:0; height:100%; border-left:1px dashed var(--accent); pointer-events:none; z-index:20`;
    canvas.appendChild(vLine);
  }
  if (guias.h != null) {
    const hLine = document.createElement('div');
    hLine.style.cssText = `position:absolute; top:${guias.h}px; left:0; height:0; width:100%; border-top:1px dashed var(--accent); pointer-events:none; z-index:20`;
    canvas.appendChild(hLine);
  }

  renderLayoutSidebar(tipo);
}

const LABELS_TEXTO_DOC = {
  'cert-prod': 'Certificado · Produto', 'cert-serv': 'Certificado · Serviço',
  'aprov-prod': 'Aprovado · Produto', 'aprov-serv': 'Aprovado · Serviço',
  'parcial': 'Parcialmente aprovado', 'reprov': 'Reprovado'
};

// Painel embutido de edição de texto: aparece dentro das propriedades do bloco
// "Corpo do texto". Qual texto aparece (Aprovado/Parcial/Reprovado, Produto/Serviço)
// depende do que está selecionado no simulador logo acima, no topo do editor.
function renderEditorTextoDocumento(tipo) {
  const chave = getChaveTextoAtual(tipo);
  const texto = db().textos[chave] || '';
  return `
    <div class="blkedit-prop" style="border:1px solid var(--accent-border); background:var(--accent-bg); border-radius:8px; padding:10px 10px 4px">
      <label>Texto para: ${LABELS_TEXTO_DOC[chave]}</label>
      <textarea rows="6" placeholder="Insira o corpo do texto aqui" onchange="salvarTextoDocumento('${chave}', this.value, '${tipo}')">${texto}</textarea>
      <p style="font-size:10.5px; color:var(--text-muted); margin:6px 0 8px">
        Clique pra inserir:
        <code style="cursor:pointer" onclick="inserirVariavelTexto('${tipo}','{fornecedor}')">{fornecedor}</code>
        <code style="cursor:pointer" onclick="inserirVariavelTexto('${tipo}','{nota}')">{nota}</code>
        <code style="cursor:pointer" onclick="inserirVariavelTexto('${tipo}','{periodo}')">{periodo}</code>
        <code style="cursor:pointer" onclick="inserirVariavelTexto('${tipo}','{empresa}')">{empresa}</code>
      </p>
      <p style="font-size:10.5px; color:var(--text-muted); margin:0 0 8px">💡 Pra editar o texto de outra situação (ex: Parcial, Reprovado), troque no seletor "Simular" lá em cima.</p>
    </div>`;
}

function inserirVariavelTexto(tipo, varTxt) {
  const ta = document.querySelector(`#layout-sidebar-${tipo} textarea`);
  if (!ta) return;
  ta.value += varTxt;
  ta.dispatchEvent(new Event('change'));
  ta.focus();
}

async function salvarTextoDocumento(chave, valor, tipo) {
  const textos = { ...db().textos, [chave]: valor };
  const { error } = await salvarConfigEmpresa('textos', textos);
  if (error) { toast('Erro ao salvar texto: ' + error.message); return; }
  addLog('textos_atualizados', `${currentUser.email} atualizou o texto "${LABELS_TEXTO_DOC[chave]}"`);
  toast('Texto salvo!');
  if (tipo) renderLayoutBlocks(tipo);
}

function selecionarBlocoLayout(tipo, id) {
  layoutSelecionado[tipo] = id;
  renderLayoutBlocks(tipo);
}

function renderLayoutSidebar(tipo) {
  const wrap = document.getElementById('layout-sidebar-' + tipo);
  if (!wrap) return;
  const blocos = layoutEditorState[tipo].blocos;
  const b = blocos.find(x => x.id === layoutSelecionado[tipo]);

  if (!b) {
    wrap.innerHTML = `
      <h4>Blocos do documento</h4>
      <p class="sub">${blocos.length} bloco(s) — clique em um no documento ou na lista</p>
      ${blocos.map(bl => `
        <div class="blkedit-list-item" onclick="selecionarBlocoLayout('${tipo}','${bl.id}')">
          <div><div>${bl.label}</div><div class="bli-type">${bl.tipo === 'fixo' ? 'Texto fixo' : 'Variável · ' + (getVariaveisDoc()[bl.variavel]||{}).label}</div></div>
          <span class="bli-del" onclick="event.stopPropagation(); removerBlocoLayout('${tipo}','${bl.id}')">✕</span>
        </div>`).join('')}
    `;
    return;
  }

  const varsDisponiveis = getVariaveisDoc();
  const opcoesVars = Object.keys(varsDisponiveis).map(k => `<option value="${k}" ${b.variavel===k?'selected':''}>${varsDisponiveis[k].label}</option>`).join('');

  wrap.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between">
      <h4>Editando bloco</h4>
      <span style="font-size:11px; color:var(--accent); cursor:pointer; font-weight:600" onclick="selecionarBlocoLayout('${tipo}',null)">← voltar</span>
    </div>
    <p class="sub">Alterações aparecem no documento em tempo real</p>

    <div class="blkedit-prop"><label>Nome do bloco</label><input type="text" value="${b.label}" onchange="atualizarBlocoLayout('${tipo}','label',this.value)"></div>

    <div class="blkedit-prop">
      <label>Tipo de conteúdo</label>
      <div class="blkedit-seg">
        <button class="${b.tipo==='fixo'?'active':''}" onclick="atualizarBlocoLayout('${tipo}','tipo','fixo')">Texto fixo</button>
        <button class="${b.tipo==='variavel'?'active':''}" onclick="atualizarBlocoLayout('${tipo}','tipo','variavel')">Variável dinâmica</button>
      </div>
    </div>

    ${b.tipo === 'fixo'
      ? `<div class="blkedit-prop"><label>Texto</label><textarea onchange="atualizarBlocoLayout('${tipo}','conteudo',this.value)">${b.conteudo||''}</textarea></div>`
      : `<div class="blkedit-prop"><label>Variável associada</label><select onchange="atualizarBlocoLayout('${tipo}','variavel',this.value)">${opcoesVars}</select></div>`}

    ${b.variavel === 'corpo_texto' ? renderEditorTextoDocumento(tipo) : ''}

    <div class="blkedit-prop"><label>Fonte</label>
      <select onchange="atualizarBlocoLayout('${tipo}','fonte',this.value)">
        ${Object.keys(FONTES_DOC).map(f => `<option value="${f}" ${b.fonte===f?'selected':''}>${FONTES_DOC[f].label}</option>`).join('')}
      </select>
    </div>

    <div class="blkedit-row">
      <div class="blkedit-prop"><label>Tamanho</label><input type="text" value="${b.tamanho}" onchange="atualizarBlocoLayout('${tipo}','tamanho',parseFloat(this.value)||b.tamanho)"></div>
      <div class="blkedit-prop"><label>Cor</label>
        <div class="blkedit-color-row">
          <input type="color" value="${b.cor}" onchange="atualizarBlocoLayout('${tipo}','cor',this.value)">
          <input type="text" value="${b.cor}" onchange="atualizarBlocoLayout('${tipo}','cor',this.value)">
        </div>
      </div>
    </div>
    ${b.variavel === 'situacao' ? `<p style="font-size:10.5px; color:var(--text-muted); margin-top:-8px; margin-bottom:12px">💡 Essa variável já muda de cor sozinha (verde/laranja/vermelho) conforme o resultado — a cor acima só vale se não for essa variável.</p>` : ''}

    <div class="blkedit-prop"><label>Estilo</label>
      <div class="blkedit-toggle">
        <button class="${b.negrito?'active':''}" onclick="atualizarBlocoLayout('${tipo}','negrito',${!b.negrito})"><b>B</b> Negrito</button>
        <button class="${b.italico?'active':''}" onclick="atualizarBlocoLayout('${tipo}','italico',${!b.italico})"><i>I</i> Itálico</button>
      </div>
    </div>

    <div class="blkedit-prop"><label>Alinhamento</label>
      <div class="blkedit-seg">
        <button class="${b.align==='left'?'active':''}" onclick="atualizarBlocoLayout('${tipo}','align','left')">Esquerda</button>
        <button class="${b.align==='center'?'active':''}" onclick="atualizarBlocoLayout('${tipo}','align','center')">Centro</button>
        <button class="${b.align==='right'?'active':''}" onclick="atualizarBlocoLayout('${tipo}','align','right')">Direita</button>
      </div>
    </div>

    <details class="blkedit-details">
      <summary>Posição e largura exatas (mm)</summary>
      <div class="blkedit-row3">
        <div class="blkedit-prop" style="margin-bottom:0"><label>X</label><input type="text" value="${b.x}" onchange="atualizarBlocoLayout('${tipo}','x',parseFloat(this.value)||b.x)"></div>
        <div class="blkedit-prop" style="margin-bottom:0"><label>Y</label><input type="text" value="${b.y}" onchange="atualizarBlocoLayout('${tipo}','y',parseFloat(this.value)||b.y)"></div>
        <div class="blkedit-prop" style="margin-bottom:0"><label>Largura</label><input type="text" value="${b.largura}" onchange="atualizarBlocoLayout('${tipo}','largura',parseFloat(this.value)||b.largura)"></div>
      </div>
      <p style="font-size:11px; color:var(--text-muted); margin-top:8px">💡 Também dá pra arrastar as alcinhas azuis nas laterais do bloco no documento.</p>
    </details>

    <div style="height:1px; background:var(--border); margin:14px 0"></div>
    <button class="btn btn-danger btn-sm btn-block" onclick="removerBlocoLayout('${tipo}','${b.id}')">🗑 Remover bloco</button>
  `;
}

function atualizarBlocoLayout(tipo, campo, valor) {
  const b = layoutEditorState[tipo].blocos.find(x => x.id === layoutSelecionado[tipo]);
  if (!b) return;
  b[campo] = valor;
  if (campo === 'tipo' && valor === 'variavel' && !b.variavel) b.variavel = 'fornecedor';
  renderLayoutBlocks(tipo);
}

function adicionarBlocoLayout(tipo) {
  const novo = { id: 'custom' + (layoutIdCounter++), label: 'Novo texto', tipo: 'fixo', conteudo: 'Clique para editar este texto', fonte: 'helvetica', tamanho: 12, cor: '#333333', negrito: false, italico: false, align: 'left', x: 30, y: 100, largura: 140 };
  layoutEditorState[tipo].blocos.push(novo);
  selecionarBlocoLayout(tipo, novo.id);
  toast('Bloco adicionado — arraste ou puxe as bordas pra ajustar');
}

function removerBlocoLayout(tipo, id) {
  layoutEditorState[tipo].blocos = layoutEditorState[tipo].blocos.filter(b => b.id !== id);
  if (layoutSelecionado[tipo] === id) layoutSelecionado[tipo] = null;
  renderLayoutBlocks(tipo);
  toast('Bloco removido');
}

// Centro horizontal do bloco em px de tela, considerando o alinhamento do texto
// (à esquerda o "centro" fica à direita da âncora x; à direita fica à esquerda; ao centro é o próprio x).
function blocoCentroXpx(b, dims) {
  const xPx = b.x * dims.scale;
  const wPx = (b.largura || 0) * dims.scale;
  if (b.align === 'center') return xPx;
  if (b.align === 'right') return xPx - wPx / 2;
  return xPx + wPx / 2;
}
function xDoCentroPx(centroPx, largura, align, dims) {
  const wPx = (largura || 0) * dims.scale;
  let xPx;
  if (align === 'center') xPx = centroPx;
  else if (align === 'right') xPx = centroPx + wPx / 2;
  else xPx = centroPx - wPx / 2;
  return +(xPx / dims.scale).toFixed(1);
}

function startDragBlock(e, tipo, id) {
  e.preventDefault(); e.stopPropagation();
  selecionarBlocoLayout(tipo, id);
  const rect = document.getElementById('layout-canvas-' + tipo).getBoundingClientRect();
  dragInfo = { tipo, id, rect };
  document.addEventListener('mousemove', onDragBlock);
  document.addEventListener('mouseup', endDragBlock);
}
function onDragBlock(e) {
  if (!dragInfo) return;
  const { rect, tipo, id } = dragInfo;
  const dims = LAYOUT_DIMS[tipo];
  const b = layoutEditorState[tipo].blocos.find(x => x.id === id);
  let xPx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  let yPx = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
  b.x = +(xPx / dims.scale).toFixed(1);
  b.y = +(yPx / dims.scale).toFixed(1);

  // ---- Guias de alinhamento: centro da página + centro/posição de outros blocos ----
  const outros = layoutEditorState[tipo].blocos.filter(x => x.id !== id);
  const candidatosCentroX = [rect.width / 2, ...outros.map(o => blocoCentroXpx(o, dims))];
  const candidatosY = [rect.height / 2, ...outros.map(o => o.y * dims.scale)];

  let snapV = null;
  const meuCentroX = blocoCentroXpx(b, dims);
  for (const cx of candidatosCentroX) {
    if (Math.abs(meuCentroX - cx) <= SNAP_PX) { b.x = xDoCentroPx(cx, b.largura, b.align, dims); snapV = cx; break; }
  }
  let snapH = null;
  for (const cy of candidatosY) {
    if (Math.abs(yPx - cy) <= SNAP_PX) { b.y = +(cy / dims.scale).toFixed(1); snapH = cy; break; }
  }
  layoutGuides[tipo] = { v: snapV, h: snapH };
  renderLayoutBlocks(tipo);
}
function endDragBlock() {
  const tipo = dragInfo && dragInfo.tipo;
  dragInfo = null;
  document.removeEventListener('mousemove', onDragBlock);
  document.removeEventListener('mouseup', endDragBlock);
  if (tipo) { layoutGuides[tipo] = { v: null, h: null }; renderLayoutBlocks(tipo); }
}

function startResizeLayout(e, tipo, id, lado) {
  e.preventDefault(); e.stopPropagation();
  selecionarBlocoLayout(tipo, id);
  const b = layoutEditorState[tipo].blocos.find(x => x.id === id);
  resizeInfo = { tipo, id, lado, startX: e.clientX, startLargura: b.largura };
  document.addEventListener('mousemove', onResizeLayout);
  document.addEventListener('mouseup', endResizeLayout);
}
function onResizeLayout(e) {
  if (!resizeInfo) return;
  const { tipo, id, lado, startX, startLargura } = resizeInfo;
  const dims = LAYOUT_DIMS[tipo];
  const b = layoutEditorState[tipo].blocos.find(x => x.id === id);
  const deltaMm = ((lado === 'right' ? 1 : -1) * (e.clientX - startX)) / dims.scale;
  b.largura = Math.max(20, Math.min(dims.W - 10, +(startLargura + deltaMm).toFixed(1)));
  renderLayoutBlocks(tipo);
}
function endResizeLayout() {
  resizeInfo = null;
  document.removeEventListener('mousemove', onResizeLayout);
  document.removeEventListener('mouseup', endResizeLayout);
}

async function salvarLayout(tipo) {
  const { error } = await salvarConfigEmpresa('layout', layoutEditorState);
  if (error) { toast('Erro ao salvar layout: ' + error.message); return; }
  addLog('layout_atualizado', `${currentUser.email} atualizou o layout do documento (${tipo === 'cert' ? 'certificado' : 'carta'})`);
  toast('Layout salvo!');
}

function restaurarLayoutPadrao(tipo) {
  if (!confirm('Restaurar as posições padrão deste documento? Blocos personalizados que você criou serão removidos.')) return;
  layoutEditorState[tipo] = JSON.parse(JSON.stringify(getLayoutDefaults()[tipo]));
  layoutSelecionado[tipo] = null;
  renderLayoutBlocks(tipo);
}

// ---- Campos personalizados do fornecedor ----
function renderCamposFornecedorLista() {
  const d = db();
  const wrap = document.getElementById('campos-fornecedor-lista');
  if (!wrap) return;
  if (!d.camposFornecedorCustom.length) { wrap.innerHTML = '<p style="font-size:12px; color:var(--text-muted)">Nenhum campo personalizado ainda.</p>'; return; }
  const TIPO_LABEL = { select: 'Lista', data: 'Data', texto: 'Texto' };
  wrap.innerHTML = d.camposFornecedorCustom.map(c => `
    <div class="field-row">
      <div>
        <div class="field-row-label">${c.label}</div>
        <div class="field-row-meta">${c.chave} · ${TIPO_LABEL[c.tipo] || 'Texto'}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="removeCampoFornecedorCustom('${c.chave}')">Remover</button>
    </div>
  `).join('');
}

async function addCampoFornecedorCustom() {
  const chave = document.getElementById('ncf-chave').value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
  const label = document.getElementById('ncf-label').value.trim();
  const tipo = document.getElementById('ncf-tipo').value;
  const opcoes = document.getElementById('ncf-opcoes').value.split(',').map(s => s.trim()).filter(Boolean);
  if (!chave || !label) { toast('Informe a chave e o rótulo do campo.'); return; }
  const d = db();
  if (d.camposFornecedorCustom.some(c => c.chave === chave)) { toast('Já existe um campo com essa chave.'); return; }

  const novaLista = [...d.camposFornecedorCustom, { chave, label, tipo, opcoes: tipo === 'select' ? opcoes : [] }];

  const { error } = await supabaseClient
    .from('empresas')
    .update({ campos_fornecedor_custom: novaLista })
    .eq('id', currentUser.empresaId);

  if (error) { toast('Erro ao salvar campo: ' + error.message); return; }

  empresaConfigCache.campos_fornecedor_custom = novaLista;
  addLog('campo_fornecedor_criado', `${currentUser.email} criou o campo personalizado "${label}" para fornecedores`);
  document.getElementById('ncf-chave').value = '';
  document.getElementById('ncf-label').value = '';
  document.getElementById('ncf-opcoes').value = '';
  renderCamposFornecedorLista();
  toast('Campo adicionado! Já aparece no cadastro de fornecedores.');
}

async function removeCampoFornecedorCustom(chave) {
  if (!confirm('Remover este campo? Os valores já preenchidos nos fornecedores serão mantidos, mas o campo não aparecerá mais nos formulários.')) return;
  const d = db();
  const novaLista = d.camposFornecedorCustom.filter(c => c.chave !== chave);

  const { error } = await supabaseClient
    .from('empresas')
    .update({ campos_fornecedor_custom: novaLista })
    .eq('id', currentUser.empresaId);

  if (error) { toast('Erro ao remover campo: ' + error.message); return; }

  empresaConfigCache.campos_fornecedor_custom = novaLista;
  addLog('campo_fornecedor_removido', `${currentUser.email} removeu um campo personalizado de fornecedores`);
  renderCamposFornecedorLista();
  toast('Campo removido.');
}

// ---- Tipos de documento ----
function renderTiposDocumentoLista() {
  const d = db();
  const wrap = document.getElementById('tipos-documento-lista');
  if (!wrap) return;
  if (!d.tiposDocumento.length) { wrap.innerHTML = '<p style="font-size:12px; color:var(--text-muted)">Nenhum tipo cadastrado ainda.</p>'; return; }
  wrap.innerHTML = d.tiposDocumento.map(t => `
    <span style="display:inline-flex; align-items:center; gap:10px; padding:9px 10px 9px 16px; border:1px solid var(--border-strong); border-radius:999px; font-size:13px; background:var(--surface)">
      ${t}
      <button onclick="removeTipoDocumento('${t.replace(/'/g, "\\'")}')" style="border:none; background:var(--surface2); color:var(--text-muted); width:20px; height:20px; border-radius:50%; cursor:pointer; font-size:12px; line-height:1; display:flex; align-items:center; justify-content:center" title="Remover">✕</button>
    </span>
  `).join('');
}

async function addTipoDocumento() {
  const input = document.getElementById('ntd-nome');
  const nome = input.value.trim();
  if (!nome) { toast('Informe o nome do tipo de documento.'); return; }
  const d = db();
  if (d.tiposDocumento.some(t => t.toLowerCase() === nome.toLowerCase())) { toast('Esse tipo já está cadastrado.'); return; }
  const novaLista = [...d.tiposDocumento, nome];

  const { error } = await supabaseClient.from('empresas').update({ tipos_documento: novaLista }).eq('id', currentUser.empresaId);
  if (error) { toast('Erro ao salvar tipo de documento: ' + error.message); return; }

  empresaConfigCache.tipos_documento = novaLista;
  addLog('tipo_documento_criado', `${currentUser.email} cadastrou o tipo de documento "${nome}"`);
  input.value = '';
  renderTiposDocumentoLista();
  toast('Tipo de documento adicionado!');
}

async function removeTipoDocumento(nome) {
  const d = db();
  const novaLista = d.tiposDocumento.filter(t => t !== nome);

  const { error } = await supabaseClient.from('empresas').update({ tipos_documento: novaLista }).eq('id', currentUser.empresaId);
  if (error) { toast('Erro ao remover tipo de documento: ' + error.message); return; }

  empresaConfigCache.tipos_documento = novaLista;
  addLog('tipo_documento_removido', `${currentUser.email} removeu o tipo de documento "${nome}"`);
  renderTiposDocumentoLista();
  toast('Tipo removido.');
}

// inicializar previews/editor ao entrar nas abas
const _origShowConfigTabAd = showConfigTabAd;
showConfigTabAd = function(tab, btn) {
  _origShowConfigTabAd(tab, btn);
  if (tab === 'layout') {
    renderFundoPreview('ap_fundo_certificado', 'fundo-cert-preview');
    renderFundoPreview('ap_fundo_carta', 'fundo-carta-preview');
    initLayoutEditor();
  }
  if (tab === 'camposfor') {
    renderCamposFornecedorLista();
  }
  if (tab === 'tiposdoc') {
    renderTiposDocumentoLista();
  }
};
