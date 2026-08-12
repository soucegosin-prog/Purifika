/* ==========================================================
   PURIFIKA — Painel Financeiro
   Todo o histórico é salvo no localStorage do navegador.
   ========================================================== */

const STORAGE_KEY = 'purifika_state_v1';

const DEFAULT_PRICES = {
  cadeira:               { label: 'Cadeira estofada',           preco: 20,  produto: 3   },
  poltrona:              { label: 'Poltrona',                   preco: 110, produto: 5   },
  sofa_2:                { label: 'Sofá 2 lugares',              preco: 149, produto: 7   },
  sofa_3:                { label: 'Sofá 3 lugares',              preco: 179, produto: 9.5 },
  sofa_retratil:         { label: 'Sofá retrátil / reclinável',  preco: 350, produto: 11  },
  sofa_l:                { label: 'Sofá em L',                   preco: 450, produto: 15  },
  colchao_solteiro:      { label: 'Colchão solteiro',            preco: 99,  produto: 6   },
  colchao_casal:         { label: 'Colchão casal',               preco: 149, produto: 8   },
  colchao_queen:         { label: 'Colchão queen',               preco: 280, produto: 9   },
  colchao_king:          { label: 'Colchão king',                preco: 330, produto: 10  },
  banco_carro:           { label: 'Banco de carro (cada)',       preco: 80,  produto: 4   },
  interior_carro:        { label: 'Interior completo do carro',  preco: 350, produto: 12  },
};

const DEFAULT_SETTINGS = {
  kmPorLitro: 12,
  precoGasolina: 6.10,
  aliquotaImposto: 6,
  metaMensal: 3000,
  prices: DEFAULT_PRICES,
};

let state = loadState();

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return { settings: structuredClone(DEFAULT_SETTINGS), entries: [] };
    const parsed = JSON.parse(raw);
    parsed.settings = Object.assign(structuredClone(DEFAULT_SETTINGS), parsed.settings || {});
    parsed.settings.prices = Object.assign(structuredClone(DEFAULT_PRICES), parsed.settings.prices || {});
    parsed.entries = parsed.entries || [];
    return parsed;
  }catch(e){
    console.error('Falha ao carregar dados salvos', e);
    return { settings: structuredClone(DEFAULT_SETTINGS), entries: [] };
  }
}

function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){
    console.error('Falha ao salvar', e);
    showToast('Não consegui salvar os dados no navegador.');
  }
}

/* ---------- Helpers ---------- */
function brl(v){
  return (v || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
}
function todayISO(){
  return new Date().toISOString().slice(0,10);
}
function monthKey(dateStr){
  return (dateStr || todayISO()).slice(0,7);
}
function monthLabel(key){
  const [y,m] = key.split('-');
  const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return `${nomes[parseInt(m,10)-1]} de ${y}`;
}
function calcCombustivel(km){
  const s = state.settings;
  if(!km || !s.kmPorLitro) return 0;
  return (km / s.kmPorLitro) * s.precoGasolina;
}
function uid(){
  return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(()=> t.classList.remove('show'), 2600);
}

/* ---------- Navigation ---------- */
function setView(view){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
  document.getElementById('view-' + view).classList.add('is-active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  document.querySelectorAll('.mnav-item').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  if(view === 'dashboard') renderDashboard();
  if(view === 'historico') renderHistorico();
  if(view === 'analise') renderAnalise();
  if(view === 'config') renderConfig();
  if(view === 'novo') prepFormDefaults();
  window.scrollTo(0,0);
}

document.querySelectorAll('[data-view]').forEach(el=>{
  el.addEventListener('click', ()=> setView(el.dataset.view));
});

/* ---------- Dashboard ---------- */
function entriesForMonth(key){
  return state.entries.filter(e => monthKey(e.data) === key);
}

function renderDashboard(){
  const key = todayISO().slice(0,7);
  document.getElementById('dash-month-label').textContent = monthLabel(key);

  const items = entriesForMonth(key);
  let receita = 0, despesa = 0, km = 0, qtdServicos = 0;

  items.forEach(e=>{
    if(e.tipo === 'receita'){ receita += e.valor; qtdServicos++; km += (e.km||0); }
    else { despesa += e.valor; }
  });

  const lucroBruto = receita - despesa;
  const impostos = receita * (state.settings.aliquotaImposto/100);
  const lucroLiquido = lucroBruto - impostos;
  const ticket = qtdServicos ? receita/qtdServicos : 0;

  document.getElementById('stat-receita').textContent = brl(receita);
  document.getElementById('stat-despesa').textContent = brl(despesa);
  document.getElementById('stat-lucro').textContent = brl(lucroLiquido);
  document.getElementById('stat-ticket').textContent = brl(ticket);
  document.getElementById('stat-qtd').textContent = qtdServicos;
  document.getElementById('stat-km').textContent = Math.round(km) + ' km';

  const meta = state.settings.metaMensal || 0;
  const pct = meta > 0 ? Math.max(0, Math.min(1, lucroLiquido/meta)) : 0;
  document.getElementById('goal-percent').textContent = Math.round(pct*100) + '%';
  document.getElementById('goal-detail').textContent = `${brl(lucroLiquido)} de ${brl(meta)}`;

  const gaugeHeight = 138 * pct;
  const fill = document.getElementById('gauge-fill');
  fill.setAttribute('height', gaugeHeight.toFixed(1));
  fill.setAttribute('y', (144 - gaugeHeight).toFixed(1));

  const recentWrap = document.getElementById('recent-list');
  const recent = [...state.entries].sort((a,b)=> (b.criadoEm||0) - (a.criadoEm||0)).slice(0,6);
  recentWrap.innerHTML = recent.length ? '' : '<p class="empty-state" style="padding:20px 0">Nenhum serviço lançado ainda.</p>';
  recent.forEach(e=>{
    const row = document.createElement('div');
    row.className = 'recent-row';
    row.innerHTML = `
      <div><span class="r-desc">${escapeHtml(e.descricao)}</span><span class="r-date">${formatDate(e.data)}</span></div>
      <span class="r-val ${e.tipo==='receita' ? 'pos':'neg'}">${e.tipo==='receita'?'+':'-'} ${brl(e.valor)}</span>
    `;
    recentWrap.appendChild(row);
  });
}

function formatDate(iso){
  if(!iso) return '';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function escapeHtml(s){
  const div = document.createElement('div');
  div.textContent = s || '';
  return div.innerHTML;
}

/* ---------- Novo serviço ---------- */
const tipoSelect = document.getElementById('f-tipo');
function populateTipoSelect(){
  tipoSelect.innerHTML = '';
  Object.entries(state.settings.prices).forEach(([key, cfg])=>{
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${cfg.label} — sugestão ${brl(cfg.preco)}`;
    tipoSelect.appendChild(opt);
  });
}

function prepFormDefaults(){
  document.getElementById('f-data').value = todayISO();
  applyTipoDefaults();
}
function applyTipoDefaults(){
  const cfg = state.settings.prices[tipoSelect.value];
  if(!cfg) return;
  document.getElementById('f-valor').value = cfg.preco;
  document.getElementById('f-produto').value = cfg.produto;
  updateCalcPreview();
}
tipoSelect.addEventListener('change', applyTipoDefaults);

['f-valor','f-km','f-produto','f-desgaste'].forEach(id=>{
  document.getElementById(id).addEventListener('input', updateCalcPreview);
});

function updateCalcPreview(){
  const valor = parseFloat(document.getElementById('f-valor').value) || 0;
  const km = parseFloat(document.getElementById('f-km').value) || 0;
  const produto = parseFloat(document.getElementById('f-produto').value) || 0;
  const desgaste = parseFloat(document.getElementById('f-desgaste').value) || 0;
  const gas = calcCombustivel(km);
  const custos = produto + desgaste + gas;
  const lucro = valor - custos;

  document.getElementById('calc-gas').textContent = brl(gas);
  document.getElementById('calc-custos').textContent = brl(custos);
  document.getElementById('calc-lucro').textContent = brl(lucro);
}

document.getElementById('service-form').addEventListener('submit', e=>{
  e.preventDefault();
  const tipo = tipoSelect.value;
  const cfg = state.settings.prices[tipo];
  const cliente = document.getElementById('f-cliente').value.trim();
  const data = document.getElementById('f-data').value || todayISO();
  const valor = parseFloat(document.getElementById('f-valor').value) || 0;
  const km = parseFloat(document.getElementById('f-km').value) || 0;
  const produto = parseFloat(document.getElementById('f-produto').value) || 0;
  const desgaste = parseFloat(document.getElementById('f-desgaste').value) || 0;
  const gas = calcCombustivel(km);

  const descricao = cliente ? `${cfg.label} — ${cliente}` : cfg.label;

  state.entries.push({
    id: uid(), tipo:'receita', categoria:'servico', descricao, valor, data,
    km, custoProduto: produto, custoGasolina: gas, desgaste, criadoEm: Date.now()
  });

  if(produto > 0){
    state.entries.push({
      id: uid(), tipo:'despesa', categoria:'produto',
      descricao: `Produto químico — ${cfg.label}`, valor: produto, data, criadoEm: Date.now()-1
    });
  }
  if(gas > 0){
    state.entries.push({
      id: uid(), tipo:'despesa', categoria:'combustivel',
      descricao: `Combustível — ${km} km`, valor: parseFloat(gas.toFixed(2)), data, criadoEm: Date.now()-2
    });
  }
  if(desgaste > 0){
    state.entries.push({
      id: uid(), tipo:'despesa', categoria:'equipamento',
      descricao: 'Desgaste de equipamento', valor: desgaste, data, criadoEm: Date.now()-3
    });
  }

  const despDesc = document.getElementById('f-despesa-desc').value.trim();
  const despValor = parseFloat(document.getElementById('f-despesa-valor').value) || 0;
  if(despDesc && despValor > 0){
    state.entries.push({
      id: uid(), tipo:'despesa', categoria:'geral', descricao: despDesc, valor: despValor, data, criadoEm: Date.now()-4
    });
  }

  saveState();
  e.target.reset();
  document.getElementById('f-despesa-desc').value = '';
  document.getElementById('f-despesa-valor').value = '';
  showToast('Serviço registrado com sucesso.');
  setView('dashboard');
});

document.getElementById('btn-add-despesa').addEventListener('click', ()=>{
  const desc = document.getElementById('f-despesa-desc').value.trim();
  const valor = parseFloat(document.getElementById('f-despesa-valor').value) || 0;
  if(!desc || valor <= 0){
    showToast('Preencha a descrição e o valor da despesa.');
    return;
  }
  state.entries.push({
    id: uid(), tipo:'despesa', categoria:'geral', descricao: desc, valor, data: todayISO(), criadoEm: Date.now()
  });
  saveState();
  document.getElementById('f-despesa-desc').value = '';
  document.getElementById('f-despesa-valor').value = '';
  showToast('Despesa registrada.');
  renderDashboard();
});

/* ---------- Histórico ---------- */
function renderHistorico(){
  const filterSelect = document.getElementById('hist-filter');
  const months = [...new Set(state.entries.map(e=>monthKey(e.data)))].sort().reverse();
  const currentVal = filterSelect.value;
  filterSelect.innerHTML = '<option value="todos">Todos os meses</option>' +
    months.map(m=>`<option value="${m}">${monthLabel(m)}</option>`).join('');
  if(months.includes(currentVal)) filterSelect.value = currentVal;

  filterSelect.onchange = renderHistoricoTable;
  renderHistoricoTable();
}

function renderHistoricoTable(){
  const filter = document.getElementById('hist-filter').value;
  const body = document.getElementById('hist-body');
  const empty = document.getElementById('hist-empty');
  let list = [...state.entries].sort((a,b)=> (b.criadoEm||0)-(a.criadoEm||0));
  if(filter !== 'todos') list = list.filter(e=> monthKey(e.data) === filter);

  body.innerHTML = '';
  empty.style.display = list.length ? 'none' : 'block';

  list.forEach(e=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(e.data)}</td>
      <td><span class="tag ${e.tipo==='receita'?'tag-receita':'tag-despesa'}">${e.tipo==='receita'?'Receita':'Despesa'}</span></td>
      <td>${escapeHtml(e.descricao)}</td>
      <td class="val-mono">${e.km ? Math.round(e.km)+' km' : '—'}</td>
      <td class="val-mono">${e.tipo==='receita'?'+':'-'} ${brl(e.valor)}</td>
      <td><button class="row-del" data-id="${e.id}" title="Excluir">✕</button></td>
    `;
    body.appendChild(tr);
  });

  body.querySelectorAll('.row-del').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.entries = state.entries.filter(e=> e.id !== btn.dataset.id);
      saveState();
      renderHistoricoTable();
    });
  });
}

/* ---------- Análise mensal ---------- */
function renderAnalise(){
  const byMonth = {};
  state.entries.forEach(e=>{
    const k = monthKey(e.data);
    byMonth[k] = byMonth[k] || { receita:0, despesa:0 };
    if(e.tipo==='receita') byMonth[k].receita += e.valor;
    else byMonth[k].despesa += e.valor;
  });
  const months = Object.keys(byMonth).sort().slice(-6);
  const chart = document.getElementById('monthly-chart');
  chart.innerHTML = '';

  if(!months.length){
    chart.innerHTML = '<p class="empty-state">Sem dados suficientes ainda.</p>';
  }else{
    const maxVal = Math.max(...months.map(m=> Math.max(byMonth[m].receita, byMonth[m].despesa)), 1);
    months.forEach(m=>{
      const d = byMonth[m];
      const lucro = d.receita - d.despesa;
      const col = document.createElement('div');
      col.className = 'chart-month';
      col.innerHTML = `
        <div class="chart-month-bars">
          <div class="bar bar-receita" style="height:${(d.receita/maxVal*170).toFixed(0)}px" title="Faturamento: ${brl(d.receita)}"></div>
          <div class="bar bar-despesa" style="height:${(d.despesa/maxVal*170).toFixed(0)}px" title="Despesas: ${brl(d.despesa)}"></div>
          <div class="bar bar-lucro" style="height:${(Math.max(lucro,0)/maxVal*170).toFixed(0)}px" title="Lucro: ${brl(lucro)}"></div>
        </div>
        <span class="chart-month-label">${m.slice(5)}/${m.slice(2,4)}</span>
      `;
      chart.appendChild(col);
    });
  }

  const catTotals = {};
  state.entries.filter(e=>e.tipo==='despesa').forEach(e=>{
    catTotals[e.categoria] = (catTotals[e.categoria]||0) + e.valor;
  });
  const labels = { produto:'Produtos químicos', combustivel:'Combustível', equipamento:'Equipamento', geral:'Outras despesas' };
  const total = Object.values(catTotals).reduce((a,b)=>a+b,0) || 1;
  const bd = document.getElementById('expense-breakdown');
  bd.innerHTML = '';
  Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).forEach(([cat,val])=>{
    const pct = (val/total*100);
    const row = document.createElement('div');
    row.className = 'bd-row';
    row.innerHTML = `
      <span class="bd-label">${labels[cat]||cat}</span>
      <div class="bd-bar-wrap"><div class="bd-bar" style="width:${pct.toFixed(0)}%"></div></div>
      <span class="bd-val">${brl(val)}</span>
    `;
    bd.appendChild(row);
  });
  if(!Object.keys(catTotals).length){
    bd.innerHTML = '<p class="empty-state" style="padding:16px 0">Nenhuma despesa lançada ainda.</p>';
  }
}

/* ---------- Configurações ---------- */
function renderConfig(){
  document.getElementById('c-consumo').value = state.settings.kmPorLitro;
  document.getElementById('c-gasolina').value = state.settings.precoGasolina;
  document.getElementById('c-imposto').value = state.settings.aliquotaImposto;
  document.getElementById('c-meta').value = state.settings.metaMensal;

  const table = document.getElementById('price-table');
  table.innerHTML = '';
  Object.entries(state.settings.prices).forEach(([key,cfg])=>{
    const row = document.createElement('div');
    row.className = 'price-row';
    row.innerHTML = `
      <span>${cfg.label}</span>
      <input type="number" step="0.01" min="0" data-price="${key}" value="${cfg.preco}">
    `;
    table.appendChild(row);
  });
}

document.getElementById('btn-save-config').addEventListener('click', ()=>{
  state.settings.kmPorLitro = parseFloat(document.getElementById('c-consumo').value) || DEFAULT_SETTINGS.kmPorLitro;
  state.settings.precoGasolina = parseFloat(document.getElementById('c-gasolina').value) || DEFAULT_SETTINGS.precoGasolina;
  state.settings.aliquotaImposto = parseFloat(document.getElementById('c-imposto').value) || 0;
  state.settings.metaMensal = parseFloat(document.getElementById('c-meta').value) || 0;
  document.querySelectorAll('[data-price]').forEach(inp=>{
    const key = inp.dataset.price;
    state.settings.prices[key].preco = parseFloat(inp.value) || 0;
  });
  saveState();
  populateTipoSelect();
  showToast('Configurações salvas.');
});

document.getElementById('btn-clear-data').addEventListener('click', ()=>{
  if(confirm('Tem certeza? Isso vai apagar todo o histórico salvo neste navegador, sem volta.')){
    localStorage.removeItem(STORAGE_KEY);
    state = { settings: structuredClone(DEFAULT_SETTINGS), entries: [] };
    populateTipoSelect();
    setView('dashboard');
    showToast('Todos os dados foram apagados.');
  }
});

/* ---------- Init ---------- */
populateTipoSelect();
prepFormDefaults();
renderDashboard();
