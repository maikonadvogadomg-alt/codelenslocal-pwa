# CodeLens — fora da Replit, rodando no seu PC

É o mesmo CodeLens de antes, com as mesmas telas: projetos, editor, IA, terminal, preview, GitHub, Playground e Assistente. A diferença é que **não depende mais da Replit**.

## Como abrir

**Windows**
1. Instale o **Node.js** (versão "LTS") em https://nodejs.org. Só precisa fazer isso uma vez.
2. **Extraia** o .zip: botão direito → "Extrair tudo…". Não abra de dentro do .zip.
3. Dê dois cliques em **`iniciar.bat`**.
   - Na **primeira vez**, ele baixa as peças e demora alguns minutos.
   - Depois ele abre o navegador sozinho em **http://localhost:8080**.
4. Deixe a janela preta aberta enquanto usa. Para desligar, feche essa janela.

**Celular (Termux), Linux ou Mac:** rode `sh iniciar.sh`. No Termux, instale o Node antes com `pkg install nodejs-lts`.

## Onde ficam as suas coisas
Tudo fica na pasta **`dados/`**, ao lado do programa:
- `dados/projetos/` guarda os projetos (os arquivos de verdade);
- `dados/banco/` guarda o banco de dados: lista de projetos, configurações, chaves e salvos do Playground.

**Para fazer cópia de segurança**, copie a pasta `dados` inteira para o Google Drive ou um pendrive. Dá para mudar o programa de lugar ou de computador que os projetos vêm junto, desde que a pasta `dados` vá também.

## O que foi consertado (por que não rodava em lugar nenhum)

| Problema | Por quê | O que foi feito |
|---|---|---|
| "Abria e fechava" | A receita da Replit desligava sozinha quando não achava PORT e BASE_PATH | O servidor agora usa a porta 8080 sozinho |
| Erro de "plugin" no preview e tela branca | Uma linha do `playground.tsx` (`<T>(`) estava escrita de um jeito que só passava na Replit e quebrava a montagem em todo o resto | A linha foi corrigida para `<T,>(` |
| "404" e "metade de um HTML" ao salvar ou importar | A tela e o servidor eram dois programas, e só a Replit ligava um no outro | Agora o servidor também mostra a tela, tudo no mesmo endereço |
| "Comando de script não existe" | Faltava o `package.json` com os comandos | Arquivo criado (`npm run iniciar`, `start`, `build`, `dev`) |
| Faltavam as peças `@workspace/...` | Elas ficaram presas no monorepo da Replit | Foram recriadas na pasta `lib/` |
| Banco Neon (precisava de senha e de internet) | — | Agora o banco fica numa pasta do PC (`dados/banco`), sem senha e sem internet |
| Projetos sumiam | A Replit guardava tudo em `/tmp`, que é apagado | Agora tudo fica em `dados/projetos` |
| Terminal com erro no Windows | Ele só sabia usar o `sh`, que é do Linux | No Windows usa o `cmd`; no Linux e no Termux continua com o `sh` |
| Tela presa numa versão velha | O service worker usava a cópia guardada antes da nova | Agora pega primeiro a versão nova |
| Playground logo de cara | — | Playground e Assistente foram para o cantinho, junto da Configuração; a tela inicial mostra os seus projetos |

## IA
Cole a sua chave em **Configurações** (Groq, Gemini, OpenRouter…). O "Gemini da Replit" não existe fora de lá.

## Para quem mexe no código
- `npm run dev` liga a tela (5173) e o servidor (8080) juntos, com o "carteiro" do `/api`, e atualiza enquanto você edita.
- `npm run build` monta a tela em `dist/`.
- `npm start` liga só o servidor, que também mostra a tela de `dist/`.
- O arquivo `.github/workflows/teste.yml` testa tudo sozinho no GitHub, no Linux e no Windows, a cada envio. Se ficar verde, está funcionando.

## Pastas
| Pasta | O que é |
|---|---|
| `src/` | a tela (React) |
| `server/` | o servidor (antes se chamava "api server") |
| `lib/db` | o banco local (substitui o `@workspace/db`) |
| `lib/api-zod` | a conferência dos pedidos (substitui o `@workspace/api-zod`) |
| `lib/api-client-react` | a ligação da tela com o servidor (substitui o `@workspace/api-client-react`) |
| `public/` | ícones, manifest e service worker |
| `scripts/iniciar.mjs` | o que o `iniciar.bat` usa: instala, monta, liga e abre o navegador |
