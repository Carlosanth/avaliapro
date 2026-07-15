// ============ MEUS DOCUMENTOS (unidades da própria empresa) ============
// Mesma lógica de arquivo de documento do módulo Fornecedores (validade,
// aviso de vencimento customizável, upload), só que pra guardar documentação
// da própria empresa (ex: alvará de uma unidade/filial) — não é fornecedor.

// Mesma lógica de contarDocumentosVencendo (fornecedores.js), só que pros
// documentos de unidades — usado pelo alerta do Dashboard.
function contarUnidadesDocumentosVencendo(d) {
  const vencidos = [], proximos = [];
  d.unidadesDocumentos.forEach(doc => {
    const dias = diasParaVencer(doc.validade);
    const aviso = doc.diasAviso ?? DIAS_AVISO_PADRAO;
    if (dias < 0) vencidos.push(doc);
    else if (dias <= aviso) proximos.push(doc);
  });
  return { vencidos, proximos };
}

async function buscarDadosPorCnpjUnidade() {
  const cnpjInput = document.getElementById('un-cnpj');
  const nomeInput = document.getElementById('un-nome');
  const enderecoInput = document.getElementById('un-endereco');
  const telefoneInput = document.getElementById('un-telefone');
  const statusEl = document.getElementById('un-cnpj-status');
  const cnpjLimpo = cnpjInput.value.replace(/\D/g, '');

  if (cnpjLimpo.length !== 14) { toast('CNPJ inválido — precisa ter 14 dígitos.'); return; }

  const d = db();
  const existente = d.unidades.find(u => (u.cnpj || '').replace(/\D/g, '') === cnpjLimpo);
  let avisoDuplicado = '';
  if (existente) {
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

function renderAdMeusDocumentos() {
  const d = db();
  const unidadesAtivas = d.unidades.filter(u => u.ativo !== false);

  document.getElementById('ad-page-meusdocumentos').innerHTML = `
    <div class="page-header"><div><h2>Meus Documentos</h2><p>Cadastre as documentações de ${d.nomeEmpresa || 'sua empresa'} (alvará, contrato social etc)</p></div></div>
    <div class="card">
      <div class="card-title">Nova unidade</div>
      <div class="form-row three">
        <div class="form-group">
          <label>CNPJ <span style="color:var(--text-muted); font-weight:400">(opcional)</span></label>
          <div style="display:flex; gap:6px">
            <input type="text" id="un-cnpj" placeholder="00.000.000/0000-00" style="flex:1" oninput="this.value = formatarCNPJ(this.value)">
            <button type="button" class="btn btn-secondary btn-sm" onclick="buscarDadosPorCnpjUnidade()" style="display:inline-flex; align-items:center; gap:6px">${ic('search', 13)} Buscar</button>
          </div>
          <p id="un-cnpj-status" style="font-size:11px; margin-top:4px"></p>
        </div>
        <div class="form-group"><label>Nome</label><input type="text" id="un-nome" placeholder="Ex: Unidade São Paulo"></div>
        <div class="form-group"><label>Telefone <span style="color:var(--text-muted); font-weight:400">(opcional)</span></label><input type="text" id="un-telefone" placeholder="(00) 00000-0000" oninput="this.value = formatarTelefone(this.value)"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Endereço <span style="color:var(--text-muted); font-weight:400">(opcional)</span></label><input type="text" id="un-endereco" placeholder="Rua, número, cidade/UF"></div>
      </div>
      <button class="btn btn-primary" onclick="addUnidade()">Adicionar unidade</button>
    </div>
    <div class="card">
      <div class="card-title">Unidades cadastradas (${unidadesAtivas.length})</div>
      <div id="unidades-lista-ad"></div>
    </div>
  `;
  renderUnidadesListaAd();
}

function renderUnidadesListaAd() {
  const d = db();
  const wrap = document.getElementById('unidades-lista-ad');
  const lista = d.unidades.filter(u => u.ativo !== false);

  if (!lista.length) {
    wrap.innerHTML = '<div class="empty-state"><p>Nenhuma unidade cadastrada ainda.</p></div>';
    return;
  }

  wrap.innerHTML = lista.map(u => {
    const docs = d.unidadesDocumentos.filter(doc => doc.unidadeId === u.id);
    const piorStatus = docs.reduce((acc, doc) => {
      const dias = diasParaVencer(doc.validade);
      const aviso = doc.diasAviso ?? DIAS_AVISO_PADRAO;
      if (dias < 0) return 'vencido';
      if (dias <= aviso && acc !== 'vencido') return 'proximo';
      return acc;
    }, 'ok');
    const dotCor = piorStatus === 'vencido' ? 'var(--danger)' : piorStatus === 'proximo' ? 'var(--warn)' : 'var(--success)';
    const classeDoc = piorStatus === 'vencido' ? 'sup-badge-doc-danger' : piorStatus === 'proximo' ? 'sup-badge-doc-warn' : docs.length ? 'sup-badge-doc-ok' : 'sup-badge-doc-none';

    return `
    <div id="unidade-row-${u.id}" class="sup-row-wrap">
      <div class="sup-row clickable" onclick="toggleUnidadeDocsList('${u.id}')">
        <div style="display:flex; gap:10px; flex:1; min-width:0">
          <span class="sup-status-dot" style="background:${dotCor}"></span>
          <div style="flex:1; min-width:0">
            <div class="sup-name-line"><span class="sup-name" title="${u.nome}">${truncarNomeForn(u.nome)}</span></div>
            <div class="sup-meta">
              ${u.endereco ? metaItemHTML(ic('pin', 12.5), u.endereco) : ''}
              ${u.telefone ? metaItemHTML(ic('phone', 12.5), u.telefone) : ''}
              ${u.cnpj ? metaItemHTML(ic('building', 12.5), u.cnpj, true) : ''}
              ${badgeHTML(`${ic('folder', 11)} ${pluralDocs(docs.length)}`, classeDoc)}
            </div>
          </div>
        </div>
        <div class="sup-actions" onclick="event.stopPropagation()">
          <button class="sup-btn-solid" onclick="toggleUnidadeDocsForm('${u.id}')">Novo Documento</button>
          <div class="sup-dropdown-wrap">
            <button class="sup-more-btn" onclick="toggleMenuUnidade('${u.id}', event)" title="Mais opções">${ic('moreVertical', 17)}</button>
            <div class="sup-dropdown" id="menu-unidade-${u.id}">
              <button onclick="abrirEdicaoUnidade('${u.id}')">${ic('pencil', 14)} Editar</button>
              <button onclick="excluirUnidade('${u.id}')" class="sup-dropdown-danger">${ic('trash', 14)} Excluir</button>
            </div>
          </div>
        </div>
        <span class="sup-chevron-ind">${ic('chevronDown', 15)}</span>
      </div>
      <div id="udocs-wrap-${u.id}" style="display:none; padding:0 10px 16px 27px">
        <div id="udoc-form-${u.id}" class="card" style="display:none; margin-bottom:10px; background:var(--surface2)">
          <p style="font-size:12px; font-weight:600; margin-bottom:10px">Novo documento</p>
          <div class="form-row three">
            <div class="form-group"><label>Nome do documento</label><input type="text" id="udoc-nome-${u.id}" placeholder="Ex: Alvará de funcionamento"></div>
            <div class="form-group"><label>Validade</label><input type="date" id="udoc-validade-${u.id}"></div>
            <div class="form-group"><label>Avisar com quantos dias <span style="color:var(--text-muted); font-weight:400">(padrão 30)</span></label><input type="number" min="0" id="udoc-dias-aviso-${u.id}" placeholder="30"></div>
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label>Observação <span style="color:var(--text-muted); font-weight:400">(opcional)</span></label>
            <input type="text" id="udoc-obs-${u.id}" placeholder="opcional">
          </div>
          <div style="display:flex; align-items:flex-end; gap:10px; margin-bottom:2px">
            <div class="form-group" style="flex:1; margin-bottom:0">
              <label style="font-size:12px; font-weight:500; color:var(--text-sec)">Arquivo (PDF ou imagem — opcional)</label>
              <div class="file-drop" onclick="document.getElementById('udoc-file-${u.id}').click()" style="padding:10px; cursor:pointer">
                <input type="file" id="udoc-file-${u.id}" accept=".pdf,.png,.jpg,.jpeg" style="display:none" onchange="previewUnidadeDocFile('${u.id}', this)">
                <p id="udoc-file-label-${u.id}" style="font-size:12px; color:var(--text-muted); display:flex; align-items:center; gap:6px; margin:0">${ic('paperclip', 13)} Clique para selecionar arquivo</p>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" style="flex-shrink:0" onclick="addUnidadeDocumento('${u.id}')">Adicionar documento</button>
          </div>
        </div>
        <div id="udocs-lista-${u.id}"></div>
      </div>
    </div>`;
  }).join('');

  lista.forEach(u => renderUnidadeDocsLista(u.id));
}

function toggleMenuUnidade(id, event) {
  event.stopPropagation();
  const menu = document.getElementById('menu-unidade-' + id);
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

function toggleUnidadeDocsList(id) {
  const el = document.getElementById('udocs-wrap-' + id);
  const row = document.getElementById('unidade-row-' + id);
  const form = document.getElementById('udoc-form-' + id);
  const abrir = el.style.display === 'none';
  el.style.display = abrir ? 'block' : 'none';
  if (form) form.style.display = 'none';
  if (row) row.classList.toggle('expanded', abrir);
}

function toggleUnidadeDocsForm(id) {
  const el = document.getElementById('udocs-wrap-' + id);
  const row = document.getElementById('unidade-row-' + id);
  const form = document.getElementById('udoc-form-' + id);
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

function previewUnidadeDocFile(uid, input) {
  const label = document.getElementById('udoc-file-label-' + uid);
  if (input.files && input.files[0]) {
    label.innerHTML = `${ic('paperclip', 13)} ${input.files[0].name}`;
    label.style.color = 'var(--accent)';
  }
}

function renderUnidadeDocsLista(unidadeId) {
  const d = db();
  const wrap = document.getElementById('udocs-lista-' + unidadeId);
  if (!wrap) return;
  const docs = d.unidadesDocumentos.filter(doc => doc.unidadeId === unidadeId).sort((a,b) => new Date(a.validade) - new Date(b.validade));
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
          </div>
          <div class="sup-doc-col sup-doc-col-obs">
            <div class="sup-doc-label">Observação</div>
            <div class="sup-doc-value muted">${doc.obs || '—'}</div>
          </div>
          <div class="sup-doc-actions">
            ${temArquivo
              ? `<button class="sup-doc-btn-abrir" onclick="abrirArquivoUnidadeDoc('${doc.id}')">${ic('fileText', 13)} Abrir</button>`
              : `<span class="sup-doc-sem-arquivo">—</span>`}
            <button class="sup-doc-icon-btn sup-doc-icon-btn-danger" onclick="removeUnidadeDocumento('${doc.id}','${unidadeId}')" title="Excluir">${ic('trash', 14)}</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

async function abrirArquivoUnidadeDoc(docId) {
  const d = db();
  const doc = d.unidadesDocumentos.find(x => x.id === docId);
  if (!doc || !doc.caminhoStorage) return;

  const { data, error } = await supabaseClient.storage.from('documentos-unidades').download(doc.caminhoStorage);
  if (error) { toast('Erro ao abrir arquivo: ' + error.message); return; }

  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = doc.nomeArquivo || doc.nome;
  link.click();
  URL.revokeObjectURL(url);
}

async function addUnidadeDocumento(unidadeId) {
  const nome = document.getElementById(`udoc-nome-${unidadeId}`).value.trim();
  const validade = document.getElementById(`udoc-validade-${unidadeId}`).value;
  const diasAvisoVal = document.getElementById(`udoc-dias-aviso-${unidadeId}`).value;
  const obs = document.getElementById(`udoc-obs-${unidadeId}`).value.trim();
  if (!nome || !validade) { toast('Informe o nome do documento e a validade.'); return; }

  const fileInput = document.getElementById('udoc-file-' + unidadeId);
  const file = fileInput && fileInput.files[0];

  let caminhoStorage = null;
  let nomeArquivoFinal = null;

  if (file) {
    const validadeFormatada = new Date(validade + 'T00:00:00').toLocaleDateString('pt-BR').replace(/\//g, '-');
    const ext = file.name.split('.').pop();
    nomeArquivoFinal = `${nome}_${validadeFormatada}.${ext}`;
    const nomeArquivoSeguro = sanitizarNomeArquivo(nomeArquivoFinal);
    caminhoStorage = `${currentUser.empresaId}/${unidadeId}/${Date.now()}_${nomeArquivoSeguro}`;

    const { error: uploadErr } = await supabaseClient.storage
      .from('documentos-unidades')
      .upload(caminhoStorage, file);

    if (uploadErr) { toast('Erro ao enviar arquivo: ' + uploadErr.message); return; }
  }

  const { error } = await supabaseClient.from('unidades_documentos').insert({
    empresa_id: currentUser.empresaId,
    unidade_id: unidadeId,
    tipo_documento: nome,
    validade,
    dias_aviso: diasAvisoVal === '' ? null : parseInt(diasAvisoVal, 10),
    obs,
    nome_arquivo: nomeArquivoFinal,
    caminho_storage: caminhoStorage,
  });

  if (error) { toast('Erro ao arquivar documento: ' + error.message); return; }

  const d = db();
  const un = d.unidades.find(u => u.id === unidadeId);
  addLog('unidade_documento_arquivado', `${currentUser.email} arquivou o documento "${nome}" para a unidade "${un ? un.nome : unidadeId}" (validade: ${validade})`);
  document.getElementById(`udoc-nome-${unidadeId}`).value = '';
  document.getElementById(`udoc-validade-${unidadeId}`).value = '';
  document.getElementById(`udoc-dias-aviso-${unidadeId}`).value = '';
  document.getElementById(`udoc-obs-${unidadeId}`).value = '';
  if (fileInput) fileInput.value = '';
  const label = document.getElementById('udoc-file-label-' + unidadeId);
  if (label) { label.innerHTML = `${ic('paperclip', 13)} Clique para selecionar arquivo`; label.style.color = ''; }

  await carregarUnidadesDocumentos();
  renderUnidadeDocsLista(unidadeId);
  renderUnidadesListaAd();
  toast('Documento arquivado!');
}

async function removeUnidadeDocumento(docId, unidadeId) {
  if (!confirm('Excluir este documento do arquivo?')) return;
  const d = db();
  const doc = d.unidadesDocumentos.find(x => x.id === docId);
  if (!doc) return;

  if (doc.caminhoStorage) {
    const { error: storageErr } = await supabaseClient.storage.from('documentos-unidades').remove([doc.caminhoStorage]);
    if (storageErr) { toast('Erro ao excluir arquivo: ' + storageErr.message); return; }
  }

  const { error } = await supabaseClient.from('unidades_documentos').delete().eq('id', docId);
  if (error) { toast('Erro ao excluir documento: ' + error.message); return; }

  addLog('unidade_documento_removido', `${currentUser.email} excluiu o documento "${doc.nome}"`);
  await carregarUnidadesDocumentos();
  renderUnidadeDocsLista(unidadeId);
  renderUnidadesListaAd();
  toast('Documento excluído.');
}

async function addUnidade() {
  const nome = document.getElementById('un-nome').value.trim();
  const endereco = document.getElementById('un-endereco').value.trim();
  const cnpj = document.getElementById('un-cnpj').value.trim();
  const telefone = document.getElementById('un-telefone').value.trim();
  if (!nome) { toast('Informe o nome da unidade.'); return; }

  const { error } = await supabaseClient.from('unidades').insert({
    empresa_id: currentUser.empresaId,
    nome, endereco: endereco || null, cnpj: cnpj || null, telefone: telefone || null, ativo: true,
  });

  if (error) { toast('Erro ao cadastrar unidade: ' + error.message); return; }

  addLog('unidade_criada', `${currentUser.email} cadastrou a unidade "${nome}"`);
  await carregarUnidades();
  renderAdMeusDocumentos();
  toast('Unidade adicionada!');
}

function abrirEdicaoUnidade(id) {
  const d = db();
  const u = d.unidades.find(x => x.id === id);
  if (!u) return;
  openModal(`
    <h3>Editar unidade</h3>
    <div class="form-group" style="margin-bottom:10px"><label>Nome</label><input type="text" id="eu-nome" value="${u.nome || ''}"></div>
    <div class="form-group" style="margin-bottom:10px"><label>CNPJ</label><input type="text" id="eu-cnpj" value="${u.cnpj || ''}" oninput="this.value = formatarCNPJ(this.value)"></div>
    <div class="form-group" style="margin-bottom:10px"><label>Telefone</label><input type="text" id="eu-telefone" value="${u.telefone || ''}" oninput="this.value = formatarTelefone(this.value)"></div>
    <div class="form-group" style="margin-bottom:10px"><label>Endereço</label><input type="text" id="eu-endereco" value="${u.endereco || ''}"></div>
    <div style="display:flex; gap:8px; margin-top:16px">
      <button class="btn btn-primary btn-block" onclick="salvarEdicaoUnidade('${u.id}')">Salvar alterações</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    </div>
  `);
}

async function salvarEdicaoUnidade(id) {
  const nome = document.getElementById('eu-nome').value.trim();
  if (!nome) { toast('Informe o nome da unidade.'); return; }
  const endereco = document.getElementById('eu-endereco').value.trim();
  const cnpj = document.getElementById('eu-cnpj').value.trim();
  const telefone = document.getElementById('eu-telefone').value.trim();

  const { error } = await supabaseClient.from('unidades').update({
    nome, endereco: endereco || null, cnpj: cnpj || null, telefone: telefone || null,
  }).eq('id', id);
  if (error) { toast('Erro ao atualizar unidade: ' + error.message); return; }

  addLog('unidade_editada', `${currentUser.email} editou o cadastro da unidade "${nome}"`);
  closeModal();
  await carregarUnidades();
  renderAdMeusDocumentos();
  toast('Unidade atualizada!');
}

async function excluirUnidade(id) {
  const d = db();
  const u = d.unidades.find(x => x.id === id);
  if (!u) return;
  if (!confirm(`Excluir "${u.nome}" definitivamente? Os documentos arquivados dela também serão excluídos. Essa ação não pode ser desfeita.`)) return;

  const { error } = await supabaseClient.from('unidades').delete().eq('id', id);
  if (error) { toast('Erro ao excluir unidade: ' + error.message); return; }

  addLog('unidade_excluida', `${currentUser.email} excluiu a unidade "${u.nome}"`);
  await carregarUnidades();
  await carregarUnidadesDocumentos();
  renderAdMeusDocumentos();
  toast('Unidade excluída.');
}
