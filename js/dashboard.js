// ============ DASHBOARD ============
// Cada bloco só aparece se o admin tiver acesso ao módulo relacionado
// (admin_master sempre vê tudo — temAcessoModulo() já trata isso).

function barraSimplesHTML(label, valor, max, cor) {
  const pct = max > 0 ? Math.min(100, Math.round((valor / max) * 100)) : 0;
  return `
    <div style="margin-bottom:12px">
      <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px">
        <span>${label}</span><span style="font-weight:700">${valor}</span>
      </div>
      <div style="background:var(--surface2); border-radius:6px; height:9px; overflow:hidden">
        <div style="width:${pct}%; height:100%; background:${cor}; border-radius:6px; transition:width .3s"></div>
      </div>
    </div>`;
}

function graficoTendenciaHTML(d, anoAtual, mesAtual) {
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(anoAtual, mesAtual - 1 - i, 1);
    const chave = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
    const count = d.avaliacoes.filter(av => av.periodo === chave).length;
    meses.push({ label: MESES[dt.getMonth() + 1].slice(0, 3), count });
  }
  const max = Math.max(1, ...meses.map(m => m.count));
  return `
    <div style="display:flex; align-items:flex-end; gap:10px; height:120px; padding:10px 4px 0">
      ${meses.map(m => `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%">
          <span style="font-size:11px; font-weight:700; margin-bottom:4px">${m.count}</span>
          <div style="width:100%; max-width:34px; background:var(--accent); border-radius:4px 4px 0 0; height:${Math.max(4, Math.round((m.count / max) * 88))}px"></div>
          <span style="font-size:10px; color:var(--text-muted); margin-top:6px">${m.label}</span>
        </div>
      `).join('')}
    </div>`;
}

// diff > 0 é "bom" por padrão (ex: mais avaliações enviadas). Pra métricas
// onde diminuir é bom (ex: reprovados), passe invertido = true.
function deltaMesHTML(atual, anterior, invertido) {
  if (atual === anterior) return `<span style="font-size:11px; color:var(--text-muted)">= mês anterior</span>`;
  const diff = atual - anterior;
  const bom = invertido ? diff < 0 : diff > 0;
  const cor = bom ? 'var(--success)' : 'var(--danger)';
  const seta = diff > 0 ? '↑' : '↓';
  return `<span style="font-size:11px; color:${cor}; font-weight:600">${seta} ${Math.abs(diff)} vs mês anterior</span>`;
}

async function dispensarOnboarding() {
  const { error } = await salvarConfigEmpresa('onboarding_dispensado', true);
  if (error) { toast('Erro ao salvar: ' + error.message); return; }
  renderAdDashboard();
}

function renderAdDashboard() {
  const d = db();
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();
  const chaveMes = `${anoAtual}-${mesAtual}`;
  const dataAnterior = new Date(anoAtual, mesAtual - 2, 1);
  const chaveMesAnterior = `${dataAnterior.getFullYear()}-${dataAnterior.getMonth() + 1}`;

  const podeFornecedores = temAcessoModulo('fornecedores');
  const podeAvaliacoes = temAcessoModulo('avaliacoes');
  const podeMeusDocumentos = temAcessoModulo('meusdocumentos');

  let statsHTML = '';
  let alertaAprovacao = '';
  let alertaAvaliadoresPendentes = '';
  let alertaNotificar = '';
  let alertasDoc = '';
  let alertasDocUnidades = '';
  let graficosHTML = '';
  let tabelaHTML = '';

  // ---------- ALERTA: DOCUMENTOS ENVIADOS PELO PORTAL, AGUARDANDO APROVAÇÃO ----------
  if (podeFornecedores) {
    const pendentesAprovacao = (d.documentosPendentesAprovacao || []).filter(p => p.status === 'pendente');
    if (pendentesAprovacao.length) {
      alertaAprovacao = `
        <div class="card" style="border-left: 3px solid var(--accent); margin-bottom:16px">
          <div class="card-title" style="display:flex; align-items:center; gap:7px">${ic('inbox', 15)} Documentos enviados pelo portal — aguardando aprovação</div>
          ${pendentesAprovacao.map(p => {
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
          }).join('')}
        </div>`;
    }
  }

  // ---------- CARDS DE NÚMERO ----------
  const cards = [];
  if (podeFornecedores) {
    cards.push(`<div class="stat-card"><div class="stat-label">Fornecedores</div><div class="stat-value">${d.fornecedores.length}</div><div class="stat-sub">cadastrados</div></div>`);
  }
  if (podeAvaliacoes) {
    const totalFormPendentes = d.associacoes.length;
    const enviadosMes = d.avaliacoes.filter(av => av.periodo === chaveMes).length;
    const enviadosMesAnterior = d.avaliacoes.filter(av => av.periodo === chaveMesAnterior).length;
    const pendentesMes = totalFormPendentes - enviadosMes;
    const reprovadosLista = d.avaliacoes.filter(av => av.periodo === chaveMes && !av.semServico && (getSituacao(av.nota) === 'reprovado' || getSituacao(av.nota) === 'parcial'));
    const reprovadosMes = reprovadosLista.filter(av => getSituacao(av.nota) === 'reprovado').length;
    const reprovadosMesAnteriorLista = d.avaliacoes.filter(av => av.periodo === chaveMesAnterior && !av.semServico && getSituacao(av.nota) === 'reprovado');

    cards.push(`<div class="stat-card"><div class="stat-label">Avaliações enviadas</div><div class="stat-value" style="color:var(--success)">${enviadosMes}</div>${deltaMesHTML(enviadosMes, enviadosMesAnterior, false)}</div>`);
    let subPendentes = '<div class="stat-sub">aguardando setor</div>';
    let podeAbrirModalPendentes = false;
    if (temAcessoModulo('usuarios')) {
      const avaliadoresPendentesLista = d.usuarios
        .filter(u => u.papel === 'avaliador' && u.ativo)
        .map(u => ({ usuario: u, ...contarPendentesAvaliador(d, u.id) }))
        .filter(item => item.pendentes > 0);

      if (avaliadoresPendentesLista.length) {
        podeAbrirModalPendentes = true;
        subPendentes = `<div class="stat-sub" style="color:var(--warn)">${avaliadoresPendentesLista.length} avaliador(es) com pendência — clique para ver</div>`;

        alertaAvaliadoresPendentes = `
          <div class="card alert-collapse" id="alerta-avaliadores-pendentes" style="border-left: 3px solid var(--warn); margin-bottom:16px">
            <div class="alert-collapse-header" onclick="toggleAlertaCollapse('alerta-avaliadores-pendentes')">
              ${ic('users', 15)}
              <span class="card-title" style="margin-bottom:0; color:var(--warn)">Avaliadores com avaliação pendente</span>
              <span style="font-size:11px; font-weight:400; color:var(--text-muted)">${avaliadoresPendentesLista.length} avaliador(es)</span>
              <span class="alert-collapse-chevron">${ic('chevronDown', 16)}</span>
            </div>
            <div class="alert-collapse-body">
              ${avaliadoresPendentesLista.map(item => `
                <div style="display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid var(--border); font-size:12px">
                  <span><b>${item.usuario.nome}</b></span>
                  <span style="color:var(--text-muted)">${item.pendentes} pendente(s)${item.atrasados ? `, ${item.atrasados} atrasada(s)` : ''}</span>
                  ${item.atrasados ? '<span class="badge badge-danger" style="margin-left:auto">Atrasado</span>' : ''}
                </div>`).join('')}
              <div style="margin-top:10px">
                <button class="btn btn-primary btn-sm" style="display:inline-flex; align-items:center; gap:6px" onclick="enviarLembreteTodosAvaliadores()">${ic('mail', 13)} Lembrar todos</button>
              </div>
            </div>
          </div>`;
      }
    }
    cards.push(`<div class="stat-card" ${podeAbrirModalPendentes ? 'style="cursor:pointer" onclick="abrirModalAvaliadoresPendentes()"' : ''}><div class="stat-label">Pendentes</div><div class="stat-value" style="color:var(--warn)">${Math.max(0, pendentesMes)}</div>${subPendentes}</div>`);
    cards.push(`<div class="stat-card"><div class="stat-label">Reprovados</div><div class="stat-value" style="color:var(--danger)">${reprovadosMes}</div>${deltaMesHTML(reprovadosMes, reprovadosMesAnteriorLista.length, true)}</div>`);

    // ---------- ALERTA: NOTIFICAR NOTA BAIXA (com "cobrado em") ----------
    if (reprovadosLista.length) {
      alertaNotificar = `
        <div class="card" style="border-left: 3px solid var(--danger); margin-bottom:16px">
          <div class="card-title" style="color:var(--danger); display:flex; align-items:center; gap:7px">
            ${ic('mail', 15)} Fornecedores para notificar (Parcial/Reprovado — ${MESES[mesAtual]})
          </div>
          ${reprovadosLista.map(av => {
            const forn = d.fornecedores.find(f => f.id === av.fornecedorId);
            const sit = getSituacao(av.nota);
            const acao = av.notificadoEm
              ? `<span style="margin-left:auto; font-size:11px; color:var(--success); font-weight:600; display:flex; align-items:center; gap:3px">${ic('mail', 12)} Cobrado em ${new Date(av.notificadoEm).toLocaleDateString('pt-BR')}</span>`
              : `<button class="btn btn-secondary btn-sm" style="margin-left:auto; display:inline-flex; align-items:center; gap:5px" onclick="abrirNotificacaoAvaliacao('${av.id}')">${ic('bell', 13)} Ver / Notificar</button>`;
            return `<div style="display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid var(--border); font-size:12px">
              <span><b>${forn ? forn.nome : '—'}</b> — nota ${av.nota.toFixed(1)}</span>
              ${badgeSit(sit)}
              ${acao}
            </div>`;
          }).join('')}
        </div>`;
    }

    // ---------- GRÁFICOS ----------
    const avaliacoesMes = d.avaliacoes.filter(av => av.periodo === chaveMes && !av.semServico);
    const aprovados = avaliacoesMes.filter(av => getSituacao(av.nota) === 'aprovado').length;
    const parciais = avaliacoesMes.filter(av => getSituacao(av.nota) === 'parcial').length;
    const reprovados = avaliacoesMes.filter(av => getSituacao(av.nota) === 'reprovado').length;
    const maxSituacao = Math.max(1, aprovados, parciais, reprovados);

    graficosHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px">
        <div class="card">
          <div class="card-title">Avaliações por situação — ${MESES[mesAtual]}</div>
          ${avaliacoesMes.length ? `
            ${barraSimplesHTML('<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--success);margin-right:5px"></span>Aprovado', aprovados, maxSituacao, 'var(--success)')}
            ${barraSimplesHTML('<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--warn);margin-right:5px"></span>Parcial', parciais, maxSituacao, 'var(--warn)')}
            ${barraSimplesHTML('<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--danger);margin-right:5px"></span>Reprovado', reprovados, maxSituacao, 'var(--danger)')}
          ` : '<p style="font-size:12px; color:var(--text-muted)">Nenhuma avaliação enviada este mês ainda.</p>'}
        </div>
        <div class="card">
          <div class="card-title">Avaliações enviadas — últimos 6 meses</div>
          ${graficoTendenciaHTML(d, anoAtual, mesAtual)}
        </div>
      </div>`;

    // ---------- TABELA ----------
    tabelaHTML = `
      <div class="card">
        <div class="card-title">Avaliações recentes</div>
        ${renderAvaliacoesTable(d.avaliacoes.slice().sort((a, b) => new Date(b.enviadoEm) - new Date(a.enviadoEm)).slice(0, 8), d)}
      </div>`;
  }
  statsHTML = cards.length ? `<div class="stats-grid">${cards.join('')}</div>` : '';

  // ---------- ALERTA: DOCUMENTOS DE FORNECEDOR VENCENDO (com "cobrado em") ----------
  if (podeFornecedores) {
    const { vencidos, proximos } = contarDocumentosVencendo(d);
    if (vencidos.length || proximos.length) {
      const linhaDoc = (doc, label, cor) => {
        const forn = d.fornecedores.find(f => f.id === doc.fornecedorId);
        const falhouRecente = doc.ultimoErroCobranca && (!doc.cobradoEm || new Date(doc.ultimoErroCobrancaEm) > new Date(doc.cobradoEm));
        const botao = forn && forn.email ? `<button class="btn btn-secondary btn-sm" onclick="enviarCobrancaDocumento('${doc.id}')">${ic('mail', 13)} Cobrar</button>` : '<span style="font-size:11px; color:var(--text-muted)">sem e-mail</span>';
        const status = falhouRecente
          ? `<div style="font-size:10px; color:var(--danger); margin-top:2px; display:flex; align-items:center; gap:3px">${ic('xCircle', 11)} envio automático falhou — use o botão</div>`
          : (doc.cobradoEm ? `<div style="font-size:10px; color:var(--success); margin-top:2px; display:flex; align-items:center; gap:3px">${ic('mail', 11)} Cobrado em ${new Date(doc.cobradoEm).toLocaleDateString('pt-BR')}</div>` : '');
        const acao = `<div style="margin-left:auto; text-align:right">${botao}${status}</div>`;
        return `<div style="display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid var(--border); font-size:12px">
          <span style="color:${cor}; font-weight:600">${label}</span>
          <span><b>${forn ? forn.nome : '—'}</b> — ${doc.nome}</span>
          <span style="color:var(--text-muted)">válido até ${new Date(doc.validade + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
          ${acao}
        </div>`;
      };
      alertasDoc = `
        <div class="card alert-collapse" id="alerta-docs-fornecedores" style="border-left: 3px solid var(--danger); margin-bottom:16px">
          <div class="alert-collapse-header" onclick="toggleAlertaCollapse('alerta-docs-fornecedores')">
            ${ic('alertTriangle', 15)}
            <span class="card-title" style="margin-bottom:0; color:var(--danger)">Documentos de fornecedores que precisam de atenção</span>
            <span style="font-size:11px; font-weight:400; color:var(--text-muted)">${vencidos.length + proximos.length} ocorrência(s)</span>
            <span class="alert-collapse-chevron">${ic('chevronDown', 16)}</span>
          </div>
          <div class="alert-collapse-body">
            ${vencidos.map(doc => linhaDoc(doc, 'VENCIDO', 'var(--danger)')).join('')}
            ${proximos.map(doc => linhaDoc(doc, `VENCE EM ${diasParaVencer(doc.validade)}D`, 'var(--warn)')).join('')}
            <div style="margin-top:10px">
              <button class="btn btn-secondary btn-sm" onclick="showAdPage('fornecedores')">Ver fornecedores →</button>
            </div>
          </div>
        </div>`;
    }
  }

  // ---------- ALERTA: DOCUMENTOS DE "MEUS DOCUMENTOS" VENCENDO ----------
  if (podeMeusDocumentos) {
    const { vencidos: uVencidos, proximos: uProximos } = contarUnidadesDocumentosVencendo(d);
    if (uVencidos.length || uProximos.length) {
      const linhaU = (doc, label, cor) => {
        const un = d.unidades.find(u => u.id === doc.unidadeId);
        return `<div style="display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid var(--border); font-size:12px">
          <span style="color:${cor}; font-weight:600">${label}</span>
          <span><b>${un ? un.nome : '—'}</b> — ${doc.nome}</span>
          <span style="color:var(--text-muted); margin-left:auto">${new Date(doc.validade + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
        </div>`;
      };
      alertasDocUnidades = `
        <div class="card" style="border-left: 3px solid var(--danger); margin-bottom:16px">
          <div class="card-title" style="color:var(--danger); display:flex; align-items:center; gap:7px">
            ${ic('folder', 15)} Documentos de "Meus Documentos" que precisam de atenção
            <span style="font-size:11px; font-weight:400; color:var(--text-muted)">${uVencidos.length + uProximos.length} ocorrência(s)</span>
          </div>
          ${uVencidos.map(doc => linhaU(doc, 'VENCIDO', 'var(--danger)')).join('')}
          ${uProximos.map(doc => linhaU(doc, `VENCE EM ${diasParaVencer(doc.validade)}D`, 'var(--warn)')).join('')}
          <div style="margin-top:10px">
            <button class="btn btn-secondary btn-sm" onclick="showAdPage('meusdocumentos')">Ver Meus Documentos →</button>
          </div>
        </div>`;
    }
  }

  // ---------- ONBOARDING GUIADO ----------
  let onboardingHTML = '';
  const podeOnboarding = podeFornecedores && temAcessoModulo('formularios') && podeAvaliacoes && temAcessoModulo('usuarios');
  if (podeOnboarding && !(empresaConfigCache.config || {}).onboarding_dispensado) {
    const passos = [
      { feito: d.fornecedores.length > 0, texto: 'Cadastre seu primeiro fornecedor', modulo: 'fornecedores' },
      { feito: d.formularios.length > 0, texto: 'Crie um formulário de avaliação', modulo: 'formularios' },
      { feito: d.usuarios.some(u => u.papel === 'avaliador'), texto: 'Convide um avaliador', modulo: 'usuarios' },
    ];
    if (passos.some(p => !p.feito)) {
      onboardingHTML = `
        <div class="card" style="border-left: 3px solid var(--accent); margin-bottom:16px">
          <div style="display:flex; justify-content:space-between; align-items:center">
            <div class="card-title" style="margin-bottom:0; display:flex; align-items:center; gap:7px">${ic('wave', 16)} Primeiros passos</div>
            <button class="btn btn-secondary btn-sm" onclick="dispensarOnboarding()">Dispensar</button>
          </div>
          <div style="margin-top:10px">
            ${passos.map(p => `
              <div style="display:flex; align-items:center; gap:8px; padding:6px 0; font-size:13px; ${p.feito ? 'opacity:.5; text-decoration:line-through' : 'cursor:pointer'}" ${p.feito ? '' : `onclick="showAdPage('${p.modulo}', document.querySelector('#sidebar .nav-item[onclick*=\\'${p.modulo}\\']'))"`}>
                <span>${p.feito ? ic('check', 14) : ic('circleEmpty', 14)}</span><span>${p.texto}</span>
              </div>
            `).join('')}
          </div>
        </div>`;
    }
  }

  const semNadaParaMostrar = !statsHTML && !alertaAprovacao && !alertaAvaliadoresPendentes && !alertaNotificar && !alertasDoc && !alertasDocUnidades && !graficosHTML && !tabelaHTML;

  document.getElementById('ad-page-dashboard').innerHTML = `
    <div class="page-header"><div><h2>Dashboard e notificações</h2><p>${MESES[mesAtual]} de ${anoAtual}</p></div></div>
    ${onboardingHTML}
    ${statsHTML}
    ${alertaAprovacao}
    ${alertaAvaliadoresPendentes}
    ${alertaNotificar}
    ${alertasDoc}
    ${alertasDocUnidades}
    ${graficosHTML}
    ${tabelaHTML}
    ${semNadaParaMostrar ? '<div class="card"><div class="empty-state"><p>Nenhum módulo com dados pra mostrar aqui — os módulos liberados pra você aparecem no menu ao lado.</p></div></div>' : ''}
  `;
}

// Colapsa/expande um card de alerta clicando no cabeçalho.
function toggleAlertaCollapse(cardId) {
  const card = document.getElementById(cardId);
  if (card) card.classList.toggle('open');
}

// Popup com o detalhe de quem tem avaliação pendente — aberto ao clicar no
// stat-card "Pendentes".
function abrirModalAvaliadoresPendentes() {
  const d = db();
  const lista = d.usuarios
    .filter(u => u.papel === 'avaliador' && u.ativo)
    .map(u => ({ usuario: u, ...contarPendentesAvaliador(d, u.id) }))
    .filter(item => item.pendentes > 0)
    .sort((a, b) => b.atrasados - a.atrasados);

  openModal(`
    <h3>Avaliadores com avaliação pendente</h3>
    <div style="max-height:400px; overflow-y:auto; margin-top:12px">
      ${lista.length ? lista.map(item => `
        <div style="display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--border); font-size:13px">
          <span style="flex:1"><b>${item.usuario.nome}</b></span>
          <span style="color:var(--text-muted)">${item.pendentes} pendente(s)${item.atrasados ? `, ${item.atrasados} atrasada(s)` : ''}</span>
          ${item.atrasados ? '<span class="badge badge-danger">Atrasado</span>' : ''}
        </div>
      `).join('') : '<div class="empty-state"><p>Nenhuma pendência no momento.</p></div>'}
    </div>
    ${lista.length ? `<div style="margin-top:14px"><button class="btn btn-primary" style="display:inline-flex; align-items:center; gap:6px" onclick="closeModal(); enviarLembreteTodosAvaliadores()">${ic('mail', 14)} Lembrar todos</button></div>` : ''}
  `);
}

function renderAvaliacoesTable(lista, d) {
  if (!lista.length) return '<div class="empty-state"><p>Nenhuma avaliação registrada ainda.</p></div>';
  return `<table>
    <thead><tr><th>Formulário</th><th>Fornecedor</th><th>Enviado por</th><th style="text-align:center">Nota</th><th>Situação</th><th>Data</th></tr></thead>
    <tbody>
      ${lista.map(av => {
        const form = d.formularios.find(f => f.id === av.formularioId);
        const forn = d.fornecedores.find(f => f.id === av.fornecedorId);
        const sit = av.semServico ? null : getSituacao(av.nota);
        return `<tr>
          <td style="font-weight:500">${form ? form.nome : '—'}</td>
          <td>${forn ? forn.nome : '—'}</td>
          <td style="color:var(--text-sec)">${av.enviadoPor}</td>
          <td style="text-align:center; font-weight:600">${av.semServico ? '—' : av.nota.toFixed(1)}</td>
          <td>${av.semServico ? '<span class="badge badge-neutral">Sem serviço</span>' : badgeSit(sit)}</td>
          <td style="color:var(--text-muted); font-size:11px">${fmtData(av.enviadoEm)}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

// ---------- APROVAÇÃO DE DOCUMENTOS ENVIADOS PELO PORTAL ----------
// Essas 3 funções ficavam em fornecedores.js (o bloco de "aguardando
// aprovação" morava lá) e ficaram pra trás quando o bloco foi movido pra cá.
// O resto da lógica é idêntica à original, só troquei a chamada de
// renderPendentesAprovacao() por renderAdDashboard() (que é quem redesenha
// esse alerta agora).

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
  renderAdDashboard();
  if (typeof renderAdFornecedores === 'function') renderAdFornecedores();
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
  renderAdDashboard();
  toast('Rejeitado. O fornecedor pode enviar de novo pelo mesmo link.');
}
