// ============ INIT: dispara depois que todos os outros arquivos já carregaram ============
// ============ INIT ============
initDB();
checkSession();

// Retorno do checkout do Stripe (?checkout=sucesso|cancelado na URL)
(() => {
  const params = new URLSearchParams(window.location.search);
  const checkout = params.get('checkout');
  if (!checkout) return;
  window.history.replaceState({}, '', window.location.pathname);
  setTimeout(() => {
    if (checkout === 'sucesso') toast('Pagamento confirmado! Pode levar alguns segundos pra atualizar o status da sua conta.');
    if (checkout === 'cancelado') toast('Checkout cancelado — nenhuma cobrança foi feita.');
  }, 600);
})();

