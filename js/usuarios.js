// ============ USUÁRIOS E ACESSOS ============
function renderAdUsuarios() {
  const d = db();
  const totalAvaliadoresPendentes = d.usuarios.filter(u => u.papel === 'avaliador' && u.ativo && contarPendentesAvaliador(d, u.id).pendentes > 0).length;

  document.getElementById('ad-page-usuarios').innerHTML = `
    <div class="page-header"><div><h2>Usuários e acessos</h2><p>Quem pode acessar o sistema. Apenas admins podem criar ou alterar senhas.</p></div></div>
    <div class="card">
      <div class="card-title">Novo usuário</div>
      <div class="form-row three">
        <div class="form-group"><label>Nome</label><input type="text" id="nu-nome" placeholder="Ex: Setor Compras"></div>
        <div class="form-group"><label>E-mail</label><input type="email" id="nu-email" placeholder="setor@empresa.com"></div>
        <div class="form-group"><label>Papel</label><select id="nu-papel" onchange="atualizarCamposPermissaoNovoUsuario()"><option value="avaliador">Avaliador</option><option value="admin">Admin</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Senha inicial</label><input type="text" id="nu-senha" placeholder="Mín. 6 caracteres"></div>
      </div>
      <div id="nu-permissoes-wrap" style="display:none; margin-bottom:14px">
        <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:6px">Módulos que esse admin pode acessar (por padrão, todos)</label>
        <div style="display:flex; flex-wrap:wrap; gap:4px 16px">
          ${MODULOS_MENU.map(m => `<label class="checklist-item"><input type="checkbox" class="nu-modulo-check" value="${m.chave}" checked ${m.chave === 'dashboard' ? 'disabled' : ''}> ${m.label}</label>`).join('')}
        </div>
      </div>
      <button class="btn btn-primary" onclick="addUsuario()">Criar usuário</button>
    </div>
    <div class="card">
      <div class="card-title">Lembrete pros avaliadores</div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Manda um e-mail agora pra todo avaliador com avaliação pendente, com o link de acesso. Funciona mesmo se o lembrete automático (Configurações → Cobrança automática) estiver desligado.</p>
      <button class="btn btn-primary" id="btn-lembrete-avaliadores" onclick="enviarLembreteTodosAvaliadores()">📨 Enviar lembrete pra todos os pendentes${totalAvaliadoresPendentes ? ` (${totalAvaliadoresPendentes})` : ''}</button>
    </div>
    <div class="card">
      <div class="card-title">Usuários (${d.usuarios.length})</div>
      <div id="usuarios-lista"></div>
    </div>
  `;
  renderUsuariosLista();
}

async function enviarLembreteTodosAvaliadores() {
  const btn = document.getElementById('btn-lembrete-avaliadores');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  const { data, error } = await supabaseClient.functions.invoke('lembrete-avaliadores', { body: {} });

  if (btn) { btn.disabled = false; }

  if (error) { console.error(error); toast('Não foi possível enviar os lembretes agora. Tente de novo em instantes.'); if (btn) btn.textContent = '📨 Enviar lembrete pra todos os pendentes'; return; }
  if (data && data.skip) {
    if (btn) btn.textContent = '📨 Enviar lembrete pra todos os pendentes';
    abrirLembreteManualMailto();
    return;
  }
  if (data && data.ok === false) { console.error(data.error); toast('Não foi possível enviar os lembretes agora.'); if (btn) btn.textContent = '📨 Enviar lembrete pra todos os pendentes'; return; }

  addLog('lembrete_avaliadores_manual', `${currentUser.email} disparou lembrete manual pra avaliadores (${data.enviados} enviado(s), ${(data.erros || []).length} erro(s))`);
  await carregarUsuarios();
  if (document.getElementById('ad-page-usuarios').classList.contains('active')) renderAdUsuarios();
  if (document.getElementById('ad-page-dashboard').classList.contains('active')) renderAdDashboard();
  if (data.erros && data.erros.length) {
    toast(`${data.enviados} enviado(s), ${data.erros.length} não conseguiram sair — confira ao lado do nome de cada avaliador.`);
  } else {
    toast(`${data.enviados} lembrete(s) enviado(s)!`);
  }
}

// Enquanto o Resend não estiver configurado, o lembrete manual cai pra um
// mailto: normal — todos os avaliadores pendentes ficam visíveis no "Para"
// (sem CCO, já que são colegas da mesma empresa, tanto faz verem uns aos
// outros aqui).
function abrirLembreteManualMailto() {
  const d = db();
  const pendentes = d.usuarios.filter(u => u.papel === 'avaliador' && u.ativo && u.email && contarPendentesAvaliador(d, u.id).pendentes > 0);

  if (!pendentes.length) { toast('Nenhum avaliador com pendência no momento.'); return; }

  // Monta o link do avaliador.html a partir de onde o próprio site está
  // rodando agora — não depende de nenhuma secret configurada no servidor.
  const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
  const linkAvaliador = baseUrl + 'avaliador.html';

  const emails = pendentes.map(u => u.email).join(',');
  const assunto = 'Avaliações pendentes';
  const corpo = `Olá,\n\nExistem avaliações pendentes aguardando seu preenchimento. Por gentileza, acesse ${linkAvaliador} para efetuar a avaliação.\n\nAtenciosamente,\n${db().empresa.nome || 'Empresa'}`;
  const link = `mailto:${encodeURIComponent(emails)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;

  addLog('lembrete_avaliadores_manual_mailto', `${currentUser.email} abriu o cliente de e-mail pra ${pendentes.length} avaliador(es) pendente(s) (Resend ainda não configurado)`);
  window.location.href = link;
}

function atualizarCamposPermissaoNovoUsuario() {
  const papel = document.getElementById('nu-papel').value;
  document.getElementById('nu-permissoes-wrap').style.display = papel === 'admin' ? 'block' : 'none';
}

function renderUsuariosLista() {
  const d = db();
  const wrap = document.getElementById('usuarios-lista');
  wrap.innerHTML = `<table><thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Status</th><th></th></tr></thead><tbody>
    ${d.usuarios.map(u => {
      let statusLembrete = '';
      if (u.papel === 'avaliador') {
        const { pendentes, atrasados } = contarPendentesAvaliador(d, u.id);
        const falhouRecente = u.ultimo_erro_lembrete && (!u.ultimo_lembrete_em || new Date(u.ultimo_erro_lembrete_em) > new Date(u.ultimo_lembrete_em));
        const partes = [];
        if (pendentes) partes.push(`<span style="color:${atrasados ? 'var(--danger)' : 'var(--warn)'}">${pendentes} pendente(s)${atrasados ? `, ${atrasados} atrasada(s)` : ''}</span>`);
        if (falhouRecente) partes.push(`<span style="color:var(--danger)" title="O envio automático não funcionou dessa vez. Tente enviar de novo pelo botão de lembrete.">❌ não conseguimos enviar o lembrete</span>`);
        else if (u.ultimo_lembrete_em) partes.push(`<span style="color:var(--success)">📨 lembrete em ${new Date(u.ultimo_lembrete_em).toLocaleDateString('pt-BR')}</span>`);
        if (partes.length) statusLembrete = `<div style="font-size:11px; margin-top:3px">${partes.join(' &nbsp;·&nbsp; ')}</div>`;
      }
      return `<tr>
      <td style="font-weight:500">${u.nome}${statusLembrete}</td>
      <td style="color:var(--text-sec)">${u.email}</td>
      <td><span class="role-badge ${u.papel === 'avaliador' ? 'avaliador' : 'admin'}" style="display:inline-block">${u.papel === 'admin_master' ? 'Admin+' : u.papel === 'admin' ? 'Admin' : 'Avaliador'}</span></td>
      <td>${u.ativo ? '<span class="badge badge-success">Ativo</span>' : '<span class="badge badge-neutral">Inativo</span>'}</td>
      <td><div class="actions">
        <button class="btn btn-secondary btn-sm" onclick="resetSenha('${u.id}')">Redefinir senha</button>
        ${u.papel === 'admin' ? `<button class="btn btn-secondary btn-sm" onclick="abrirPermissoesUsuario('${u.id}')">Permissões</button>` : ''}
        ${u.papel === 'admin_master' ? `<span style="font-size:11px; color:var(--text-muted); padding:0 6px">Admin+ tem acesso total e não pode ser removido</span>` : `
          <button class="btn btn-secondary btn-sm" onclick="toggleUsuario('${u.id}')">${u.ativo ? 'Desativar' : 'Ativar'}</button>
          <button class="btn btn-danger btn-sm" onclick="excluirUsuarioAd('${u.id}')">Excluir</button>
        `}
      </div></td>
    </tr>`;
    }).join('')}
  </tbody></table>`;
}

function abrirPermissoesUsuario(id) {
  const d = db();
  const u = d.usuarios.find(x => x.id === id);
  if (!u) return;
  const permissoesAtuais = u.permissoes_modulos; // null = acesso total
  openModal(`
    <h3>Permissões — ${u.nome}</h3>
    <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px">Módulos que esse admin pode acessar.</p>
    <div style="display:flex; flex-direction:column; gap:4px; max-height:320px; overflow-y:auto">
      ${MODULOS_MENU.map(m => `<label class="checklist-item"><input type="checkbox" class="pu-modulo-check" value="${m.chave}" ${(!permissoesAtuais || permissoesAtuais.includes(m.chave)) ? 'checked' : ''} ${m.chave === 'dashboard' ? 'disabled' : ''}> ${m.label}</label>`).join('')}
    </div>
    <div style="display:flex; gap:8px; margin-top:18px">
      <button class="btn btn-primary btn-block" onclick="salvarPermissoesUsuario('${id}')">Salvar</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
    </div>
  `);
}

async function salvarPermissoesUsuario(id) {
  const checks = document.querySelectorAll('#modal-box .pu-modulo-check:checked');
  const modulos = Array.from(checks).map(c => c.value);

  const { error } = await supabaseClient
    .from('profiles')
    .update({ permissoes_modulos: modulos })
    .eq('id', id);

  if (error) { toast('Erro ao salvar permissões: ' + error.message); return; }

  const d = db();
  const u = d.usuarios.find(x => x.id === id);
  addLog('permissoes_atualizadas', `${currentUser.email} atualizou as permissões de módulo de ${u ? u.email : id}`);
  closeModal();
  await carregarUsuarios();
  renderUsuariosLista();
  toast('Permissões atualizadas!');
}

async function addUsuario() {
  const nome = document.getElementById('nu-nome').value.trim();
  const email = document.getElementById('nu-email').value.trim().toLowerCase();
  const papel = document.getElementById('nu-papel').value;
  const senha = document.getElementById('nu-senha').value;
  if (!nome || !email || senha.length < 6) { toast('Preencha todos os campos. Senha mínima de 6 caracteres.'); return; }

  const d = db();
  if (papel === 'admin' && d.limiteAdmins !== null) {
    const totalAdmins = d.usuarios.filter(u => (u.papel === 'admin' || u.papel === 'admin_master') && u.ativo).length;
    if (totalAdmins >= d.limiteAdmins) {
      toast(`Limite de ${d.limiteAdmins} admin(s) do seu plano atingido. Fale com a gente para aumentar.`);
      return;
    }
  }

  // Só relevante quando papel === 'admin' (avaliador não usa isso).
  const permissoesModulos = papel === 'admin'
    ? Array.from(document.querySelectorAll('#nu-permissoes-wrap .nu-modulo-check:checked')).map(c => c.value)
    : null;

  const btn = document.querySelector('#ad-page-usuarios .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Criando...'; }

  const { data, error } = await supabaseClient.functions.invoke('admin-criar-usuario', {
    body: { nome, email, senha, papel, permissoesModulos },
  });

  if (btn) { btn.disabled = false; btn.textContent = 'Criar usuário'; }

  // supabase-js devolve erro de Edge Function em error.context; a mensagem
  // "de negócio" (ex: "já existe") vem no corpo (data.error) quando o status
  // não é 2xx.
  if (error || (data && data.ok === false)) {
    const msg = (data && data.error) || error?.message || 'Erro ao criar usuário.';
    toast(msg);
    return;
  }

  addLog('usuario_criado', `${currentUser.email} criou o usuário ${email} (papel: ${papel})`);
  document.getElementById('nu-nome').value = '';
  document.getElementById('nu-email').value = '';
  document.getElementById('nu-senha').value = '';
  document.querySelectorAll('#nu-permissoes-wrap .nu-modulo-check').forEach(c => c.checked = true);
  await carregarUsuarios();
  renderAdUsuarios();
  toast('Usuário criado!');
}

function resetSenha(id) {
  const d = db();
  const u = d.usuarios.find(x => x.id === id);
  if (!u) return;
  openModal(`
    <h3>Redefinir senha — ${u.email}</h3>
    <div class="form-group" style="margin-bottom:14px">
      <label>Nova senha</label>
      <input type="text" id="rs-nova-senha" placeholder="Mínimo 6 caracteres">
    </div>
    <div style="display:flex; gap:8px; justify-content:flex-end">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="confirmarResetSenha('${id}')">Salvar nova senha</button>
    </div>
  `);
}

async function confirmarResetSenha(id) {
  const novaSenha = document.getElementById('rs-nova-senha').value;
  if (novaSenha.length < 6) { toast('Senha deve ter ao menos 6 caracteres.'); return; }
  const d = db();
  const u = d.usuarios.find(x => x.id === id);
  if (!u) return;

  const { data, error } = await supabaseClient.functions.invoke('admin-redefinir-senha', {
    body: { usuarioId: id, novaSenha },
  });

  if (error || (data && data.ok === false)) {
    const msg = (data && data.error) || error?.message || 'Erro ao redefinir senha.';
    toast(msg);
    return;
  }

  addLog('senha_redefinida', `${currentUser.email} redefiniu a senha do usuário ${u.email}`);
  closeModal();
  toast('Senha redefinida com sucesso.');
}

async function toggleUsuario(id) {
  const d = db();
  const u = d.usuarios.find(x => x.id === id);
  if (!u) return;
  if (u.papel === 'admin_master') { toast('O Admin+ não pode ser desativado.'); return; }
  const novoStatus = !u.ativo;

  // Ativar/desativar não precisa de Edge Function: é um UPDATE simples em
  // "profiles", permitido pela policy de RLS "admin ativa ou desativa
  // usuarios da empresa" (só funciona dentro da própria empresa).
  const { error } = await supabaseClient
    .from('profiles')
    .update({ ativo: novoStatus })
    .eq('id', id);

  if (error) {
    toast('Erro ao atualizar status: ' + error.message);
    return;
  }

  u.ativo = novoStatus;
  addLog('usuario_status', `${currentUser.email} ${u.ativo ? 'ativou' : 'desativou'} o usuário ${u.email}`);
  renderUsuariosLista();
  toast(`Usuário ${u.ativo ? 'ativado' : 'desativado'}.`);
}

async function excluirUsuarioAd(id) {
  const d = db();
  const u = d.usuarios.find(x => x.id === id);
  if (!u) return;
  if (u.id === currentUser.id) { toast('Você não pode excluir seu próprio usuário.'); return; }
  if (u.papel === 'admin_master') { toast('O Admin+ não pode ser excluído.'); return; }
  if (!confirm(`Excluir "${u.nome}" (${u.email}) definitivamente? O login dele deixa de existir e não pode ser desfeito. Avaliações que ele já enviou continuam no histórico normalmente.`)) return;

  const { data, error } = await supabaseClient.functions.invoke('admin-excluir-usuario', {
    body: { usuarioId: id },
  });

  if (error || (data && data.ok === false)) {
    const msg = (data && data.error) || error?.message || 'Erro ao excluir usuário.';
    toast(msg);
    return;
  }

  addLog('usuario_excluido', `${currentUser.email} excluiu definitivamente o usuário ${u.email}`);
  await carregarUsuarios();
  renderUsuariosLista();
  toast('Usuário excluído.');
}

// ---------- AVALIAÇÕES RECEBIDAS ----------
