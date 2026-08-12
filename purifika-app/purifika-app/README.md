# Purifika — Painel Financeiro

App web (HTML/CSS/JS puro, sem build) para controlar orçamentos,
combustível, produtos, despesas e lucro do seu negócio de higienização
de estofados. Pronto para publicar na Vercel.

## Como publicar na Vercel (sem usar terminal)

1. Acesse https://vercel.com e crie uma conta (dá para usar Google ou GitHub).
2. Clique em **"Add New" → "Project"**.
3. Escolha a opção de **importar uma pasta / fazer upload** (ou suba esses
   arquivos para um repositório no GitHub e conecte o repositório — qualquer
   uma das duas formas funciona, pois é um site estático, sem build).
4. Quando perguntar o "Framework Preset", deixe como **Other** —
   não precisa de nenhum comando de build.
5. Clique em **Deploy**. Em menos de um minuto você recebe um link tipo
   `purifika.vercel.app` para acessar de qualquer lugar.

Se preferir usar o GitHub: crie um repositório, suba esta pasta inteira, e
na Vercel escolha "Import Git Repository" apontando para ele. Toda vez que
você atualizar o repositório, a Vercel republica automaticamente.

## Como os dados são salvos

O app salva tudo no **localStorage do navegador** (armazenamento local do
próprio Chrome/Safari/etc.). Isso significa:

- Os dados ficam salvos mesmo se você fechar a aba ou reiniciar o celular/computador.
- **Os dados são por navegador/aparelho.** Se você abrir o link no celular
  e depois no notebook, são dois históricos separados — não sincronizam
  entre si automaticamente.
- Limpar os dados de navegação do navegador (cache) apaga o histórico.

Para ter os dados sincronizados entre vários aparelhos (por exemplo, você
lançando pelo celular e vendo pelo computador de casa), o próximo passo
seria conectar um banco de dados real (Supabase é uma ótima opção gratuita
para começar). Se quiser, eu te ajudo a evoluir para isso depois — a
estrutura de dados (`state.entries`, dentro de `app.js`) já está pronta
para ser adaptada para salvar num banco em vez do navegador.

## O que o app já faz

- **Painel**: lucro líquido do mês, faturamento, despesas, ticket médio,
  km rodados e um medidor visual (a gota) mostrando o quanto você já
  atingiu da sua meta mensal.
- **Novo serviço**: escolhe o tipo (sofá, colchão, cadeira, carro...),
  o app já sugere o preço e o custo de produto, você informa a distância
  e ele calcula o combustível sozinho, mostrando o lucro do serviço em
  tempo real antes de salvar.
- **Histórico**: lista completa de receitas e despesas, filtrável por mês,
  com opção de excluir qualquer lançamento.
- **Análise mensal**: gráfico comparando faturamento, despesas e lucro
  dos últimos 6 meses, e o detalhamento de para onde vai cada real gasto
  (produto, combustível, equipamento, outras despesas).
- **Configurações**: ajuste o consumo do seu veículo, preço da gasolina,
  alíquota de imposto estimada, meta mensal e a tabela de preços de cada
  serviço — tudo editável, sem precisar mexer no código.

## Estrutura de arquivos

```
purifika-app/
├── index.html      -> estrutura da página
├── styles.css       -> identidade visual (cores, tipografia, layout)
├── app.js           -> toda a lógica (cálculos, salvar/carregar dados)
├── vercel.json       -> configuração mínima de deploy
└── README.md
```

## Rodando no seu computador antes de publicar (opcional)

Basta abrir o arquivo `index.html` diretamente no navegador — funciona
sem precisar de servidor nem internet, já que não depende de backend.
