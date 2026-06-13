# 🍳 Receitas Flav-ia

Aplicativo híbrido de receitas focado em usabilidade e praticidade na cozinha, desenvolvido com tecnologias web modernas e empacotado nativamente para dispositivos móveis.

---

## 🚀 Tecnologias Utilizadas

* **Frontend:** Vite + React / Vue / Svelte *(ajuste para o seu framework framework)*
* **Mobile Runtime:** [Capacitor CLI](https://capacitorjs.com/)
* **Estilização:** Tailwind CSS *(se estiver usando)*
* **Esteira de CI/CD:** GitHub Actions (Compilação automatizada de APKs)

---

## 📦 Pré-requisitos locais

Antes de rodar o projeto localmente, certifique-se de ter instalado:
* **Node.js** >= 22.0.0
* **Java JDK** == 21 (Recomendado: Eclipse Temurin ou JetBrains Runtime)
* **Android Studio** (atualizado para suporte à API 35 do Android 15)

---

## ⚙️ Como Executar o Projeto Localmente

### 1. Clonar o Repositório e Instalar Dependências
```bash
git clone [https://github.com/seu-usuario/receitas-flav-ia.git](https://github.com/seu-usuario/receitas-flav-ia.git)
cd receitas-flav-ia
npm install
2. Executar o Servidor de Desenvolvimento (Web)
Bash
npm run dev
📱 Fluxo de Desenvolvimento Mobile (Capacitor)
Sempre que fizer alterações nos arquivos do frontend e quiser testá-las no ambiente mobile ou gerar um novo build, siga as etapas abaixo:

1. Gerar o Build do Frontend
Compila os arquivos web na pasta de distribuição (ex: dist ou build):

Bash
npm run build
2. Sincronizar com o Projeto Android
Copia os arquivos compilados do frontend para dentro da pasta nativa do Android:

Bash
npx cap sync android
3. Abrir o Projeto no Android Studio
Para rodar em um emulador, celular físico ou debugar erros nativos:

Bash
npx cap open android
🤖 Automação e CI/CD (GitHub Actions)
Este projeto conta com uma esteira de integração contínua configurada.

Como funciona: Toda vez que um git push é realizado nas branches principais (main ou master), o robô do GitHub monta um ambiente virtual com Node 22 e Java 21, sincroniza o Capacitor e compila o aplicativo automaticamente.

Como baixar o APK gerado: 1. Vá até a aba Actions no repositório do GitHub.
2. Clique no build mais recente que terminou com sucesso.
3. Desça até a seção Artifacts no final da página e faça o download do pacote app-debug.

🗺️ Quadro de Histórias / Funcionalidades
[x] #001 - Configuração do ambiente e inicialização do Capacitor

[x] #002 - Estrutura básica de build e esteira de CI/CD integrada

[ ] #003 - Modo Cozinha (Visualização e Usabilidade) 🔄 Próximo passo