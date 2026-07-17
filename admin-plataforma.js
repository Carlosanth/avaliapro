let empresasCachePlataforma = [];

// Conexão com o Supabase — embutida aqui (não depende de nenhum outro
// arquivo da pasta principal do HomologPro, essa página é independente).
const SUPABASE_URL = 'https://qmvfsgwzbrhbxyonntgh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_JjiXWFQTcOrUf5RXjsfeVw_5cwLPHf3';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

function toastPlataforma(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3000);
}

async function doLoginPlataforma() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const senha = document.getElementById('login-senha').value;
  const errBox = document.getElementById('login-error');
  errBox.style.display = 'none';

  const { error: erroLogin } = await supabaseClient.auth.signInWithPassword({ email, password: senha });
  if (erroLogin) {
    errBox.textContent = 'E-mail ou senha inválidos.';
    errBox.style.display = 'block';
    return;
  }

  const ok = await carregarEmpresasPlataforma();
  if (!ok) {
    errBox.textContent = 'Acesso negado. Essa conta não tem permissão de administrador da plataforma.';
    errBox.style.display = 'block';
    await supabaseClient.auth.signOut();
  }
}

async function sairPlataforma() {
  await supabaseClient.auth.signOut();
  document.getElementById('app-view').style.display = 'none';
  document.getElementById('login-view').style.display = 'flex';
  document.getElementById('login-email').value = '';
  document.getElementById('login-senha').value = '';
}

// Retorna true/false — usado tanto no login quanto pra recarregar a lista depois de editar.
async function carregarEmpresasPlataforma() {
  const { data, error } = await supabaseClient.functions.invoke('superadmin-listar-empresas');

  if (error || (data && data.ok === false)) {
    return false;
  }

  empresasCachePlataforma = data.empresas || [];
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('app-view').style.display = 'block';
  document.getElementById('topbar-sub').textContent = `${empresasCachePlataforma.length} empresa(s) cadastrada(s)`;
  renderEmpresasPlataforma();
  return true;
}

function badgeStatusHTML(status) {
  const labels = { trial: 'Trial', ativa: 'Ativa', expirada: 'Expirada', cancelada: 'Cancelada' };
  return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
}

function renderEmpresasPlataforma() {
  const wrap = document.getElementById('empresas-wrap');

  if (!empresasCachePlataforma.length) {
    wrap.innerHTML = '<div class="empty-state">Nenhuma empresa cadastrada ainda.</div>';
    return;
  }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Status</th>
          <th>Trial até</th>
          <th>Plano</th>
          <th style="text-align:center">Usuários</th>
          <th style="text-align:center">Fornecedores</th>
          <th style="text-align:center">Avaliações</th>
          <th style="text-align:center">Limite forn.</th>
          <th style="text-align:center">Limite admins</th>
          <th>Criada em</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${empresasCachePlataforma.map(emp => `
          <tr>
            <td style="font-weight:600">${emp.nome} ${badgeStatusHTML(emp.status)}</td>
            <td>
              <select id="pf-status-${emp.id}">
                <option value="trial" ${emp.status === 'trial' ? 'selected' : ''}>Trial</option>
                <option value="ativa" ${emp.status === 'ativa' ? 'selected' : ''}>Ativa</option>
                <option value="expirada" ${emp.status === 'expirada' ? 'selected' : ''}>Expirada</option>
                <option value="cancelada" ${emp.status === 'cancelada' ? 'selected' : ''}>Cancelada</option>
              </select>
            </td>
            <td><input type="date" id="pf-trial-${emp.id}" value="${emp.trial_termina_em ? emp.trial_termina_em.slice(0, 10) : ''}"></td>
            <td>
              <select id="pf-plano-${emp.id}">
                <option value="" ${!emp.plano ? 'selected' : ''}>—</option>
                <option value="essencial" ${emp.plano === 'essencial' ? 'selected' : ''}>Essencial</option>
                <option value="profissional" ${emp.plano === 'profissional' ? 'selected' : ''}>Profissional</option>
                <option value="enterprise" ${emp.plano === 'enterprise' ? 'selected' : ''}>Enterprise</option>
              </select>
            </td>
            <td style="text-align:center">${emp.totalUsuarios}</td>
            <td style="text-align:center">${emp.totalFornecedores}</td>
            <td style="text-align:center">${emp.totalAvaliacoes}</td>
            <td><input type="number" min="0" placeholder="ilimitado" id="pf-limite-forn-${emp.id}" style="width:90px; text-align:center" value="${emp.limite_fornecedores ?? ''}"></td>
            <td><input type="number" min="0" placeholder="ilimitado" id="pf-limite-admins-${emp.id}" style="width:80px; text-align:center" value="${emp.limite_admins ?? ''}"></td>
            <td style="color:var(--text-muted); font-size:12px">${new Date(emp.criado_em).toLocaleDateString('pt-BR')}</td>
            <td><button class="btn btn-primary btn-sm" onclick="salvarEmpresaPlataforma('${emp.id}')">Salvar</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function salvarEmpresaPlataforma(empresaId) {
  const status = document.getElementById(`pf-status-${empresaId}`).value;
  const trialDate = document.getElementById(`pf-trial-${empresaId}`).value;
  const plano = document.getElementById(`pf-plano-${empresaId}`).value;
  const limiteFornVal = document.getElementById(`pf-limite-forn-${empresaId}`).value;
  const limiteAdminsVal = document.getElementById(`pf-limite-admins-${empresaId}`).value;

  const body = {
    empresaId,
    status,
    trialTerminaEm: trialDate ? new Date(trialDate + 'T23:59:59').toISOString() : null,
    plano: plano || null,
    // vazio no campo = ilimitado (null no banco)
    limiteFornecedores: limiteFornVal === '' ? null : parseInt(limiteFornVal, 10),
    limiteAdmins: limiteAdminsVal === '' ? null : parseInt(limiteAdminsVal, 10),
  };

  const { data, error } = await supabaseClient.functions.invoke('superadmin-atualizar-empresa', { body });

  if (error || (data && data.ok === false)) {
    toastPlataforma('Erro: ' + ((data && data.error) || error?.message || 'falha ao salvar'));
    return;
  }

  toastPlataforma('Salvo!');
  await carregarEmpresasPlataforma();
}

// Se já tiver sessão ativa (voltou pra página logado), tenta carregar direto.
(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) await carregarEmpresasPlataforma();
})();
