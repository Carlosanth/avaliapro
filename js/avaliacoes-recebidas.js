// ============ AVALIAÇÕES RECEBIDAS ============
let _abaAvaliacoesAdAtual = 'todas';

function renderAdAvaliacoes() {
  document.getElementById('ad-page-avaliacoes').innerHTML = `
    <div class="page-header"><div><h2>Avaliações recebidas</h2><p>Todas as avaliações enviadas pelos setores, com trava de edição</p></div></div>
    <div class="tab-bar">
      <button class="tab ${_abaAvaliacoesAdAtual === 'todas' ? 'active' : ''}" onclick="mudarAbaAvaliacoesAd('todas', this)">Todas</button>
      <button class="tab ${_abaAvaliacoesAdAtual === 'retencao' ? 'active' : ''}" onclick="mudarAbaAvaliacoesAd('retencao', this)">Retenção</button>
    </div>
    <div id="avaliacoes-ad-conteudo"></div>
  `;
  renderConteudoAvaliacoesAd();
}

function mudarAbaAvaliacoesAd(aba, btn) {
  _abaAvaliacoesAdAtual = aba;
  document.querySelectorAll('#ad-page-avaliacoes .tab-bar .tab').forEach(el => el.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderConteudoAvaliacoesAd();
}

function renderConteudoAvaliacoesAd() {
  const d = db();
  const wrap = document.getElementById('avaliacoes-ad-conteudo');
  if (_abaAvaliacoesAdAtual === 'todas') {
    wrap.innerHTML = `<div class="card">${renderAvaliacoesTableComAcoes(d.avaliacoes.slice().sort((a,b) => new Date(b.enviadoEm) - new Date(a.enviadoEm)), d)}</div>`;
    return;
  }
  renderAvaliacoesRetencao();
}

function renderAvaliacoesRetencao() {
  const d = db();
  const wrap = document.getElementById('avaliacoes-ad-conteudo');

  if (!d.anosRetencaoAvaliacao) {
    wrap.innerHTML = `<div class="card"><div class="empty-state"><p>Retenção desligada — nenhuma avaliação é sinalizada pra exclusão. Configure um prazo em <b>Configurações → Retenção de dados</b> se quiser usar isso.</p></div></div>`;
    return;
  }

  const limite = new Date();
  limite.setFullYear(limite.getFullYear() - d.anosRetencaoAvaliacao);

  const elegiveis = d.avaliacoes
    .filter(av => new Date(av.enviadoEm) < limite)
    .sort((a, b) => new Date(a.enviadoEm) - new Date(b.enviadoEm));

  if (!elegiveis.length) {
    wrap.innerHTML = `<div class="card"><div class="empty-state"><p>Nenhuma avaliação passou do prazo de ${d.anosRetencaoAvaliacao} ano(s) configurado ainda.</p></div></div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="card" style="margin-bottom:14px">
      <p style="font-size:12px; color:var(--text-muted)">Avaliações enviadas há mais de ${d.anosRetencaoAvaliacao} ano(s) (limite: ${fmtDataSimples(limite.toISOString().slice(0,10))}). Nada aqui é apagado sozinho — a ação é sua.</p>
    </div>
    <div class="card">
      <table>
        <thead><tr><th>Formulário</th><th>Fornecedor</th><th>Enviado em</th><th style="text-align:center">Anexo</th><th></th></tr></thead>
        <tbody>
          ${elegiveis.map(av => {
            const form = d.formularios.find(f => f.id === av.formularioId);
            const forn = d.fornecedores.find(f => f.id === av.fornecedorId);
            const temAnexo = av.anexos && av.anexos.some(a => a.caminhoStorage);
            return `<tr>
              <td style="font-weight:500">${form ? form.nome : '—'}</td>
              <td>${forn ? forn.nome : '—'}</td>
              <td style="color:var(--text-sec); font-size:12px">${fmtData(av.enviadoEm)}</td>
              <td style="text-align:center">${temAnexo ? '📎 Sim' : '—'}</td>
              <td><div class="actions">
                <button class="btn btn-secondary btn-sm" onclick="verDetalheAvaliacao('${av.id}')">Ver</button>
                ${temAnexo ? `<button class="btn btn-secondary btn-sm" onclick="removerAnexosAvaliacaoRetencao('${av.id}')">Remover anexo</button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="excluirAvaliacaoRetencao('${av.id}')">Excluir avaliação</button>
              </div></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function removerAnexosAvaliacaoRetencao(id) {
  const d = db();
  const av = d.avaliacoes.find(a => a.id === id);
  if (!av) return;
  if (!confirm('Remover o(s) arquivo(s) anexado(s) dessa avaliação? Isso NÃO pode ser desfeito — o registro da avaliação (nota, situação, respostas) continua intacto, só o arquivo em si é apagado.')) return;

  for (const a of av.anexos) {
    if (a.caminhoStorage) {
      const { error: storageErr } = await supabaseClient.storage.from('anexos-avaliacoes').remove([a.caminhoStorage]);
      if (storageErr) { toast('Erro ao remover anexo: ' + storageErr.message); return; }
    }
  }

  const anexosSemArquivo = av.anexos.map(a => ({ nome: a.nome, tamanho: a.tamanho, caminhoStorage: null }));
  const { error } = await supabaseClient.from('avaliacoes').update({ anexos: anexosSemArquivo }).eq('id', id);
  if (error) { toast('Erro ao atualizar avaliação: ' + error.message); return; }

  addLog('anexo_avaliacao_removido_retencao', `${currentUser.email} removeu o(s) anexo(s) da avaliação de "${av.enviadoPor}" por retenção de dados`);
  await carregarAvaliacoes();
  renderAvaliacoesRetencao();
  toast('Anexo(s) removido(s). O registro da avaliação continua no histórico.');
}

async function excluirAvaliacaoRetencao(id) {
  const d = db();
  const av = d.avaliacoes.find(a => a.id === id);
  if (!av) return;
  if (!confirm('Excluir essa avaliação PERMANENTEMENTE? Isso apaga o registro inteiro (nota, situação, respostas) e não pode ser desfeito. Essa ação também remove o histórico dela do relatório.')) return;

  for (const a of (av.anexos || [])) {
    if (a.caminhoStorage) {
      await supabaseClient.storage.from('anexos-avaliacoes').remove([a.caminhoStorage]);
    }
  }

  const { error } = await supabaseClient.from('avaliacoes').delete().eq('id', id);
  if (error) { toast('Erro ao excluir avaliação: ' + error.message); return; }

  addLog('avaliacao_excluida_retencao', `${currentUser.email} excluiu permanentemente uma avaliação por retenção de dados (enviada por ${av.enviadoPor})`);
  await carregarAvaliacoes();
  renderAvaliacoesRetencao();
  toast('Avaliação excluída permanentemente.');
}

function renderAvaliacoesTableComAcoes(lista, d) {
  if (!lista.length) return '<div class="empty-state"><p>Nenhuma avaliação registrada ainda.</p></div>';
  return `<table>
    <thead><tr><th>Formulário</th><th>Fornecedor</th><th>Enviado por</th><th style="text-align:center">Nota</th><th>Situação</th><th>Trava</th><th></th></tr></thead>
    <tbody>
      ${lista.map(av => {
        const form = d.formularios.find(f => f.id === av.formularioId);
        const forn = d.fornecedores.find(f => f.id === av.fornecedorId);
        const sit = av.semServico ? null : getSituacao(av.nota);
        return `<tr>
          <td style="font-weight:500">${form ? form.nome : '—'}</td>
          <td>${forn ? forn.nome : '—'}</td>
          <td style="color:var(--text-sec); font-size:12px">${av.enviadoPor}</td>
          <td style="text-align:center; font-weight:600">${av.semServico ? '—' : av.nota.toFixed(1)}</td>
          <td>${av.semServico ? '<span class="badge badge-neutral">Sem serviço</span>' : badgeSit(sit)}</td>
          <td>${av.liberadoEdicao ? '<span class="badge badge-warn">Liberada</span>' : '<span class="badge badge-neutral">Travada</span>'}</td>
          <td><div class="actions">
            <button class="btn btn-secondary btn-sm" onclick="verDetalheAvaliacao('${av.id}')">Ver</button>
            ${!av.semServico && (sit === 'reprovado' || sit === 'parcial') ? `<button class="btn btn-secondary btn-sm" onclick="abrirNotificacaoAvaliacao('${av.id}')" title="Ver e notificar por e-mail">🔔</button>` : ''}
            ${!av.liberadoEdicao ? `<button class="btn btn-secondary btn-sm" onclick="liberarEdicao('${av.id}')">Liberar edição</button>` : ''}
          </div></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

// Linha de um critério com pontuação obtida/máxima visível — pra deixar claro
// pro fornecedor como a nota foi calculada, não só qual opção foi marcada.
function linhaCriterioHTML(c, r) {
  const naoHouve = r && r.naoHouve;
  const opcaoEscolhidaIndex = (r && !naoHouve) ? r.opcaoIndex : null;

  const opcoesHtml = c.opcoes.map((o, i) => {
    const escolhida = i === opcaoEscolhidaIndex;
    return `<div style="display:flex; justify-content:space-between; gap:8px; padding:4px 8px; border-radius:6px; font-size:12px; ${escolhida ? 'background:var(--accent-bg); border:1px solid var(--accent-border); font-weight:600; color:var(--accent)' : 'color:var(--text-muted)'}">
      <span>${escolhida ? '● ' : '○ '}${o.label}</span>
      <span>${o.pontos.toFixed(1)}P</span>
    </div>`;
  }).join('');

  const naoHouveHtml = `<div style="display:flex; justify-content:space-between; gap:8px; padding:4px 8px; border-radius:6px; font-size:12px; margin-top:2px; ${naoHouve ? 'background:var(--accent-bg); border:1px solid var(--accent-border); font-weight:600; color:var(--accent)' : 'color:var(--text-muted)'}">
    <span>${naoHouve ? '● ' : '○ '}Não houve serviço no mês</span>
    <span>desconsiderado</span>
  </div>`;

  return `<div style="padding:8px 0; border-bottom:1px solid var(--border)">
    <div style="font-size:12px; font-weight:600; margin-bottom:5px">${c.nome} <span style="font-weight:400; color:var(--text-muted)">(até ${c.pesoMax.toFixed(1)}P)</span></div>
    <div style="display:flex; flex-direction:column; gap:2px">${opcoesHtml}${naoHouveHtml}</div>
  </div>`;
}

function verDetalheAvaliacao(id) {
  const d = db();
  const av = d.avaliacoes.find(a => a.id === id);
  const form = d.formularios.find(f => f.id === av.formularioId);
  const forn = d.fornecedores.find(f => f.id === av.fornecedorId);
  const sit = av.semServico ? null : getSituacao(av.nota);
  const [ano, mes] = av.periodo.split('-');
  const camposLinha = (form && form.camposExtras && form.camposExtras.length)
    ? form.camposExtras.filter(c => c.valor).map(c => `<span><b style="font-weight:600">${c.label}:</b> ${c.valor}</span>`).join(' &nbsp;·&nbsp; ')
    : '';

  openModal(`
    <h3>${form ? form.nome : 'Avaliação'}</h3>
    <p style="font-size:12px; color:var(--text-muted); margin-bottom:4px">${forn ? forn.nome + ' · ' : ''}${MESES[parseInt(mes)]} de ${ano}</p>
    <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Enviado por ${av.enviadoPor} em ${fmtData(av.enviadoEm)}</p>
    ${camposLinha ? `<div style="padding:10px 14px; background:var(--surface2); border-radius:8px; margin-bottom:14px; font-size:12px; color:var(--text-sec); display:flex; flex-wrap:wrap; gap:12px">${camposLinha}</div>` : ''}
    <div style="margin-bottom:14px">${av.semServico ? '<span class="badge badge-neutral">Sem serviço no mês</span>' : badgeSit(sit)} <b style="margin-left:8px; font-size:15px">${av.semServico ? '' : av.nota.toFixed(1)}</b></div>
    ${form ? form.criterios.map(c => linhaCriterioHTML(c, av.respostas[c.id])).join('') : ''}
    ${av.justificativa ? `<div style="margin-top:12px; padding:10px; background:var(--danger-bg); border-radius:8px; font-size:12px; color:var(--danger)"><b>Melhoria esperada:</b> ${av.justificativa}</div>` : ''}
    ${av.obs ? `<div style="margin-top:8px; font-size:12px; color:var(--text-sec)"><b>Observações:</b> ${av.obs}</div>` : ''}
    ${av.anexos && av.anexos.length ? `<div style="margin-top:10px"><b style="font-size:12px">Anexos:</b>${av.anexos.map(a => `<div class="anexo-item">📎 ${a.caminhoStorage ? `<a href="#" onclick="event.preventDefault(); baixarAnexoAvaliacao('${a.caminhoStorage}', '${a.nome}')">${a.nome}</a>` : a.nome} <span style="color:var(--text-muted)">${a.tamanho}</span></div>`).join('')}</div>` : ''}
    <div class="no-print" style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px">
      <button class="btn btn-secondary" onclick="window.print()">🖨️ Imprimir</button>
      <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
    </div>
  `);
}

function liberarEdicao(id) {
  openModal(`
    <h3>Liberar edição</h3>
    <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Informe o motivo da liberação. Isso fica registrado no log de auditoria.</p>
    <div class="form-group" style="margin-bottom:14px">
      <label>Motivo</label>
      <textarea id="motivo-liberacao" rows="3" placeholder="Ex: erro de digitação identificado pelo setor"></textarea>
    </div>
    <div style="display:flex; gap:8px; justify-content:flex-end">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="confirmarLiberacao('${id}')">Liberar edição</button>
    </div>
  `);
}

async function confirmarLiberacao(id) {
  const motivo = document.getElementById('motivo-liberacao').value.trim();
  if (!motivo) { toast('Informe o motivo da liberação.'); return; }
  const d = db();
  const av = d.avaliacoes.find(a => a.id === id);
  if (!av) return;

  const { error } = await supabaseClient
    .from('avaliacoes')
    .update({ liberado_edicao: true, bloqueada: false })
    .eq('id', id);

  if (error) { toast('Erro ao liberar edição: ' + error.message); return; }

  addLog('edicao_liberada', `${currentUser.email} liberou edição da avaliação enviada por ${av.enviadoPor} — motivo: ${motivo}`);
  closeModal();
  await carregarAvaliacoes();
  renderAdAvaliacoes();
  toast('Edição liberada. O setor já pode reenviar.');
}

