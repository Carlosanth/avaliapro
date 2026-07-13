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
  let alertaNotificar = '';
  let alertasDoc = '';
  let alertasDocUnidades = '';
  let graficosHTML = '';
  let tabelaHTML = '';

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
    if (temAcessoModulo('usuarios')) {
      const avaliadoresComPendencia = d.usuarios.filter(u => u.papel === 'avaliador' && u.ativo && contarPendentesAvaliador(d, u.id).pendentes > 0).length;
      if (avaliadoresComPendencia > 0) {
        subPendentes = `
          <div class="stat-sub" style="color:var(--warn)">${avaliadoresComPendencia} avaliador(es) com pendência</div>
          <button class="btn btn-secondary btn-sm" style="margin-top:6px; font-size:11px; padding:3px 8px" onclick="enviarLembreteTodosAvaliadores()">📨 Lembrar todos</button>`;
      }
    }
    cards.push(`<div class="stat-card"><div class="stat-label">Pendentes</div><div class="stat-value" style="color:var(--warn)">${Math.max(0, pendentesMes)}</div>${subPendentes}</div>`);
    cards.push(`<div class="stat-card"><div class="stat-label">Reprovados</div><div class="stat-value" style="color:var(--danger)">${reprovadosMes}</div>${deltaMesHTML(reprovadosMes, reprovadosMesAnteriorLista.length, true)}</div>`);

    // ---------- ALERTA: NOTIFICAR NOTA BAIXA (com "cobrado em") ----------
    if (reprovadosLista.length) {
      alertaNotificar = `
        <div class="card" style="border-left: 3px solid var(--danger); margin-bottom:16px">
          <div class="card-title" style="color:var(--danger)">
            📩 Fornecedores para notificar (Parcial/Reprovado — ${MESES[mesAtual]})
          </div>
          ${reprovadosLista.map(av => {
            const forn = d.fornecedores.find(f => f.id === av.fornecedorId);
            const sit = getSituacao(av.nota);
            const acao = av.notificadoEm
              ? `<span style="margin-left:auto; font-size:11px; color:var(--success); font-weight:600">📨 Cobrado em ${new Date(av.notificadoEm).toLocaleDateString('pt-BR')}</span>`
              : `<button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="abrirNotificacaoAvaliacao('${av.id}')">🔔 Ver / Notificar</button>`;
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
            ${barraSimplesHTML('✅ Aprovado', aprovados, maxSituacao, 'var(--success)')}
            ${barraSimplesHTML('⚠️ Parcial', parciais, maxSituacao, 'var(--warn)')}
            ${barraSimplesHTML('❌ Reprovado', reprovados, maxSituacao, 'var(--danger)')}
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
        const botao = forn && forn.email ? `<button class="btn btn-secondary btn-sm" onclick="enviarCobrancaDocumento('${doc.id}')">✉️ Cobrar</button>` : '<span style="font-size:11px; color:var(--text-muted)">sem e-mail</span>';
        const status = falhouRecente
          ? '<div style="font-size:10px; color:var(--danger); margin-top:2px">❌ envio automático falhou — use o botão</div>'
          : (doc.cobradoEm ? `<div style="font-size:10px; color:var(--success); margin-top:2px">📨 Cobrado em ${new Date(doc.cobradoEm).toLocaleDateString('pt-BR')}</div>` : '');
        const acao = `<div style="margin-left:auto; text-align:right">${botao}${status}</div>`;
        return `<div style="display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid var(--border); font-size:12px">
          <span style="color:${cor}; font-weight:600">${label}</span>
          <span><b>${forn ? forn.nome : '—'}</b> — ${doc.nome}</span>
          <span style="color:var(--text-muted)">válido até ${new Date(doc.validade + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
          ${acao}
        </div>`;
      };
      alertasDoc = `
        <div class="card" style="border-left: 3px solid var(--danger); margin-bottom:16px">
          <div class="card-title" style="color:var(--danger)">
            ⚠️ Documentos de fornecedores que precisam de atenção
            <span style="font-size:11px; font-weight:400; color:var(--text-muted)">${vencidos.length + proximos.length} ocorrência(s)</span>
          </div>
          ${vencidos.map(doc => linhaDoc(doc, 'VENCIDO', 'var(--danger)')).join('')}
          ${proximos.map(doc => linhaDoc(doc, `VENCE EM ${diasParaVencer(doc.validade)}D`, 'var(--warn)')).join('')}
          <div style="margin-top:10px">
            <button class="btn btn-secondary btn-sm" onclick="showAdPage('fornecedores')">Ver fornecedores →</button>
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
          <div class="card-title" style="color:var(--danger)">
            📁 Documentos de "Meus Documentos" que precisam de atenção
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
            <div class="card-title" style="margin-bottom:0">👋 Primeiros passos</div>
            <button class="btn btn-secondary btn-sm" onclick="dispensarOnboarding()">Dispensar</button>
          </div>
          <div style="margin-top:10px">
            ${passos.map(p => `
              <div style="display:flex; align-items:center; gap:8px; padding:6px 0; font-size:13px; ${p.feito ? 'opacity:.5; text-decoration:line-through' : 'cursor:pointer'}" ${p.feito ? '' : `onclick="showAdPage('${p.modulo}', document.querySelector('#sidebar .nav-item[onclick*=\\'${p.modulo}\\']'))"`}>
                <span>${p.feito ? '✅' : '⬜'}</span><span>${p.texto}</span>
              </div>
            `).join('')}
          </div>
        </div>`;
    }
  }

  const semNadaParaMostrar = !statsHTML && !alertaNotificar && !alertasDoc && !alertasDocUnidades && !graficosHTML && !tabelaHTML;

  document.getElementById('ad-page-dashboard').innerHTML = `
    <div class="page-header"><div><h2>Dashboard</h2><p>${MESES[mesAtual]} de ${anoAtual}</p></div></div>
    ${onboardingHTML}
    ${statsHTML}
    ${alertaNotificar}
    ${alertasDoc}
    ${alertasDocUnidades}
    ${graficosHTML}
    ${tabelaHTML}
    ${semNadaParaMostrar ? '<div class="card"><div class="empty-state"><p>Nenhum módulo com dados pra mostrar aqui — os módulos liberados pra você aparecem no menu ao lado.</p></div></div>' : ''}
  `;
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
