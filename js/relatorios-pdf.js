// ============ RELATÓRIO & PDFs ============
// ---------- RELATÓRIO & PDFs ----------
let _ultimosResultadosAd = [];
let _ultimoPeriodoAd = '';
function renderAdRelatorio() {
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();
  document.getElementById('ad-page-relatorio').innerHTML = `
    <div class="page-header"><div><h2>Relatório & PDFs</h2><p>Selecione o período e gere certificados e cartas automaticamente</p></div></div>
    <div class="card">
      <div class="card-title">Período de avaliação</div>
      <div class="form-row three">
        <div class="form-group"><label>Mês inicial</label><select id="rel-mes-ini">${MESES.slice(1).map((m,i)=>`<option value="${i+1}" ${i+1===mesAtual?'selected':''}>${m}</option>`).join('')}</select></div>
        <div class="form-group"><label>Ano inicial</label><input type="number" id="rel-ano-ini" value="${anoAtual}"></div>
        <div></div>
        <div class="form-group"><label>Mês final</label><select id="rel-mes-fim">${MESES.slice(1).map((m,i)=>`<option value="${i+1}" ${i+1===mesAtual?'selected':''}>${m}</option>`).join('')}</select></div>
        <div class="form-group"><label>Ano final</label><input type="number" id="rel-ano-fim" value="${anoAtual}"></div>
      </div>
      <button class="btn btn-primary" onclick="gerarRelatorioAd()">Calcular médias</button>
    </div>
    <div id="relatorio-resultado-ad"></div>
  `;
}

// Avaliação de produto não tem campo "periodo" pronto (tem uma data cheia, tipo
// "2026-07-05") — essa função extrai o "ano-mes" dela pra comparar com o período
// escolhido no relatório, do mesmo jeito que já é feito pras avaliações de serviço.
function periodoDeData(dataStr) {
  if (!dataStr) return null;
  const [ano, mes] = dataStr.split('-');
  return `${parseInt(ano, 10)}-${parseInt(mes, 10)}`;
}

function gerarRelatorioAd() {
  const mesIni = parseInt(document.getElementById('rel-mes-ini').value);
  const anoIni = parseInt(document.getElementById('rel-ano-ini').value);
  const mesFim = parseInt(document.getElementById('rel-mes-fim').value);
  const anoFim = parseInt(document.getElementById('rel-ano-fim').value);
  const d = db();

  if (anoIni > anoFim || (anoIni === anoFim && mesIni > mesFim)) { toast('Período inválido.'); return; }

  const periodos = [];
  let m = mesIni, a = anoIni;
  while (a < anoFim || (a === anoFim && m <= mesFim)) { periodos.push(`${a}-${m}`); m++; if (m > 12) { m = 1; a++; } }

  const resultados = d.fornecedores.map(f => {
    // Fornecedor de Produto: notas vêm da tabela de lançamentos de nota fiscal (avaliacoesProduto).
    if (f.tipo === 'produto') {
      const avsP = d.avaliacoesProduto.filter(av => av.fornecedorId === f.id && periodos.includes(periodoDeData(av.data)));
      if (!avsP.length) return null;
      const media = avsP.reduce((s, av) => s + av.notaGeral, 0) / avsP.length;
      const sit = getSituacao(media);
      return { ...f, media, sit, meses: avsP.length, totalMeses: periodos.length };
    }
    // Fornecedor de Serviço: notas vêm da tabela de avaliações normais.
    const avs = d.avaliacoes.filter(av => av.fornecedorId === f.id && periodos.includes(av.periodo) && !av.semServico);
    if (!avs.length) return null;
    const media = avs.reduce((s, av) => s + av.nota, 0) / avs.length;
    const sit = getSituacao(media);
    return { ...f, media, sit, meses: avs.length, totalMeses: periodos.length };
  }).filter(Boolean);

  const periodoLabel = `${MESES[mesIni]}/${anoIni}` + (mesIni === mesFim && anoIni === anoFim ? '' : ` a ${MESES[mesFim]}/${anoFim}`);
  const wrap = document.getElementById('relatorio-resultado-ad');

  if (!resultados.length) {
    wrap.innerHTML = '<div class="card"><div class="empty-state"><p>Nenhuma avaliação encontrada para fornecedores neste período.</p></div></div>';
    return;
  }

  _ultimosResultadosAd = resultados;
  _ultimoPeriodoAd = periodoLabel;

  wrap.innerHTML = `
    <div class="card">
      <div class="card-title">Resultados — ${periodoLabel}</div>
      <table>
        <thead><tr><th>Fornecedor</th><th>Tipo</th><th style="text-align:center">Média</th><th style="text-align:center">Avaliações</th><th>Situação</th><th style="text-align:right">Ações</th></tr></thead>
        <tbody>
          ${resultados.map(r => `<tr>
            <td style="font-weight:500">${r.nome}</td>
            <td><span class="tag-${r.tipo}">${r.tipo === 'produto' ? 'Produto' : 'Serviço'}</span></td>
            <td style="text-align:center; font-weight:600">${r.media.toFixed(1)}</td>
            <td style="text-align:center; color:var(--text-muted)">${r.meses}/${r.totalMeses}</td>
            <td>${badgeSit(r.sit)}</td>
            <td><div class="actions">
              <button class="btn btn-secondary btn-sm" onclick="baixarPDFIndividual('${r.id}')" title="Gerar apenas o PDF deste fornecedor">📄 PDF</button>
              <button class="btn btn-secondary btn-sm" onclick="enviarCertificadoEmail('${r.id}')" title="Baixa o PDF e abre seu cliente de e-mail">✉️ E-mail</button>
            </div></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="display:flex; justify-content:flex-end; margin-top:18px; gap:10px">
        <button class="btn btn-secondary" onclick='exportarExcelAd(${JSON.stringify(resultados).replace(/'/g,"&apos;")}, "${periodoLabel}")'>Exportar Excel</button>
        <button class="btn btn-success" onclick='gerarPDFsAd(${JSON.stringify(resultados).replace(/'/g,"&apos;")}, "${periodoLabel}")'>📄 Gerar PDFs (ZIP)</button>
      </div>
    </div>
  `;
}

function aplicarTexto(template, fornecedor, nota, periodo, empresa) {
  return template.replace(/{fornecedor}/g, fornecedor).replace(/{nota}/g, nota).replace(/{periodo}/g, periodo).replace(/{empresa}/g, empresa);
}

function getTipoDoc(sit, tipo) {
  if (sit === 'certificado') return tipo === 'produto' ? 'cert-prod' : 'cert-serv';
  if (sit === 'aprovado') return tipo === 'produto' ? 'aprov-prod' : 'aprov-serv';
  if (sit === 'parcial') return 'parcial';
  return 'reprov';
}
function getTituloDoc(sit) { return sit === 'certificado' ? 'CERTIFICADO DE APROVAÇÃO' : 'CARTA DE AVALIAÇÃO'; }
function getSubtituloDoc(sit) {
  if (sit === 'certificado') return 'APROVADO COM NOTA MÁXIMA';
  if (sit === 'aprovado') return 'APROVADO';
  if (sit === 'parcial') return 'PARCIALMENTE APROVADO';
  return 'REPROVADO';
}

function hexParaRGB(hex) {
  const h = (hex || '#000000').replace('#', '');
  return [parseInt(h.substr(0,2),16) || 0, parseInt(h.substr(2,2),16) || 0, parseInt(h.substr(4,2),16) || 0];
}

function gerarPDFDoc(fornecedor, periodo, layoutOverride) {
  const { jsPDF } = window.jspdf;
  const isCert = fornecedor.sit === 'certificado';
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: isCert ? 'landscape' : 'portrait' });
  const d = db();
  const empNome = d.nomeEmpresa || 'Empresa';
  const tipoDoc = getTipoDoc(fornecedor.sit, fornecedor.tipo);
  const corpoTexto = aplicarTexto(d.textos[tipoDoc] || '', fornecedor.nome, fornecedor.media.toFixed(1), periodo, empNome);
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const L = layoutOverride || getLayout()[isCert ? 'cert' : 'carta'];

  const fundo = getFundoConfig(isCert ? 'ap_fundo_certificado' : 'ap_fundo_carta');
  if (fundo) { try { doc.addImage(fundo, 'JPEG', 0, 0, W, H); } catch(e) {} }

  registrarFontesCustomNoPDF(doc);

  const ctx = { fornecedor, nota: fornecedor.media.toFixed(1), periodo, empresaNome: empNome, sit: fornecedor.sit, dadosEmpresa: d.empresa, corpoTexto, isCert };
  // cor dinâmica da "situação" (verde/laranja/vermelho), independe da cor configurada no bloco
  const corSituacao = { aprovado: [0,130,60], parcial: [180,100,0], reprovado: [180,0,0], certificado: [0,130,60] }[fornecedor.sit] || [40,40,40];

  (L.blocos || []).forEach(b => {
    const texto = b.tipo === 'fixo' ? b.conteudo : resolveVariavelValor(b.variavel, ctx);
    if (!texto) return;
    const estilo = (b.negrito && b.italico) ? 'bolditalic' : b.negrito ? 'bold' : b.italico ? 'italic' : 'normal';
    doc.setFont(b.fonte || 'helvetica', estilo);
    doc.setFontSize(b.tamanho);
    doc.setTextColor(...(b.variavel === 'situacao' ? corSituacao : hexParaRGB(b.cor)));
    const linhas = doc.splitTextToSize(texto, b.largura || 160);
    let y = b.y;
    linhas.forEach(linha => { doc.text(linha, b.x, y, { align: b.align, maxWidth: b.largura || 160 }); y += b.tamanho * 0.5 + 1; });
  });

  return doc.output('arraybuffer');
}

async function gerarPDFsAd(resultados, periodo) {
  const btn = event.currentTarget;
  btn.disabled = true; btn.textContent = 'Gerando...';
  try {
    const zip = new JSZip();
    resultados.forEach(r => {
      const pdf = gerarPDFDoc(r, periodo);
      const sit = { certificado: 'Certificado', aprovado: 'Aprovado', parcial: 'Parcialmente_Aprovado', reprovado: 'Reprovado' }[r.sit];
      zip.file(`${sit}_${r.nome.replace(/[^a-zA-Z0-9À-ÿ ]/g,'_')}.pdf`, pdf);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Avaliacao_Fornecedores_${periodo.replace(/\//g,'-')}.zip`;
    a.click(); URL.revokeObjectURL(url);
    addLog('pdfs_gerados', `${currentUser.email} gerou ${resultados.length} documentos para o período ${periodo}`);
    toast('PDFs gerados com sucesso!');
  } catch(e) { toast('Erro ao gerar PDFs: ' + e.message); }
  btn.disabled = false; btn.textContent = '📄 Gerar PDFs (ZIP)';
}

function nomeArquivoDoc(r) {
  const sit = { certificado: 'Certificado', aprovado: 'Aprovado', parcial: 'Parcialmente_Aprovado', reprovado: 'Reprovado' }[r.sit];
  return `${sit}_${r.nome.replace(/[^a-zA-Z0-9À-ÿ ]/g,'_')}.pdf`;
}

function baixarPDFIndividual(fornecedorId) {
  const r = _ultimosResultadosAd.find(x => x.id === fornecedorId);
  if (!r) { toast('Gere o relatório novamente antes de baixar.'); return; }
  const pdf = gerarPDFDoc(r, _ultimoPeriodoAd);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nomeArquivoDoc(r);
  a.click(); URL.revokeObjectURL(url);
  addLog('pdf_individual_gerado', `${currentUser.email} gerou o documento individual de "${r.nome}" (${_ultimoPeriodoAd})`);
  toast('PDF gerado!');
  return r;
}

// Um único e-mail pro fornecedor, listando TODOS os documentos vencidos/
// vencendo dele de uma vez (não é por documento individual como o
// enviarCobrancaDocumento) — mesmo formato de texto usado no envio
// automático, pra ficar consistente.
async function enviarCobrancaConsolidadaFornecedor(fornecedorId) {
  const d = db();
  const forn = d.fornecedores.find(f => f.id === fornecedorId);
  if (!forn) return;
  if (!forn.email) { toast(`"${forn.nome}" não tem e-mail cadastrado. Adicione em Fornecedores › Editar.`); return; }

  const pendentes = d.documentos
    .filter(doc => doc.fornecedorId === fornecedorId)
    .map(doc => {
      const dias = diasParaVencer(doc.validade);
      const aviso = doc.diasAviso ?? DIAS_AVISO_PADRAO;
      const estado = dias < 0 ? 'vencido' : (dias <= aviso ? 'proximo' : null);
      return estado ? { ...doc, dias, estado } : null;
    })
    .filter(Boolean);

  if (!pendentes.length) { toast(`"${forn.nome}" não tem documento vencido ou vencendo no momento.`); return; }

  let linkPortalTexto = '';
  try {
    const { data: linkData } = await supabaseClient.functions.invoke('gerar-link-portal-fornecedor', { body: { fornecedorId } });
    if (linkData && linkData.ok && linkData.link) {
      linkPortalTexto = `\n\nVocê pode enviar os documentos atualizados diretamente por aqui, sem precisar responder este e-mail: ${linkData.link}`;
    }
  } catch (e) { /* segue sem o link */ }

  const linhas = pendentes.map(doc => {
    const dataFmt = new Date(doc.validade + 'T00:00:00').toLocaleDateString('pt-BR');
    return doc.estado === 'vencido'
      ? `- ${doc.nome}: VENCIDO desde ${dataFmt} (${Math.abs(doc.dias)} dia(s))`
      : `- ${doc.nome}: vence em ${doc.dias} dia(s), no dia ${dataFmt}`;
  }).join('\n');

  const temVencido = pendentes.some(doc => doc.estado === 'vencido');
  const empNome = d.nomeEmpresa || 'Empresa';
  const assunto = temVencido ? `Documentos pendentes — ${forn.nome}` : `Documentos vencendo em breve — ${forn.nome}`;
  const corpo = `Olá,\n\nSegue a situação dos documentos cadastrados referente à sua empresa:\n\n${linhas}\n\nSolicitamos o envio das versões atualizadas com a maior brevidade possível, para mantermos seu cadastro regularizado.${linkPortalTexto}\n\nAtenciosamente,\n${empNome}`;

  const link = `mailto:${encodeURIComponent(forn.email)}?cc=${encodeURIComponent(emailAdminMaster(d))}&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  addLog('cobranca_consolidada_enviada', `${currentUser.email} enviou cobrança consolidada (${pendentes.length} documento(s)) para "${forn.nome}"`);
  window.location.href = link;

  const agora = new Date().toISOString();
  pendentes.forEach(doc => {
    supabaseClient.from('documentos').update({ cobrado_em: agora }).eq('id', doc.id)
      .then(({ error }) => { if (!error) doc.cobradoEm = agora; });
  });
}

// E-mail do Admin+ da empresa, pra entrar em cópia nos e-mails de cobrança/
// notificação — assim ele tem prova de que o envio realmente aconteceu.
function emailAdminMaster(d) {
  const master = d.usuarios.find(u => u.papel === 'admin_master');
  return master ? master.email : '';
}

function enviarCertificadoEmail(fornecedorId) {
  const r = _ultimosResultadosAd.find(x => x.id === fornecedorId);
  if (!r) { toast('Gere o relatório novamente antes de enviar.'); return; }
  if (!r.email) { toast(`"${r.nome}" não tem e-mail cadastrado. Adicione em Fornecedores › Editar.`); return; }
  baixarPDFIndividual(fornecedorId);
  const d = db();
  const empNome = d.nomeEmpresa || 'Empresa';
  const titulo = getTituloDoc(r.sit);
  const assunto = `${titulo} — ${r.nome} (${_ultimoPeriodoAd})`;
  const corpo = `Olá,\n\nSegue referente à avaliação de fornecedores do período ${_ultimoPeriodoAd}: ${titulo.toLowerCase()}.\n\nO arquivo PDF foi baixado automaticamente nesta página (${nomeArquivoDoc(r)}) — por favor, anexe-o a este e-mail antes de enviar.\n\nAtenciosamente,\n${empNome}`;
  const link = `mailto:${encodeURIComponent(r.email)}?cc=${encodeURIComponent(emailAdminMaster(d))}&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  addLog('email_certificado_enviado', `${currentUser.email} abriu o cliente de e-mail para enviar o documento de "${r.nome}"`);
  setTimeout(() => { window.location.href = link; }, 350);
}

// Modal de revisão antes de notificar: mostra a mesma visão de "verDetalheAvaliacao"
// (critérios, nota, justificativa) + um botão para notificar por e-mail — quem decide
// se notifica ou não é o setor, ao ver esse resumo.
function abrirNotificacaoAvaliacao(avId) {
  const d = db();
  const av = d.avaliacoes.find(a => a.id === avId);
  if (!av) return;
  const form = d.formularios.find(f => f.id === av.formularioId);
  const forn = d.fornecedores.find(f => f.id === av.fornecedorId);
  const sit = av.semServico ? null : getSituacao(av.nota);

  openModal(`
    <h3>${form ? form.nome : 'Avaliação'}</h3>
    <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">${forn ? forn.nome + ' · ' : ''}${av.periodo}</p>
    <div style="margin-bottom:14px">${av.semServico ? '<span class="badge badge-neutral">Sem serviço no mês</span>' : badgeSit(sit)} <b style="margin-left:8px; font-size:15px">${av.semServico ? '' : av.nota.toFixed(1)}</b></div>
    ${(form ? form.criterios : []).map(c => linhaCriterioHTML(c, av.respostas[c.id])).join('')}
    ${av.justificativa ? `<div style="margin-top:12px; padding:10px; background:var(--danger-bg); border-radius:8px; font-size:12px; color:var(--danger)"><b>Melhoria esperada:</b> ${av.justificativa}</div>` : ''}
    ${av.obs ? `<div style="margin-top:8px; font-size:12px; color:var(--text-sec)"><b>Observações:</b> ${av.obs}</div>` : ''}
    ${!forn || !forn.email ? `<p style="margin-top:12px; font-size:12px; color:var(--danger)">Fornecedor sem e-mail cadastrado — não é possível notificar.</p>` : ''}
    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px">
      <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
      <button class="btn btn-primary" ${!forn || !forn.email ? 'disabled' : ''} onclick="notificarFornecedorNota('${av.id}')">✉️ Notificar por e-mail</button>
    </div>
  `);
}

function saudacaoPorHorario() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Notifica por e-mail com o conteúdo da avaliação ESCRITO no corpo (sem gerar/anexar PDF) —
// o fornecedor lê os critérios direto no e-mail, como se fosse o formulário em texto.
// Mostra a régua completa de cada critério (todas as opções, marcando a escolhida) e sugere
// automaticamente qual seria a melhor opção em cada critério abaixo do máximo — além da
// "Melhoria esperada" (justificativa) e "Observações" que o setor já preenche no formulário.
function notificarFornecedorNota(avId) {
  const d = db();
  const av = d.avaliacoes.find(a => a.id === avId);
  if (!av) return;
  const forn = d.fornecedores.find(f => f.id === av.fornecedorId);
  if (!forn) return;
  if (!forn.email) { toast(`"${forn.nome}" não tem e-mail cadastrado. Adicione em Fornecedores › Editar.`); return; }
  const form = d.formularios.find(f => f.id === av.formularioId);
  const [ano, mes] = av.periodo.split('-');
  const periodoLabel = `${MESES[parseInt(mes)]}/${ano}`;
  const sit = getSituacao(av.nota);
  const empNome = d.nomeEmpresa || 'Empresa';
  const saudacao = saudacaoPorHorario();

  const blocosCriterios = [];
  const melhoriasAuto = [];
  let numero = 1;
  (form ? form.criterios : []).forEach(c => {
    const r = av.respostas[c.id];
    if (!r || r.naoHouve) return;
    const escolhida = c.opcoes[r.opcaoIndex];
    if (!escolhida) return;
    const regua = c.opcoes.map((o, i) => `   - ${o.label} — ${o.pontos.toFixed(1)}P${i === r.opcaoIndex ? ' (Sua nota)' : ''}`).join('\n');
    blocosCriterios.push(`${numero}. ${c.nome} (Sua nota: ${escolhida.pontos.toFixed(1)} de ${c.pesoMax.toFixed(1)}P)\nStatus: ${escolhida.label}.\nRégua do critério:\n${regua}`);
    const melhorOpcao = c.opcoes.reduce((best, o) => o.pontos > best.pontos ? o : best, c.opcoes[0]);
    if (melhorOpcao.pontos > escolhida.pontos) melhoriasAuto.push(`${c.nome}: buscar atingir "${melhorOpcao.label}".`);
    numero++;
  });

  const notaMax = form ? form.criterios.reduce((s, c) => s + c.pesoMax, 0) : null;
  const tipoLabel = form ? (form.tipo === 'produto' ? 'Produto' : 'Serviço') : '';
  const setorInfo = form ? `- Setor Avaliador: ${form.setor} · ${tipoLabel} (${form.nome})\n` : '';
  const secaoMelhoriaAuto = melhoriasAuto.length ? `\n📉 Melhoria Esperada para os Próximos Períodos:\n${melhoriasAuto.map(m => `- ${m}`).join('\n')}\n` : '';

  const assunto = `Avaliação de Desempenho de Fornecedores - ${periodoLabel} - ${forn.nome}`;
  let corpo = `${saudacao},\nInformamos que foi concluída a avaliação de desempenho referente ao período de ${periodoLabel}.\n\n${setorInfo}- Nota Obtida: ${av.nota.toFixed(1)}${notaMax ? ` de ${notaMax.toFixed(1)}P` : ''} (${getSubtituloDoc(sit)})\n\n`;
  if (blocosCriterios.length) corpo += `Para sua ciência, detalhamos abaixo os critérios avaliados, a pontuação que sua empresa obteve e a nossa régua completa de avaliação:\n\n${blocosCriterios.join('\n\n')}\n${secaoMelhoriaAuto}`;
  if (av.justificativa) corpo += `\nOutras melhorias apontadas pelo setor avaliador:\n${av.justificativa}\n`;
  if (av.obs) corpo += `\nObservações:\n${av.obs}\n`;
  corpo += `\nApresentamos esses dados para que sua equipe possa analisar os pontos de melhoria e alinhar os processos internos. Permanecemos à disposição para esclarecer dúvidas e apoiar no que for necessário para buscarmos juntos a evolução dessa nota.\n\nAtenciosamente,\n${empNome}`;

  const link = `mailto:${encodeURIComponent(forn.email)}?cc=${encodeURIComponent(emailAdminMaster(d))}&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  addLog('notificacao_nota_enviada', `${currentUser.email} notificou "${forn.nome}" sobre a nota do período ${periodoLabel}`);
  closeModal();
  window.location.href = link;

  // Grava quando foi notificado — assim o alerta do dashboard mostra
  // "Cobrado em DD/MM" em vez de ficar pedindo ação pra sempre. Não trava a
  // navegação: dispara depois do mailto, sem "await" no fluxo principal.
  supabaseClient.from('avaliacoes').update({ notificado_em: new Date().toISOString() }).eq('id', av.id)
    .then(({ error }) => { if (!error) { av.notificadoEm = new Date().toISOString(); } });
}

async function enviarCobrancaDocumento(docId) {
  const d = db();
  const doc = d.documentos.find(x => x.id === docId);
  if (!doc) return;
  const forn = d.fornecedores.find(f => f.id === doc.fornecedorId);
  if (!forn) return;
  if (!forn.email) { toast(`"${forn.nome}" não tem e-mail cadastrado. Adicione em Fornecedores › Editar.`); return; }

  const diasReais = diasParaVencer(doc.validade); // negativo = já venceu, positivo = ainda vai vencer
  const dataFmt = new Date(doc.validade + 'T00:00:00').toLocaleDateString('pt-BR');
  const empNome = d.nomeEmpresa || 'Empresa';
  const jaVencido = diasReais < 0;

  // Gera (ou renova) o link do portal na hora, pra já ir junto no e-mail.
  // Se der qualquer problema aqui, segue sem o link — não trava a cobrança.
  let linkPortalTexto = '';
  try {
    const { data: linkData } = await supabaseClient.functions.invoke('gerar-link-portal-fornecedor', { body: { fornecedorId: forn.id } });
    if (linkData && linkData.ok && linkData.link) {
      linkPortalTexto = `\n\nVocê pode enviar o documento atualizado diretamente por aqui, sem precisar responder este e-mail: ${linkData.link}`;
    }
  } catch (e) { /* segue sem o link */ }

  const assunto = jaVencido
    ? `Documento vencido — ${doc.nome} — ${forn.nome}`
    : `Documento vence em breve — ${doc.nome} — ${forn.nome}`;

  const corpo = jaVencido
    ? `Olá,\n\nIdentificamos que o documento "${doc.nome}" referente ao cadastro de fornecedores está vencido desde ${dataFmt} (${Math.abs(diasReais)} dia(s)).\n\nSolicitamos o envio da versão atualizada com a maior brevidade possível, para mantermos seu cadastro regularizado.${linkPortalTexto}\n\nAtenciosamente,\n${empNome}`
    : `Olá,\n\nO documento "${doc.nome}" referente ao cadastro de fornecedores vence em ${diasReais} dia(s), no dia ${dataFmt}.\n\nPedimos que providencie a versão atualizada com antecedência, para mantermos seu cadastro regularizado sem interrupção.${linkPortalTexto}\n\nAtenciosamente,\n${empNome}`;

  const link = `mailto:${encodeURIComponent(forn.email)}?cc=${encodeURIComponent(emailAdminMaster(d))}&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  addLog('cobranca_enviada', `${currentUser.email} enviou ${jaVencido ? 'cobrança' : 'aviso de vencimento próximo'} do documento "${doc.nome}" para "${forn.nome}"`);
  window.location.href = link;

  supabaseClient.from('documentos').update({ cobrado_em: new Date().toISOString() }).eq('id', doc.id)
    .then(({ error }) => { if (!error) { doc.cobradoEm = new Date().toISOString(); } });
}

function exportarExcelAd(resultados, periodo) {
  const linhas = [['Nome', 'Tipo', 'Média', 'Situação']];
  resultados.forEach(r => linhas.push([r.nome, r.tipo === 'produto' ? 'Produto' : 'Serviço', r.media.toFixed(1), getSubtituloDoc(r.sit)]));
  const csv = linhas.map(l => l.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `Fornecedores_${periodo.replace(/\//g,'-')}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast('Planilha exportada!');
}

// ---------- CONFIG ----------
