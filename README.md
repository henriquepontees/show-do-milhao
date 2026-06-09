# Show do Milhão

Quiz web no estilo "Show do Milhão", **somente frontend**, feito com **Vue 3 + Vite**.
As perguntas vêm de um arquivo JSON estático. SPA pura, sem backend.

## O que é

MVP mínimo de perguntas e respostas:

1. **Escolha de fase** — 4 fases por dificuldade (1 = mais fácil, 4 = mais difícil).
2. **Pergunta** — ao escolher a fase, uma pergunta é sorteada aleatoriamente dela.
   Mostra o enunciado, 4 alternativas selecionáveis e os botões **Voltar** (volta
   à escolha de fase sem revelar nada) e **Confirmar** (revela a alternativa
   correta destacada em **verde**, estilo Show do Milhão). Depois de revelar, o
   botão **Continuar** retorna à escolha de fase.

Cada rodada é independente: sem prêmio, sem placar, sem login, sem progressão,
sem vitória/derrota.

### Sessão e não-repetição

O app mantém uma **sessão em memória** (vale para a execução atual da aba). Dentro
da mesma sessão, uma pergunta já exibida **não se repete** — controle feito por
fase. Se as perguntas de uma fase se esgotarem, o app avisa e oferece reiniciar a
sessão. O botão **Reiniciar sessão** zera o histórico de perguntas vistas. Nada é
persistido entre recarregamentos: recarregar/reabrir a aba começa uma sessão nova.

## Como rodar localmente

Requer Node.js 18+.

```bash
npm install
npm run dev
```

Abra a URL que o Vite mostrar (geralmente http://localhost:5173).

Outros scripts:

```bash
npm run build     # gera a versão de produção em dist/
npm run preview   # serve localmente o conteúdo de dist/
```

## Onde / como editar as perguntas

Todas as perguntas ficam em um único arquivo:

```
src/data/questions.json
```

O conteúdo atual é **placeholder fictício** (5 por fase) só para o app funcionar.
Substitua livremente — quantidade, temas e detalhes ficam a seu critério.

### Esquema do JSON

Objeto com as chaves `"1"`, `"2"`, `"3"`, `"4"` (as fases). Cada chave aponta para
um array de perguntas. Cada pergunta tem:

| Campo          | Tipo       | Descrição                                                       |
| -------------- | ---------- | --------------------------------------------------------------- |
| `id`           | string     | Identificador único da pergunta (usado no controle de sessão).  |
| `enunciado`    | string     | Texto da pergunta.                                              |
| `alternativas` | string[4]  | Exatamente 4 alternativas.                                      |
| `correta`      | number     | Índice (0–3) da alternativa correta dentro de `alternativas`.   |

Exemplo:

```json
{
  "1": [
    {
      "id": "f1-q1",
      "enunciado": "Qual é a capital do Brasil?",
      "alternativas": ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"],
      "correta": 0
    }
  ],
  "2": [],
  "3": [],
  "4": []
}
```

Observações:

- `correta` é **índice baseado em zero**: `0` = primeira alternativa, `3` = quarta.
- Mantenha 4 itens em `alternativas` (a UI renderiza A, B, C, D).
- Use `id` único por pergunta para a não-repetição na sessão funcionar bem.
- Pode haver quantas perguntas quiser por fase; uma é sorteada por rodada.

## Deploy estático na Vercel (free)

O projeto é estático puro (sem serverless). A Vercel detecta o Vite
automaticamente.

### Pela interface (importando o repositório)

1. Faça push do repositório para o GitHub/GitLab/Bitbucket.
2. Em https://vercel.com → **Add New… → Project** e importe o repositório.
3. A Vercel detecta o framework **Vite**. Confirme as configurações:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - Nenhuma variável de ambiente é necessária.
4. **Deploy.** Pronto.

O arquivo [`vercel.json`](./vercel.json) já inclui o fallback de SPA (todas as
rotas servem `index.html`).

### Pela CLI

```bash
npm i -g vercel
vercel          # primeiro deploy (preview)
vercel --prod   # deploy de produção
```

## Estrutura do projeto

```
index.html
vite.config.js
vercel.json
src/
  main.js
  App.vue                     # estado da sessão + alterna entre as 2 telas
  style.css                   # estilos globais / tema
  data/questions.json         # << edite as perguntas aqui
  composables/
    useSession.js             # sorteio sem repetição + reiniciar sessão
  components/
    PhaseSelect.vue           # Tela 1: escolha de fase
    QuestionView.vue          # Tela 2: pergunta e revelação
```
