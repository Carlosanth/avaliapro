// ============ AVALIAR: preenchimento de avaliação (avaliador) + avaliação de produto (admin) ============
// ============ SHELL DO AVALIADOR ============
// Mesma lógica de renderAvFormularios, só que genérica pra qualquer
// usuarioId — usada no painel de Usuários (admin) pra saber quem tem
// pendência, sem precisar estar logado como aquele avaliador.
function contarPendentesAvaliador(d, usuarioId) {
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();
  const chaveMes = `${anoAtual}-${mesAtual}`;
  const hoje = new Date();

  const minhasAssoc = d.associacoes.filter(a => a.usuarioId === usuarioId);
  let pendentes = 0, atrasados = 0;

  minhasAssoc.forEach(assoc => {
    const form = d.formularios.find(f => f.id === assoc.formularioId);
    if (!form) return;
    const jaPreenchido = d.avaliacoes.some(av => av.formularioId === form.id && av.fornecedorId === assoc.fornecedorId && av.usuarioId === usuarioId && av.periodo === chaveMes);
    if (jaPreenchido) return;
    pendentes++;
    if (form.prazoEntregaDia && hoje.getDate() > form.prazoEntregaDia) atrasados++;
  });

  return { pendentes, atrasados };
}

function renderAvaliadorShell() {
  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-logo"><h1>AvaliaPro</h1><p>Área do avaliador</p></div>
    <div class="sidebar-user">
      <div class="sidebar-user-avatar">${currentUser.nome.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
      <div class="sidebar-user-info">
        <p>${currentUser.nome}</p>
        <span>${currentUser.email}</span><br>
        <span class="role-badge avaliador">Avaliador</span>
      </div>
    </div>
    <button class="nav-item active" onclick="showAvPage('formularios', this)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      Meus formulários
    </button>
    <button class="nav-item" onclick="showAvPage('historico', this)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      Histórico de envios
    </button>
    <div class="nav-logout">
      <button class="nav-item" onclick="doLogout()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sair
      </button>
    </div>
  `;
  document.getElementById('main').innerHTML = `
    <div class="page active" id="av-page-formularios"></div>
    <div class="page" id="av-page-historico"></div>
  `;
  renderAvFormularios();
}

function showAvPage(page, btn) {
  document.querySelectorAll('#sidebar .nav-item').forEach(n => n.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('#main .page').forEach(p => p.classList.remove('active'));
  document.getElementById('av-page-' + page).classList.add('active');
  if (page === 'formularios') renderAvFormularios();
  if (page === 'historico') renderAvHistorico();
}

function renderAvFormularios() {
  const d = db();
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const minhasAssoc = d.associacoes.filter(a => a.usuarioId === currentUser.id);

  const wrap = document.getElementById('av-page-formularios');
  if (!minhasAssoc.length) {
    wrap.innerHTML = `
      <div class="page-header"><div><h2>Meus formulários</h2><p>Nenhum formulário foi associado ao seu e-mail ainda. Fale com o administrador.</p></div></div>
      <div class="card"><div class="empty-state"><p>Sem formulários disponíveis.</p></div></div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="page-header">
      <div><h2>Meus formulários</h2><p>${MESES[mesAtual]} de ${anoAtual} — clique em um formulário para avaliar</p></div>
    </div>
    <div class="forms-grid" id="av-forms-grid"></div>
  `;

  const grid = document.getElementById('av-forms-grid');
  grid.innerHTML = minhasAssoc.map(assoc => {
    const form = d.formularios.find(f => f.id === assoc.formularioId);
    if (!form) return '';
    const fornecedor = assoc.fornecedorId ? d.fornecedores.find(fn => fn.id === assoc.fornecedorId) : null;
    const chaveMes = `${anoAtual}-${mesAtual}`;
    // Pode ter MAIS DE UMA avaliação no mês (um atendimento por avaliação) —
    // pega todas e usa a mais recente pra mostrar status/nota no card.
    const avaliacoesDoMes = d.avaliacoes
      .filter(av => av.formularioId === form.id && av.fornecedorId === assoc.fornecedorId && av.usuarioId === currentUser.id && av.periodo === chaveMes)
      .sort((a, b) => new Date(b.enviadoEm) - new Date(a.enviadoEm));
    const jaPreenchido = avaliacoesDoMes[0] || null;
    const foiLiberado = jaPreenchido && jaPreenchido.liberadoEdicao;

    const camposLinha = (form.camposExtras && form.camposExtras.length)
      ? form.camposExtras.filter(c => c.valor).map(c => `${c.label}: ${c.valor}`).join(' · ')
      : '';

    let prazoLinha = '';
    if (form.prazoEntregaDia) {
      const hoje = new Date();
      const venceEsteAno = hoje.getDate() > form.prazoEntregaDia && !jaPreenchido;
      prazoLinha = `<span style="color:${venceEsteAno ? 'var(--danger)' : 'var(--text-muted)'}">Prazo: dia ${form.prazoEntregaDia}${venceEsteAno ? ' (atrasado)' : ''}</span>`;
    }

    const podeAbrirCard = !jaPreenchido || foiLiberado;
    return `
      <div class="form-card ${foiLiberado ? 'pendente' : jaPreenchido ? 'preenchido' : 'pendente'}" ${podeAbrirCard ? `onclick="abrirFormulario('${assoc.id}')" style="cursor:pointer"` : 'style="cursor:default"'}>
        <div class="form-card-top">
          <div>
            <h4>${fornecedor ? fornecedor.nome : 'Fornecedor a definir'}</h4>
            <p>${form.nome} · ${MESES[mesAtual]} de ${anoAtual}</p>
            ${camposLinha || prazoLinha ? `<p style="margin-top:4px; font-size:11px; color:var(--text-muted)">${[camposLinha, prazoLinha].filter(Boolean).join(' &nbsp;·&nbsp; ')}</p>` : ''}
          </div>
          <span class="form-card-status ${foiLiberado ? 'pending' : jaPreenchido ? 'ok' : 'pending'}">${foiLiberado ? 'Reenviar' : jaPreenchido ? 'Enviado' : 'Pendente'}</span>
        </div>
        ${jaPreenchido ? `<div style="margin-top:10px; font-size:12px; color:var(--text-muted)">${avaliacoesDoMes.length > 1 ? `${avaliacoesDoMes.length} atendimentos avaliados · ` : ''}Nota mais recente: <b style="color:var(--text)">${jaPreenchido.nota !== null ? jaPreenchido.nota.toFixed(1) : '—'}</b> · enviado em ${fmtData(jaPreenchido.enviadoEm)}</div>` : `<div style="margin-top:10px; font-size:12px; color:var(--text-muted)">Setor: ${form.setor}</div>`}
        ${jaPreenchido && !foiLiberado ? `<div style="margin-top:10px"><button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); abrirFormulario('${assoc.id}', true)">+ Avaliar outro atendimento</button></div>` : ''}
      </div>
    `;
  }).join('');
}

function abrirFormulario(assocId, forcarNovo) {
  const d = db();
  const assoc = d.associacoes.find(a => a.id === assocId);
  const form = d.formularios.find(f => f.id === assoc.formularioId);
  const fornecedor = assoc.fornecedorId ? d.fornecedores.find(fn => fn.id === assoc.fornecedorId) : null;
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();
  const chaveMes = `${anoAtual}-${mesAtual}`;

  const encontrada = d.avaliacoes
    .filter(av => av.formularioId === form.id && av.fornecedorId === assoc.fornecedorId && av.usuarioId === currentUser.id && av.periodo === chaveMes)
    .sort((a, b) => new Date(b.enviadoEm) - new Date(a.enviadoEm))[0] || null;
  // forcarNovo = "Avaliar outro atendimento": ignora o que já existe, abre em branco,
  // e o envio vira um registro NOVO (não sobrescreve o atendimento anterior).
  const existente = forcarNovo ? null : encontrada;
  // Se admin liberou edição, tratar como "não enviado" visualmente
  const liberado = existente && existente.liberadoEdicao;
  const travado = existente && existente.travado && !liberado;

  const wrap = document.getElementById('av-page-formularios');
  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <h2>${form.nome}</h2>
        <p>${fornecedor ? fornecedor.nome + ' · ' : ''}${MESES[mesAtual]} de ${anoAtual}${forcarNovo ? ' · novo atendimento' : ''}</p>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="renderAvFormularios()">← Voltar</button>
    </div>
    ${travado ? `
      <div class="lock-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Esta avaliação já foi enviada e está travada para edição. Apenas o administrador pode liberar uma nova edição.
      </div>` : ''}
    ${liberado ? `
      <div class="alert alert-info" style="display:flex; align-items:center; gap:8px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Edição liberada pelo administrador. Revise as respostas e reenvie o formulário.
      </div>` : ''}
    <div id="form-fill-wrap"></div>
  `;

  // Se liberado, passa como existente para pré-preencher mas travado=false para editar
  renderFormFill(form, fornecedor, assoc, existente, travado, chaveMes);
}

function renderFormFill(form, fornecedor, assoc, existente, travado, chaveMes) {
  const respostasIniciais = existente ? existente.respostas : {};
  window._formAtual = { form, fornecedor, assoc, existente, chaveMes, respostas: JSON.parse(JSON.stringify(respostasIniciais)), anexos: existente ? JSON.parse(JSON.stringify(existente.anexos || [])) : [], naoHouveGeral: !!(existente && existente.semServico) };

  const wrap = document.getElementById('form-fill-wrap');

  // Campos institucionais do formulário
  const camposLinha = (form.camposExtras && form.camposExtras.length)
    ? form.camposExtras.filter(c => c.valor).map(c => `<span><b style="font-weight:600">${c.label}:</b> ${c.valor}</span>`).join(' &nbsp;·&nbsp; ')
    : '';

  wrap.innerHTML = `
    <div class="card">
      ${camposLinha ? `<div style="padding:10px 14px; background:var(--surface2); border-radius:8px; margin-bottom:14px; font-size:12px; color:var(--text-sec); display:flex; flex-wrap:wrap; gap:12px">${camposLinha}</div>` : ''}
      <div id="criterios-wrap" style="${existente && existente.semServico ? 'opacity:.4; pointer-events:none' : ''}">
        ${form.criterios.map(crit => {
          const resp = respostasIniciais[crit.id];
          return `
          <div class="criterio-block">
            <div class="criterio-header">
              <span class="criterio-nome">${crit.nome}</span>
              <span class="criterio-peso">até ${crit.pesoMax.toFixed(1)}P</span>
            </div>
            ${crit.opcoes.map((op, i) => `
              <label class="opcao-row ${resp && resp.opcaoIndex === i && !resp.naoHouve ? 'selected' : ''}" onclick="selecionarOpcao('${crit.id}', ${i}, this)">
                <input type="radio" name="crit-${crit.id}" ${resp && resp.opcaoIndex === i && !resp.naoHouve ? 'checked' : ''} ${travado ? 'disabled' : ''}>
                <span class="opcao-label">${op.label}</span>
                <span class="opcao-pontos">${op.pontos.toFixed(1)}P</span>
              </label>
            `).join('')}
          </div>`;
        }).join('')}
      </div>

      <div class="nota-preview">
        <span class="nota-preview-label">Nota calculada</span>
        <span class="nota-preview-value" id="nota-preview-val">${existente && existente.nota !== null ? existente.nota.toFixed(1) : '—'}</span>
      </div>

      <div class="form-group" style="margin-top:14px">
        <label>Observação (opcional)</label>
        <textarea id="obs-formulario" rows="2" ${travado ? 'disabled' : ''}>${existente ? (existente.obs || '') : ''}</textarea>
      </div>

      <div class="form-group" style="margin-top:14px">
        <label>Anexar evidências (PDF, foto, relatório)</label>
        <div class="file-drop" onclick="document.getElementById('anexo-input').click()">
          <input type="file" id="anexo-input" multiple onchange="handleAnexo(event)" ${travado ? 'disabled' : ''}>
          <p style="font-size:12px; color:var(--text-muted)">Clique para selecionar arquivos</p>
        </div>
        <div id="anexos-lista"></div>
      </div>

      <label class="opcao-row ${existente && existente.semServico ? 'selected' : ''}" style="margin-top:14px; border-top:1px dashed var(--border); padding-top:14px" onclick="event.preventDefault()">
        <input type="checkbox" id="chk-nao-houve-geral" ${existente && existente.semServico ? 'checked' : ''} ${travado ? 'disabled' : ''} onchange="toggleNaoHouveGeral(this.checked)">
        <span class="opcao-label">Não houve atendimento/fornecimento neste mês</span>
      </label>

      <div id="justificativa-wrap"></div>

      ${!travado ? `
        <div style="display:flex; justify-content:flex-end; margin-top:18px; gap:10px">
          <button class="btn btn-primary" onclick="enviarAvaliacao()">${existente ? 'Reenviar avaliação' : 'Enviar avaliação'}</button>
        </div>
      ` : `
        <div style="display:flex; justify-content:flex-end; margin-top:18px">
          <button class="btn btn-secondary" onclick="solicitarLiberacao()">Solicitar liberação ao admin</button>
        </div>
      `}
    </div>
  `;
  renderAnexosLista();
  updateNotaPreview();
}

function selecionarOpcao(critId, idx, el) {
  if (!window._formAtual) return;
  window._formAtual.respostas[critId] = { opcaoIndex: idx, naoHouve: false };
  el.parentElement.querySelectorAll('.opcao-row').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  updateNotaPreview();
}

function selecionarNaoHouve(critId, el) {
  if (!window._formAtual) return;
  window._formAtual.respostas[critId] = { opcaoIndex: null, naoHouve: true };
  el.parentElement.querySelectorAll('.opcao-row').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  updateNotaPreview();
}

function updateNotaPreview() {
  const { form, respostas, naoHouveGeral } = window._formAtual;
  const result = naoHouveGeral ? { nota: null, semServico: true } : calcularNota(form, respostas);
  const el = document.getElementById('nota-preview-val');
  el.textContent = result.semServico ? 'Sem serviço' : (result.nota !== null ? result.nota.toFixed(1) : '—');

  const justWrap = document.getElementById('justificativa-wrap');
  const sit = result.semServico ? null : getSituacao(result.nota);
  if (sit === 'reprovado') {
    justWrap.innerHTML = `
      <div class="form-group" style="margin-top:14px">
        <label style="color:var(--danger)">Melhoria esperada (obrigatório para reprovados)</label>
        <textarea id="justificativa-reprovacao" rows="3" placeholder="O que o fornecedor precisa melhorar para atingir uma nota melhor na próxima avaliação..." style="border-color:var(--danger-border)">${window._formAtual.existente && window._formAtual.existente.justificativa ? window._formAtual.existente.justificativa : ''}</textarea>
      </div>`;
  } else {
    justWrap.innerHTML = '';
  }
}

function toggleNaoHouveGeral(checked) {
  window._formAtual.naoHouveGeral = checked;
  const criteriosWrap = document.getElementById('criterios-wrap');
  if (criteriosWrap) criteriosWrap.style.cssText = checked ? 'opacity:.4; pointer-events:none' : '';
  updateNotaPreview();
}

function handleAnexo(e) {
  const files = Array.from(e.target.files);
  files.forEach(f => {
    // "_file" é a referência real do arquivo escolhido — só sobe pro Storage
    // quando o formulário for enviado de verdade (enviarAvaliacao).
    window._formAtual.anexos.push({ nome: f.name, tamanho: (f.size / 1024).toFixed(0) + ' KB', _file: f });
  });
  renderAnexosLista();
  e.target.value = '';
}

function renderAnexosLista() {
  const wrap = document.getElementById('anexos-lista');
  if (!wrap) return;
  wrap.innerHTML = window._formAtual.anexos.map((a, i) => `
    <div class="anexo-item">
      <span>📎 ${a.caminhoStorage ? `<a href="#" onclick="event.preventDefault(); baixarAnexoAvaliacao('${a.caminhoStorage}', '${a.nome}')">${a.nome}</a>` : a.nome}</span>
      <span style="color:var(--text-muted)">${a.tamanho}</span>
      <button onclick="removerAnexo(${i})">remover</button>
    </div>`).join('');
}

function removerAnexo(i) {
  window._formAtual.anexos.splice(i, 1);
  renderAnexosLista();
}

async function enviarAvaliacao() {
  const { form, fornecedor, assoc, existente, chaveMes, respostas, anexos, naoHouveGeral } = window._formAtual;
  const totalCriterios = form.criterios.length;
  const respondidos = Object.keys(respostas).filter(k => respostas[k]).length;

  if (!naoHouveGeral && respondidos < totalCriterios) {
    toast('Preencha todos os critérios antes de enviar.');
    return;
  }

  const result = naoHouveGeral ? { nota: null, semServico: true } : calcularNota(form, respostas);
  const sit = result.semServico ? null : getSituacao(result.nota);

  if (sit === 'reprovado') {
    const just = document.getElementById('justificativa-reprovacao').value.trim();
    if (!just) {
      toast('Indique a melhoria esperada para fornecedores reprovados.');
      return;
    }
  }

  const justificativa = sit === 'reprovado' ? document.getElementById('justificativa-reprovacao').value.trim() : '';
  const obs = document.getElementById('obs-formulario').value.trim();

  // Sobe pro Storage só os anexos NOVOS (que ainda têm o File em memória, "_file").
  // Os que já tinham caminhoStorage (de um envio anterior sendo corrigido) ficam como estão.
  const anexosFinal = [];
  for (const a of anexos) {
    if (!a._file) { anexosFinal.push({ nome: a.nome, tamanho: a.tamanho, caminhoStorage: a.caminhoStorage || null }); continue; }

    const nomeSeguro = sanitizarNomeArquivo(a.nome);
    const caminho = `${currentUser.empresaId}/${currentUser.id}/${Date.now()}_${nomeSeguro}`;
    const { error: uploadErr } = await supabaseClient.storage.from('anexos-avaliacoes').upload(caminho, a._file);
    if (uploadErr) { toast('Erro ao enviar anexo "' + a.nome + '": ' + uploadErr.message); return; }
    anexosFinal.push({ nome: a.nome, tamanho: a.tamanho, caminhoStorage: caminho });
  }

  const payload = {
    formulario_id: form.id,
    fornecedor_id: assoc.fornecedorId,
    usuario_id: currentUser.id,
    periodo: chaveMes,
    respostas,
    nota_media: result.semServico ? null : result.nota,
    sem_servico: result.semServico,
    situacao: sit,
    anexos: anexosFinal,
    obs,
    justificativa,
    enviado_em: new Date().toISOString(),
    enviado_por_email: currentUser.email,
    bloqueada: true,
    liberado_edicao: false,
  };

  // Só REESCREVE a mesma avaliação se ela existia E o admin liberou a edição
  // (correção de um envio). Qualquer outro caso — inclusive "avaliar outro
  // atendimento" com um envio já travado no mês — cria uma linha NOVA, que
  // entra na média junto com as demais do período.
  let error;
  if (existente && existente.liberadoEdicao) {
    ({ error } = await supabaseClient.from('avaliacoes').update(payload).eq('id', existente.id));
  } else {
    ({ error } = await supabaseClient.from('avaliacoes').insert({ ...payload, empresa_id: currentUser.empresaId }));
  }

  if (error) { toast('Erro ao enviar avaliação: ' + error.message); return; }

  addLog('avaliacao_enviada', `${currentUser.email} enviou avaliação do formulário "${form.nome}" (${MESES[parseInt(chaveMes.split('-')[1])]}/${chaveMes.split('-')[0]}) — nota: ${result.semServico ? 'sem serviço' : result.nota.toFixed(1)}`);

  toast('Avaliação enviada e travada para edição!');
  await carregarAvaliacoes();
  renderAvFormularios();
}

function solicitarLiberacao() {
  addLog('solicitacao_liberacao', `${currentUser.email} solicitou liberação de edição para reabrir uma avaliação travada`);
  toast('Solicitação registrada. Avise o administrador para liberar a edição.');
}

function renderAvHistorico() {
  const d = db();
  const anoSel = document.getElementById('hist-filtro-ano');
  const mesSel = document.getElementById('hist-filtro-mes');
  const anoFiltro = anoSel ? anoSel.value : '';
  const mesFiltro = mesSel ? mesSel.value : '';

  const todasMinhas = d.avaliacoes.filter(av => av.usuarioId === currentUser.id);
  const anosDisponiveis = [...new Set(todasMinhas.map(av => av.periodo.split('-')[0]))].sort().reverse();

  let minhasAvaliacoes = todasMinhas;
  if (anoFiltro) minhasAvaliacoes = minhasAvaliacoes.filter(av => av.periodo.split('-')[0] === anoFiltro);
  if (mesFiltro) minhasAvaliacoes = minhasAvaliacoes.filter(av => av.periodo.split('-')[1] === mesFiltro);
  minhasAvaliacoes = minhasAvaliacoes.sort((a,b) => new Date(b.enviadoEm) - new Date(a.enviadoEm));

  const wrap = document.getElementById('av-page-historico');

  wrap.innerHTML = `
    <div class="page-header"><div><h2>Histórico de envios</h2><p>Todas as avaliações que você enviou</p></div></div>
    <div class="card" style="margin-bottom:14px">
      <div style="display:flex; gap:10px; flex-wrap:wrap">
        <div class="form-group" style="margin:0; min-width:120px">
          <label>Ano</label>
          <select id="hist-filtro-ano" onchange="renderAvHistorico()">
            <option value="">Todos</option>
            ${anosDisponiveis.map(a => `<option value="${a}" ${a === anoFiltro ? 'selected' : ''}>${a}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin:0; min-width:150px">
          <label>Mês</label>
          <select id="hist-filtro-mes" onchange="renderAvHistorico()">
            <option value="">Todos</option>
            ${MESES.map((m, i) => i > 0 ? `<option value="${i}" ${String(i) === mesFiltro ? 'selected' : ''}>${m}</option>` : '').join('')}
          </select>
        </div>
      </div>
    </div>
    <div class="card">
      ${!minhasAvaliacoes.length ? '<div class="empty-state"><p>Nenhuma avaliação encontrada para esse período.</p></div>' : `
      <table>
        <thead><tr><th>Formulário</th><th>Período</th><th style="text-align:center">Nota</th><th>Situação</th><th>Enviado em</th></tr></thead>
        <tbody>
          ${minhasAvaliacoes.map(av => {
            const form = d.formularios.find(f => f.id === av.formularioId);
            const [ano, mes] = av.periodo.split('-');
            const sit = av.semServico ? null : getSituacao(av.nota);
            return `<tr style="cursor:pointer" onclick="verDetalheAvaliacao('${av.id}')">
              <td style="font-weight:500">${form ? form.nome : '—'}</td>
              <td>${MESES[parseInt(mes)]}/${ano}</td>
              <td style="text-align:center; font-weight:600">${av.semServico ? '—' : av.nota.toFixed(1)}</td>
              <td>${av.semServico ? '<span class="badge badge-neutral">Sem serviço</span>' : badgeSit(sit)}</td>
              <td style="color:var(--text-muted)">${fmtData(av.enviadoEm)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`}
    </div>
  `;
}


// ---------- AVALIAR (produto) ----------
let _abaAvaliarProduto = 'avaliar';

function renderAdAvaliar() {
  document.getElementById('ad-page-avaliar').innerHTML = `
    <div class="page-header"><div><h2>Avaliar</h2><p>Escolha o tipo de avaliação.</p></div></div>
    <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:20px">
      <div class="card" style="flex:1; min-width:220px">
        <div class="card-title">📦 Produto</div>
        <p style="font-size:12px; color:var(--text-muted)">Lançamento por nota fiscal — critérios com peso, conceito por faixa.</p>
      </div>
      <div class="card" style="flex:1; min-width:220px; cursor:pointer" onclick="irParaAvaliacaoServico()">
        <div class="card-title">🧰 Serviço</div>
        <p style="font-size:12px; color:var(--text-muted)">Preenchido pelos setores (avaliadores). Configure quem avalia o quê em Associações →</p>
      </div>
    </div>
    <div class="tab-bar">
      <button class="tab ${_abaAvaliarProduto === 'avaliar' ? 'active' : ''}" onclick="mudarAbaAvaliarProduto('avaliar', this)">Avaliar Fornecedor</button>
      <button class="tab ${_abaAvaliarProduto === 'criterios' ? 'active' : ''}" onclick="mudarAbaAvaliarProduto('criterios', this)">Critérios</button>
      <button class="tab ${_abaAvaliarProduto === 'faixas' ? 'active' : ''}" onclick="mudarAbaAvaliarProduto('faixas', this)">Faixas de conceito</button>
    </div>
    <div id="avaliar-produto-tab"></div>
  `;
  renderAbaAvaliarProdutoAtual();
}

function renderAbaAvaliarProdutoAtual() {
  if (_abaAvaliarProduto === 'avaliar') renderAvaliarProdutoTab();
  else if (_abaAvaliarProduto === 'criterios') renderCriteriosProdutoTab();
  else renderFaixasConceitoTab();
}

function mudarAbaAvaliarProduto(aba, btn) {
  _abaAvaliarProduto = aba;
  document.querySelectorAll('#ad-page-avaliar .tab-bar .tab').forEach(el => el.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAbaAvaliarProdutoAtual();
}

function irParaAvaliacaoServico() {
  showAdPage('formularios');
  showFormTabAd('associar', document.getElementById('tab-btn-associar'));
}

// ---- Cálculo de nota/conceito de produto ----
function calcularNotaGeralProduto(notasPorCriterio, criterios) {
  let somaPonderada = 0, somaPesos = 0;
  criterios.forEach(c => {
    const nota = notasPorCriterio[c.id];
    if (nota === undefined || nota === null || nota === '') return;
    somaPonderada += parseFloat(nota) * c.peso;
    somaPesos += c.peso;
  });
  if (somaPesos === 0) return null;
  return somaPonderada / somaPesos;
}

function getConceitoPorFaixa(nota, faixas) {
  if (nota === null) return null;
  const faixa = faixas.find(f => nota >= f.de && nota <= f.ate) || faixas[faixas.length - 1];
  return faixa || null;
}

// ---- Avaliar fornecedor (lançamento) + Fornecedores avaliados (histórico), empilhados ----
function renderAvaliarProdutoTab() {
  const d = db();
  const wrap = document.getElementById('avaliar-produto-tab');
  const criteriosAtivos = d.criteriosProduto.filter(c => c.ativo);

  if (!criteriosAtivos.length) {
    wrap.innerHTML = `<div class="empty-state"><p>Cadastre ao menos um critério ativo na aba "Critérios" antes de avaliar um fornecedor.</p></div>`;
    return;
  }

  // Estado do fornecedor sendo avaliado nesse lançamento — não é salvo em
  // lugar nenhum até "Salvar lançamento" ser clicado.
  window._fornecedorLancamento = { id: null, cnpj: '', novo: false };

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  const fornecedoresProdutoTodos = d.fornecedores.filter(f => f.tipo === 'produto' || f.tipo === 'ambos');

  wrap.innerHTML = `
    <div class="card" style="margin-bottom:16px">
      <div class="card-title">Avaliar fornecedor</div>
      <div class="form-row three">
        <div class="form-group">
          <label>CNPJ do fornecedor</label>
          <div style="display:flex; gap:6px">
            <input type="text" id="lp-cnpj" placeholder="00.000.000/0000-00" oninput="this.value = formatarCNPJ(this.value)" style="flex:1">
            <button type="button" class="btn btn-secondary btn-sm" onclick="buscarFornecedorPorCnpj()">🔍 Buscar</button>
          </div>
        </div>
        <div class="form-group">
          <label>Nome do fornecedor</label>
          <input type="text" id="lp-nome-fornecedor" placeholder="Busque o CNPJ primeiro" disabled>
          <div id="lp-status-fornecedor" style="margin-top:6px; font-size:11px"></div>
        </div>
        <div class="form-group"><label>Nº da Nota Fiscal</label><input type="text" id="lp-nf" placeholder="Ex: 117743"></div>
        <div class="form-group"><label>Data</label><input type="date" id="lp-data" value="${hoje.toISOString().slice(0,10)}"></div>
      </div>
      <div class="form-row three" style="margin-top:10px">
      </div>
      <p style="font-size:12px; font-weight:600; color:var(--text-sec); margin:14px 0 8px">Notas (0 a 10)</p>
      <div class="form-row three" id="lp-criterios">
        ${criteriosAtivos.map(c => `
          <div class="form-group">
            <label>${c.nome} <span style="color:var(--text-muted); font-weight:400">(peso ${c.peso})</span></label>
            <input type="number" min="0" max="10" step="0.5" class="lp-nota-input" data-criterio-id="${c.id}" oninput="atualizarPreviaNotaProduto()">
          </div>
        `).join('')}
      </div>
      <div id="lp-previa" style="margin-top:10px; padding:10px 14px; background:var(--surface2); border-radius:8px; font-size:13px; display:none"></div>
      <button class="btn btn-primary" style="margin-top:16px" onclick="salvarAvaliacaoProduto()">Salvar lançamento</button>
    </div>
    <div class="card">
      <div class="card-title">Fornecedores avaliados</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px">
        <div class="form-group" style="margin:0; min-width:200px"><label>Fornecedor</label>
          <select id="hp-fornecedor" onchange="renderFornecedoresAvaliadosBloco()">
            <option value="">Todos</option>
            ${fornecedoresProdutoTodos.map(f => `<option value="${f.id}">${f.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin:0; min-width:150px"><label>Mês</label>
          <select id="hp-mes" onchange="renderFornecedoresAvaliadosBloco()">${MESES.map((m,i) => i>0?`<option value="${i}" ${i===mesAtual?'selected':''}>${m}</option>`:'').join('')}</select>
        </div>
        <div class="form-group" style="margin:0; min-width:110px"><label>Ano</label>
          <select id="hp-ano" onchange="renderFornecedoresAvaliadosBloco()">${[anoAtual, anoAtual-1].map(a => `<option value="${a}" ${a===anoAtual?'selected':''}>${a}</option>`).join('')}</select>
        </div>
      </div>
      <div id="hp-resultado"></div>
    </div>
  `;
  renderFornecedoresAvaliadosBloco();
}

function renderFornecedoresAvaliadosBloco() {
  const fSel = document.getElementById('hp-fornecedor');
  const mSel = document.getElementById('hp-mes');
  const aSel = document.getElementById('hp-ano');
  renderResultadoHistoricoProduto(fSel.value, parseInt(mSel.value), aSel.value);
}

// Busca o fornecedor pelo CNPJ: primeiro no seu próprio cadastro (evita
// duplicar); se não achar, consulta uma API pública (OpenCNPJ, com a
// BrasilAPI como reserva) só pra preencher o nome — nada é salvo agora,
// só quando "Salvar lançamento" for clicado.
async function buscarFornecedorPorCnpj() {
  const cnpjInput = document.getElementById('lp-cnpj');
  const cnpjLimpo = cnpjInput.value.replace(/\D/g, '');
  const nomeInput = document.getElementById('lp-nome-fornecedor');
  const statusEl = document.getElementById('lp-status-fornecedor');

  if (cnpjLimpo.length !== 14) { toast('CNPJ inválido — precisa ter 14 dígitos.'); return; }

  const d = db();
  const existente = d.fornecedores.find(f => (f.cnpj || '').replace(/\D/g, '') === cnpjLimpo);
  if (existente) {
    window._fornecedorLancamento = { id: existente.id, cnpj: cnpjLimpo, novo: false };
    nomeInput.value = existente.nome;
    nomeInput.disabled = true;
    const vencido = fornecedorTemDocumentoVencido(existente.id);
    statusEl.innerHTML = '<span style="color:var(--accent); font-weight:600">🔵 Já cadastrado</span>'
      + (vencido ? ' &nbsp;<span style="color:var(--danger); font-weight:600">⚠️ Documentação vencida</span>' : '');
    atualizarPreviaNotaProduto();
    return;
  }

  statusEl.innerHTML = '<span style="color:var(--text-muted)">Buscando...</span>';
  nomeInput.disabled = false;
  nomeInput.value = '';

  let nomeEncontrado = null;
  try {
    const r = await fetch(`https://api.opencnpj.org/${cnpjLimpo}`);
    if (r.ok) {
      const j = await r.json();
      nomeEncontrado = j.razao_social || j.nome_fantasia || null;
    }
  } catch (e) { /* segue pra reserva abaixo */ }

  if (!nomeEncontrado) {
    try {
      const r2 = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (r2.ok) {
        const j2 = await r2.json();
        nomeEncontrado = j2.razao_social || j2.nome_fantasia || null;
      }
    } catch (e) { /* segue sem achar — admin digita na mão */ }
  }

  window._fornecedorLancamento = { id: null, cnpj: cnpjLimpo, novo: true };
  nomeInput.value = nomeEncontrado || '';
  statusEl.innerHTML = nomeEncontrado
    ? '<span style="color:var(--success); font-weight:600">🟢 Novo — será cadastrado ao salvar</span>'
    : '<span style="color:var(--warn); font-weight:600">🟢 Novo — não achamos os dados automaticamente, digite o nome</span>';
  atualizarPreviaNotaProduto();
}

function atualizarPreviaNotaProduto() {
  const d = db();
  const criteriosAtivos = d.criteriosProduto.filter(c => c.ativo);
  const notas = {};
  document.querySelectorAll('.lp-nota-input').forEach(inp => {
    if (inp.value !== '') notas[inp.dataset.criterioId] = inp.value;
  });
  const nota = calcularNotaGeralProduto(notas, criteriosAtivos);
  const previa = document.getElementById('lp-previa');
  if (nota === null) { previa.style.display = 'none'; return; }
  const faixa = getConceitoPorFaixa(nota, d.faixasConceitoProduto);
  previa.style.display = 'block';
  previa.innerHTML = `Nota geral: <b>${nota.toFixed(1)}</b> &nbsp;·&nbsp; Conceito: <b style="color:${faixa ? faixa.cor : 'inherit'}">${faixa ? faixa.nome : '—'}</b>${(d.descontoOcorrenciaAtivo && nota < 10) ? ' <span style="color:var(--danger)">— conta como ocorrência</span>' : ''}`;
}

async function salvarAvaliacaoProduto() {
  const d = db();
  const estado = window._fornecedorLancamento;
  const data = document.getElementById('lp-data').value;
  const numeroNf = document.getElementById('lp-nf').value.trim();

  if (!estado || (!estado.id && !estado.novo)) { toast('Busque o CNPJ do fornecedor antes de lançar.'); return; }
  if (!data) { toast('Informe a data.'); return; }

  let nomeFornecedor = estado.id
    ? (d.fornecedores.find(f => f.id === estado.id)?.nome || '')
    : document.getElementById('lp-nome-fornecedor').value.trim();
  if (!estado.id && !nomeFornecedor) { toast('Informe o nome do fornecedor.'); return; }

  const criteriosAtivos = d.criteriosProduto.filter(c => c.ativo);
  const notasPorCriterio = {};
  let faltando = false;
  document.querySelectorAll('.lp-nota-input').forEach(inp => {
    if (inp.value === '') { faltando = true; return; }
    notasPorCriterio[inp.dataset.criterioId] = parseFloat(inp.value);
  });
  if (faltando || !Object.keys(notasPorCriterio).length) { toast('Preencha a nota de todos os critérios.'); return; }

  const notaGeral = calcularNotaGeralProduto(notasPorCriterio, criteriosAtivos);
  const faixa = getConceitoPorFaixa(notaGeral, d.faixasConceitoProduto);
  // Regra real (não é por faixa): qualquer nota fiscal que não tire 10 conta
  // como ocorrência — só desconta de fato se o interruptor estiver ligado.
  const contaOcorrencia = !!(d.descontoOcorrenciaAtivo && notaGeral < 10);

  // "Fotografia" dos critérios usados nesse lançamento — não quebra se
  // o critério for editado/excluído depois.
  const notasSnapshot = criteriosAtivos
    .filter(c => notasPorCriterio[c.id] !== undefined)
    .map(c => ({ criterioId: c.id, nome: c.nome, peso: c.peso, nota: notasPorCriterio[c.id] }));

  // Só cadastra o fornecedor de verdade AGORA, depois de tudo validado —
  // se o admin desistisse antes disso, nada ficaria órfão no banco.
  let fornecedorId = estado.id;
  if (!fornecedorId) {
    const { data: novoForn, error: errForn } = await supabaseClient.from('fornecedores').insert({
      empresa_id: currentUser.empresaId, nome: nomeFornecedor, cnpj: formatarCNPJ(estado.cnpj),
      tipo: 'produto', ativo: true, diverso: true, campos_custom: {},
    }).select().single();
    if (errForn) { toast('Erro ao cadastrar fornecedor: ' + errForn.message); return; }
    fornecedorId = novoForn.id;
    await carregarFornecedores();
  }

  const { error } = await supabaseClient.from('avaliacoes_produto').insert({
    empresa_id: currentUser.empresaId,
    fornecedor_id: fornecedorId,
    usuario_id: currentUser.id,
    data,
    numero_nf: numeroNf,
    notas: notasSnapshot,
    nota_geral: notaGeral,
    conceito: faixa ? faixa.nome : null,
    conta_ocorrencia: contaOcorrencia,
    enviado_por_email: currentUser.email,
  });

  if (error) { toast('Erro ao salvar lançamento: ' + error.message); return; }

  addLog('avaliacao_produto_lancada', `${currentUser.email} lançou NF ${numeroNf || '(sem número)'} do fornecedor "${nomeFornecedor}" — nota ${notaGeral.toFixed(1)} (${faixa ? faixa.nome : '—'})`);

  await carregarAvaliacoesProduto();
  renderAvaliarProdutoTab();
  toast('Nota fiscal lançada!');
}

// ---- Fornecedores avaliados (histórico / conceito do período) ----
function renderResultadoHistoricoProduto(fornecedorId, mes, ano) {
  const d = db();
  const mesStr = String(mes).padStart(2, '0');
  const todos = fornecedorId === '';
  const nfsDoMes = d.avaliacoesProduto
    .filter(av => (todos || av.fornecedorId === fornecedorId) && av.data.startsWith(`${ano}-${mesStr}`))
    .sort((a, b) => new Date(a.data) - new Date(b.data));

  const wrap = document.getElementById('hp-resultado');

  if (!nfsDoMes.length) {
    wrap.innerHTML = '<div class="empty-state"><p>Nenhuma nota fiscal lançada nesse período.</p></div>';
    return;
  }

  // Média/desconto agregados só fazem sentido pra 1 fornecedor por vez —
  // misturar fornecedores diferentes numa média só não diria nada de útil.
  let agregadoHtml = '';
  if (!todos) {
    const conceitoPeriodo = nfsDoMes.reduce((s, av) => s + av.notaGeral, 0) / nfsDoMes.length;
    const ocorrencias = d.descontoOcorrenciaAtivo ? nfsDoMes.filter(av => av.contaOcorrencia).length : 0;
    const desconto = ocorrencias * d.valorDescontoOcorrencia;
    const notaFinal = Math.max(0, conceitoPeriodo - desconto);
    const faixaFinal = getConceitoPorFaixa(notaFinal, d.faixasConceitoProduto);
    agregadoHtml = `
    <div style="border-top:1px solid var(--border); padding-top:14px">
      <p style="font-size:13px; margin-bottom:4px">Conceito do período (média das ${nfsDoMes.length} NF${nfsDoMes.length > 1 ? 's' : ''}): <b>${conceitoPeriodo.toFixed(1)}</b></p>
      ${d.descontoOcorrenciaAtivo ? `<p style="font-size:13px; margin-bottom:4px">Ocorrências (notas ≠ 10): <b>${ocorrencias}</b> × ${d.valorDescontoOcorrencia} = <b style="color:var(--danger)">-${desconto.toFixed(1)}</b></p>` : ''}
      <p style="font-size:15px; margin-top:8px">Nota final do período: <b>${notaFinal.toFixed(1)}</b> &nbsp; <span style="padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; background:${faixaFinal ? faixaFinal.cor + '22' : 'var(--surface2)'}; color:${faixaFinal ? faixaFinal.cor : 'var(--text-muted)'}">${faixaFinal ? faixaFinal.nome : '—'}</span></p>
    </div>`;
  }

  wrap.innerHTML = `
    <div style="display:flex; justify-content:flex-end; margin-bottom:10px">
      <button class="btn btn-secondary btn-sm" onclick="abrirExportarRelatorioProduto('${fornecedorId}', ${mes}, ${ano})">📊 Exportar relatório</button>
    </div>
    <div style="margin-bottom:14px">
      <table>
        <thead><tr>${todos ? '<th>Fornecedor</th>' : ''}<th>Data</th><th>NF</th><th style="text-align:center">Nota</th><th>Conceito</th><th></th></tr></thead>
        <tbody>
          ${nfsDoMes.map(av => {
            const faixa = d.faixasConceitoProduto.find(f => f.nome === av.conceito);
            const nomeForn = todos ? ((d.fornecedores.find(f => f.id === av.fornecedorId) || {}).nome || '—') : null;
            return `<tr style="cursor:pointer" onclick="verDetalheAvaliacaoProduto('${av.id}')">
              ${todos ? `<td style="font-weight:500">${nomeForn}</td>` : ''}
              <td>${fmtDataSimples(av.data)}</td>
              <td>${av.numeroNf || '—'}</td>
              <td style="text-align:center; font-weight:600">${av.notaGeral.toFixed(1)}</td>
              <td><span style="padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; background:${faixa ? faixa.cor + '22' : 'var(--surface2)'}; color:${faixa ? faixa.cor : 'var(--text-muted)'}">${av.conceito || '—'}</span>${av.contaOcorrencia ? ' <span style="color:var(--danger); font-size:11px">⚠ ocorrência</span>' : ''}</td>
              <td><button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); excluirAvaliacaoProduto('${av.id}')">Excluir</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    ${agregadoHtml}
  `;
}

function verDetalheAvaliacaoProduto(id) {
  const d = db();
  const av = d.avaliacoesProduto.find(a => a.id === id);
  if (!av) return;
  const forn = d.fornecedores.find(f => f.id === av.fornecedorId);
  const faixa = d.faixasConceitoProduto.find(f => f.nome === av.conceito);

  openModal(`
    <h3>${forn ? forn.nome : 'Fornecedor'}</h3>
    <p style="font-size:12px; color:var(--text-muted); margin-bottom:4px">NF ${av.numeroNf || '(sem número)'} · ${fmtDataSimples(av.data)}</p>
    <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Lançado por ${av.enviadoPorEmail || '—'}</p>
    <div style="margin-bottom:14px">
      <span style="padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; background:${faixa ? faixa.cor + '22' : 'var(--surface2)'}; color:${faixa ? faixa.cor : 'var(--text-muted)'}">${av.conceito || '—'}</span>
      <b style="margin-left:8px; font-size:15px">${av.notaGeral.toFixed(1)}</b>
      ${av.contaOcorrencia ? ' <span style="color:var(--danger); font-size:12px">⚠ conta como ocorrência</span>' : ''}
    </div>
    ${(av.notas || []).map(n => `
      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border); font-size:13px">
        <span>${n.nome} <span style="color:var(--text-muted); font-size:11px">(peso ${n.peso})</span></span>
        <b>${parseFloat(n.nota).toFixed(1)}</b>
      </div>
    `).join('')}
    <div class="no-print" style="display:flex; justify-content:flex-end; margin-top:16px">
      <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
    </div>
  `);
}

function abrirExportarRelatorioProduto(fornecedorId, mes, ano) {
  const d = db();
  const mesStr = String(mes).padStart(2, '0');
  const ultimoDia = new Date(ano, mes, 0).getDate(); // dia 0 do mês seguinte = último dia do mês atual
  const de = `${ano}-${mesStr}-01`;
  const ate = `${ano}-${mesStr}-${String(ultimoDia).padStart(2, '0')}`;
  const fornecedoresProduto = d.fornecedores.filter(f => f.tipo === 'produto' || f.tipo === 'ambos');

  openModal(`
    <h3>Exportar relatório</h3>
    <div class="form-group" style="margin-bottom:12px">
      <label>Fornecedor</label>
      <select id="exp-fornecedor">
        <option value="">Todos</option>
        ${fornecedoresProduto.map(f => `<option value="${f.id}" ${f.id === fornecedorId ? 'selected' : ''}>${f.nome}</option>`).join('')}
      </select>
    </div>
    <div class="form-row" style="grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px">
      <div class="form-group" style="margin:0"><label>De</label><input type="date" id="exp-de" value="${de}"></div>
      <div class="form-group" style="margin:0"><label>Até</label><input type="date" id="exp-ate" value="${ate}"></div>
    </div>
    <div class="form-row" style="grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px">
      <div class="form-group" style="margin:0">
        <label>Tipo de relatório</label>
        <select id="exp-tipo">
          <option value="simples">Simples</option>
          <option value="detalhado">Detalhado (com nota de cada critério)</option>
        </select>
      </div>
      <div class="form-group" style="margin:0">
        <label>Formato</label>
        <select id="exp-formato">
          <option value="excel">Excel (.xlsx)</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
    </div>
    <div style="display:flex; justify-content:flex-end; gap:8px">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="gerarRelatorioProduto()">Gerar relatório</button>
    </div>
  `);
}

function gerarRelatorioProduto() {
  const d = db();
  const fornecedorId = document.getElementById('exp-fornecedor').value;
  const de = document.getElementById('exp-de').value;
  const ate = document.getElementById('exp-ate').value;
  const tipo = document.getElementById('exp-tipo').value;
  const formato = document.getElementById('exp-formato').value;

  if (!de || !ate) { toast('Informe o período.'); return; }

  const nfs = d.avaliacoesProduto
    .filter(av => (!fornecedorId || av.fornecedorId === fornecedorId) && av.data >= de && av.data <= ate)
    .sort((a, b) => new Date(a.data) - new Date(b.data));

  if (!nfs.length) { toast('Nenhuma nota fiscal encontrada nesse período/fornecedor.'); return; }

  // Monta cabeçalho + linhas UMA vez — Excel e PDF reaproveitam a mesma tabela.
  let headers, linhasArray, linhasObjeto;
  if (tipo === 'simples') {
    headers = ['Fornecedor', 'Nota Fiscal', 'Data', 'Nota Geral', 'Conceito', 'Ocorrência'];
    linhasObjeto = nfs.map(av => ({
      'Fornecedor': (d.fornecedores.find(f => f.id === av.fornecedorId) || {}).nome || '—',
      'Nota Fiscal': av.numeroNf || '',
      'Data': fmtDataSimples(av.data),
      'Nota Geral': Number(av.notaGeral.toFixed(1)),
      'Conceito': av.conceito || '',
      'Ocorrência': av.contaOcorrencia ? 'Sim' : 'Não',
    }));
  } else {
    // Detalhado: uma coluna por critério — usa a união dos critérios que
    // aparecem nas fotografias salvas nesse período (podem variar se você
    // editou os critérios ao longo do tempo — isso é esperado, não é bug).
    const nomesCriterios = [...new Set(nfs.flatMap(av => (av.notas || []).map(n => n.nome)))];
    headers = ['Fornecedor', 'Nota Fiscal', 'Data', ...nomesCriterios, 'Nota Geral', 'Conceito', 'Ocorrência'];
    linhasObjeto = nfs.map(av => {
      const linha = {
        'Fornecedor': (d.fornecedores.find(f => f.id === av.fornecedorId) || {}).nome || '—',
        'Nota Fiscal': av.numeroNf || '',
        'Data': fmtDataSimples(av.data),
      };
      nomesCriterios.forEach(nome => {
        const item = (av.notas || []).find(n => n.nome === nome);
        linha[nome] = item ? Number(parseFloat(item.nota).toFixed(1)) : '';
      });
      linha['Nota Geral'] = Number(av.notaGeral.toFixed(1));
      linha['Conceito'] = av.conceito || '';
      linha['Ocorrência'] = av.contaOcorrencia ? 'Sim' : 'Não';
      return linha;
    });
  }
  linhasArray = linhasObjeto.map(obj => headers.map(h => obj[h] ?? ''));

  const nomeForn = fornecedorId ? ((d.fornecedores.find(f => f.id === fornecedorId) || {}).nome || '') : 'Todos os fornecedores';
  const nomeBase = `relatorio-produto-${de}_a_${ate}`;

  if (formato === 'excel') {
    const ws = XLSX.utils.json_to_sheet(linhasObjeto);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `${nomeBase}.xlsx`);
  } else {
    const { jsPDF } = window.jspdf;
    const docPdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: headers.length > 6 ? 'landscape' : 'portrait' });
    docPdf.setFontSize(13);
    docPdf.text(d.empresa.nome || 'Relatório de Avaliação de Fornecedores', 14, 15);
    docPdf.setFontSize(9);
    docPdf.text(`Fornecedor: ${nomeForn}  |  Período: ${fmtDataSimples(de)} a ${fmtDataSimples(ate)}  |  Tipo: ${tipo === 'simples' ? 'Simples' : 'Detalhado'}`, 14, 21);
    docPdf.autoTable({ head: [headers], body: linhasArray, startY: 26, styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] } });
    docPdf.save(`${nomeBase}.pdf`);
  }

  addLog('relatorio_produto_exportado', `${currentUser.email} exportou relatório de produto (${tipo}, ${formato}) de ${de} a ${ate}`);
  closeModal();
  toast('Relatório gerado!');
}

async function excluirAvaliacaoProduto(id) {
  if (!confirm('Excluir esse lançamento de nota fiscal? Isso recalcula o conceito do período.')) return;
  const { error } = await supabaseClient.from('avaliacoes_produto').delete().eq('id', id);
  if (error) { toast('Erro ao excluir lançamento: ' + error.message); return; }
  addLog('avaliacao_produto_excluida', `${currentUser.email} excluiu um lançamento de nota fiscal de produto`);
  await carregarAvaliacoesProduto();
  renderFornecedoresAvaliadosBloco();
  toast('Lançamento excluído.');
}

// ---- Critérios de produto ----
function renderCriteriosProdutoTab() {
  const d = db();
  const wrap = document.getElementById('avaliar-produto-tab');
  wrap.innerHTML = `
    <div class="card" style="margin-bottom:14px">
      <div class="card-title">Novo critério</div>
      <div class="form-row three">
        <div class="form-group"><label>Nome do critério</label><input type="text" id="ncp-nome" placeholder="Ex: Nota Fiscal"></div>
        <div class="form-group"><label>Peso</label><input type="number" id="ncp-peso" min="0" step="0.5" value="1"></div>
        <div style="display:flex; align-items:flex-end"><button class="btn btn-primary btn-block" onclick="addCriterioProduto()">Adicionar critério</button></div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Critérios cadastrados (${d.criteriosProduto.length})</div>
      <div id="criterios-produto-lista"></div>
    </div>
  `;
  renderCriteriosProdutoLista();
}

function renderCriteriosProdutoLista() {
  const d = db();
  const wrap = document.getElementById('criterios-produto-lista');
  if (!d.criteriosProduto.length) {
    wrap.innerHTML = '<div class="empty-state"><p>Nenhum critério cadastrado ainda. Adicione acima (ex: Nota Fiscal, Prazo, Quantidade, Condições).</p></div>';
    return;
  }
  wrap.innerHTML = `<table><thead><tr><th>Critério</th><th style="width:120px">Peso</th><th style="width:90px">Ativo</th><th></th></tr></thead><tbody>
    ${d.criteriosProduto.map(c => `<tr>
      <td style="font-weight:500">${c.nome}</td>
      <td><input type="number" min="0" step="0.5" value="${c.peso}" style="width:80px" onchange="salvarPesoCriterioProduto('${c.id}', this.value)"></td>
      <td><input type="checkbox" ${c.ativo ? 'checked' : ''} onchange="toggleCriterioProdutoAtivo('${c.id}', this.checked)"></td>
      <td><div class="actions"><button class="btn btn-danger btn-sm" onclick="excluirCriterioProduto('${c.id}')">Excluir</button></div></td>
    </tr>`).join('')}
  </tbody></table>`;
}

async function addCriterioProduto() {
  const nome = document.getElementById('ncp-nome').value.trim();
  const peso = parseFloat(document.getElementById('ncp-peso').value) || 1;
  if (!nome) { toast('Informe o nome do critério.'); return; }

  const { error } = await supabaseClient.from('criterios_produto').insert({
    empresa_id: currentUser.empresaId, nome, peso, ativo: true,
  });
  if (error) { toast('Erro ao criar critério: ' + error.message); return; }

  addLog('criterio_produto_criado', `${currentUser.email} criou o critério de produto "${nome}" (peso ${peso})`);
  document.getElementById('ncp-nome').value = '';
  document.getElementById('ncp-peso').value = '1';
  await carregarCriteriosProduto();
  renderCriteriosProdutoTab();
  toast('Critério adicionado!');
}

async function salvarPesoCriterioProduto(id, novoPeso) {
  const peso = parseFloat(novoPeso) || 0;
  const { error } = await supabaseClient.from('criterios_produto').update({ peso }).eq('id', id);
  if (error) { toast('Erro ao salvar peso: ' + error.message); return; }
  addLog('criterio_produto_editado', `${currentUser.email} alterou o peso de um critério de produto para ${peso}`);
  await carregarCriteriosProduto();
}

async function toggleCriterioProdutoAtivo(id, ativo) {
  const { error } = await supabaseClient.from('criterios_produto').update({ ativo }).eq('id', id);
  if (error) { toast('Erro ao atualizar critério: ' + error.message); return; }
  addLog('criterio_produto_status', `${currentUser.email} ${ativo ? 'ativou' : 'desativou'} um critério de produto`);
  await carregarCriteriosProduto();
}

async function excluirCriterioProduto(id) {
  const d = db();
  const c = d.criteriosProduto.find(x => x.id === id);
  if (!c) return;
  if (!confirm(`Excluir o critério "${c.nome}"? Avaliações que já usaram esse critério continuam com o registro delas intacto — só deixa de aparecer pra novos lançamentos.`)) return;

  const { error } = await supabaseClient.from('criterios_produto').delete().eq('id', id);
  if (error) { toast('Erro ao excluir critério: ' + error.message); return; }

  addLog('criterio_produto_excluido', `${currentUser.email} excluiu o critério de produto "${c.nome}"`);
  await carregarCriteriosProduto();
  renderCriteriosProdutoLista();
  toast('Critério excluído.');
}

// ---- Faixas de conceito de produto ----
let _faixasEmEdicao = null;

function renderFaixasConceitoTab() {
  const d = db();
  if (!_faixasEmEdicao) _faixasEmEdicao = JSON.parse(JSON.stringify(d.faixasConceitoProduto));
  const wrap = document.getElementById('avaliar-produto-tab');
  wrap.innerHTML = `
    <div class="card" style="margin-bottom:14px">
      <div class="card-title">Faixas de conceito</div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px">Define como a nota de 0 a 10 vira um conceito (ex: 0 a 4 = Ruim). Adicione ou remova faixas como quiser.</p>
      <div id="faixas-conceito-lista">
        ${_faixasEmEdicao.map((f, i) => `
          <div class="form-row" style="grid-template-columns: 2fr 1fr 1fr 1fr auto; gap:8px; align-items:end; margin-bottom:10px">
            <div class="form-group" style="margin:0"><label>Nome</label><input type="text" id="faixa-nome-${i}" value="${f.nome}"></div>
            <div class="form-group" style="margin:0"><label>De</label><input type="number" step="0.1" id="faixa-de-${i}" value="${f.de}"></div>
            <div class="form-group" style="margin:0"><label>Até</label><input type="number" step="0.1" id="faixa-ate-${i}" value="${f.ate}"></div>
            <div class="form-group" style="margin:0"><label>Cor</label><input type="color" id="faixa-cor-${i}" value="${f.cor}" style="height:36px; padding:2px"></div>
            <button class="btn btn-danger btn-sm" onclick="removerFaixaConceito(${i})">Excluir</button>
          </div>
        `).join('')}
      </div>
      <div style="display:flex; gap:8px; margin-top:10px">
        <button class="btn btn-secondary" onclick="adicionarFaixaConceito()">+ Adicionar faixa</button>
        <button class="btn btn-primary" onclick="salvarFaixasConceito()">Salvar faixas</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Desconto por ocorrência</div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px">Desligado por padrão — nunca é obrigatório. Se ligar, toda nota fiscal lançada com nota diferente de 10 desconta o valor abaixo do conceito do período (ex: 2 ocorrências × 0,5 = -1,0).</p>
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:${d.descontoOcorrenciaAtivo ? '14px' : '0'}">
        <input type="checkbox" id="desconto-ativo" ${d.descontoOcorrenciaAtivo ? 'checked' : ''} onchange="toggleDescontoOcorrenciaVisibilidade()">
        <label style="margin:0">Descontar por ocorrência</label>
      </div>
      <div id="desconto-valor-wrap" style="display:${d.descontoOcorrenciaAtivo ? 'flex' : 'none'}; gap:10px; align-items:flex-end">
        <div class="form-group" style="margin:0; max-width:160px"><label>Valor do desconto</label><input type="number" step="0.1" min="0" id="desconto-valor" value="${d.valorDescontoOcorrencia}"></div>
        <button class="btn btn-primary" onclick="salvarDescontoOcorrencia()">Salvar</button>
      </div>
    </div>
  `;
}

function capturarFaixasDoDOM() {
  _faixasEmEdicao.forEach((f, i) => {
    const nomeEl = document.getElementById(`faixa-nome-${i}`);
    if (!nomeEl) return; // linha já removida da tela
    f.nome = nomeEl.value.trim();
    f.de = parseFloat(document.getElementById(`faixa-de-${i}`).value);
    f.ate = parseFloat(document.getElementById(`faixa-ate-${i}`).value);
    f.cor = document.getElementById(`faixa-cor-${i}`).value;
  });
}

function adicionarFaixaConceito() {
  capturarFaixasDoDOM();
  _faixasEmEdicao.push({ nome: 'Nova faixa', de: 0, ate: 10, cor: '#94a3b8' });
  renderFaixasConceitoTab();
}

function removerFaixaConceito(index) {
  capturarFaixasDoDOM();
  _faixasEmEdicao.splice(index, 1);
  renderFaixasConceitoTab();
}

function toggleDescontoOcorrenciaVisibilidade() {
  const ativo = document.getElementById('desconto-ativo').checked;
  document.getElementById('desconto-valor-wrap').style.display = ativo ? 'flex' : 'none';
  salvarDescontoOcorrencia(); // salva o estado (ligado ou desligado) na hora, sem depender do botão escondido
}

async function salvarFaixasConceito() {
  capturarFaixasDoDOM();
  if (!_faixasEmEdicao.length) { toast('Cadastre ao menos uma faixa.'); return; }

  const { error } = await supabaseClient.from('empresas').update({ faixas_conceito_produto: _faixasEmEdicao }).eq('id', currentUser.empresaId);
  if (error) { toast('Erro ao salvar faixas: ' + error.message); return; }

  empresaConfigCache.faixas_conceito_produto = _faixasEmEdicao;
  _faixasEmEdicao = null; // próxima abertura recarrega do zero, já salvo
  addLog('faixas_conceito_atualizadas', `${currentUser.email} atualizou as faixas de conceito de produto`);
  renderFaixasConceitoTab();
  toast('Faixas salvas!');
}

async function salvarDescontoOcorrencia() {
  const ativo = document.getElementById('desconto-ativo').checked;
  const valorInput = document.getElementById('desconto-valor');
  const valor = valorInput ? (parseFloat(valorInput.value) || 0) : db().valorDescontoOcorrencia;

  const { error } = await supabaseClient.from('empresas').update({
    desconto_ocorrencia_ativo: ativo, valor_desconto_ocorrencia: valor,
  }).eq('id', currentUser.empresaId);
  if (error) { toast('Erro ao salvar configuração: ' + error.message); return; }

  empresaConfigCache.desconto_ocorrencia_ativo = ativo;
  empresaConfigCache.valor_desconto_ocorrencia = valor;
  addLog('desconto_ocorrencia_atualizado', `${currentUser.email} ${ativo ? 'ligou' : 'desligou'} o desconto por ocorrência`);
  toast('Configuração salva!');
}

