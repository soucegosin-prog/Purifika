# Purifika Premium — Painel Financeiro

Site/app de página única (tudo dentro de `index.html`) para controlar
orçamentos, combustível, estoque de produtos Spartan e lucro do negócio
de higienização de estofados.

## IMPORTANTE: como confirmar que a atualização foi publicada

Depois de subir este arquivo na Vercel, abra o link e vá em "Novo
serviço". Se aparecer o botão **"Adicionar item à visita"**, a versão
nova está no ar. Se aparecer só um botão **"Salvar serviço"** (sem
carrinho) e um campo "Desgaste de equipamento", a Vercel ainda está
servindo a versão antiga — o deploy não foi concluído ou pegou o
arquivo errado.

## Como publicar na Vercel

1. Entre no seu projeto `purifika` na Vercel.
2. Vá na aba "Deployments" (ou nas configurações do projeto) e suba
   este `index.html` como novo deploy — substituindo o antigo.
3. Espere a mensagem de "Deployment Ready" antes de testar.
4. Abra o link em uma aba anônima/privada (ou aperte Ctrl+Shift+R para
   forçar recarregar sem cache) — navegadores guardam o site antigo em
   cache e às vezes mostram a versão velha mesmo depois de publicado.

## Como os dados são salvos

Tudo fica salvo no localStorage do navegador — por aparelho, não
sincroniza sozinho entre celular e computador. Por isso agora existe
uma seção de **Backup** em Configurações: baixe o arquivo `.json` de
vez em quando (principalmente antes de trocar de celular ou limpar o
navegador) e guarde num lugar seguro (Google Drive, e-mail para você
mesmo, etc.). Para trazer os dados de volta, use "Restaurar backup" e
selecione o arquivo baixado.

## O que o app faz

- Painel com lucro do mês, meta visual (a gota), faturamento, despesas,
  ticket médio e km rodados.
- Novo serviço em formato de **visita com vários itens e quantidade**:
  você preenche cliente/data/distância uma vez, toca no tipo de
  serviço, ajusta a quantidade (ex: 4 cadeiras) e o valor por unidade,
  e adiciona à visita. Repete para outros tipos (ex: +1 sofá, +2
  poltronas) e salva tudo junto no final. O combustível é calculado
  uma vez por visita, não repetido por item.
- Depois de salvar, aparece um recibo mostrando quanto guardar para
  gasolina, quanto guardar para repor produto, e quanto sobra líquido
  daquela visita.
- Controle dos 3 produtos Spartan (Xtraction II, Contempo V e
  Finisherfresh): cada item desconta os mililitros usados do estoque.
- Estoque em litros: quanto sobrou, quanto foi consumido no mês e
  quantos litros comprar.
- Histórico completo, filtrável por mês, com opção de excluir.
- Análise mensal: gráfico dos últimos 6 meses (soma todos os
  lançamentos do mês, item por item) e detalhamento de despesas.
- Backup: exportar/restaurar todos os dados em um arquivo `.json`.
- Configurações: preço por litro de cada produto Spartan, consumo do
  veículo, preço da gasolina, imposto estimado, meta mensal e tabela
  de preços.

## Produtos Spartan configurados

- Xtraction II — extrator concentrado, preço padrão R$ 100 a cada 5L.
- Contempo V — limpador neutro para estofados claros/brancos, preço
  padrão R$ 17/L.
- Finisherfresh — finalizador/odorizador, preço padrão R$ 35/L.

Edite os preços em "Configurações" sempre que o valor de compra mudar.
