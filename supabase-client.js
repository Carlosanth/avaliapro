// ============ CONEXÃO COM O SUPABASE ============
// Publishable key: segura de ficar aqui no front, é protegida pelo RLS
// que já configuramos nas tabelas (cada usuário só acessa dados da própria empresa).
const SUPABASE_URL = 'https://qmvfsgwzbrhbxyonntgh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_JjiXWFQTcOrUf5RXjsfeVw_5cwLPHf3';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Teste rápido de conexão — pode chamar no console do navegador:
// testarConexaoSupabase()
async function testarConexaoSupabase() {
  const { data, error } = await supabaseClient.from('empresas').select('*');
  if (error) {
    console.error('❌ Erro ao conectar no Supabase:', error.message);
    return;
  }
  console.log('✅ Conectado! Empresas encontradas:', data);
}
