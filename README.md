# 🐺 Coyotes do Basquetebol — Site Oficial

Site oficial do Coyotes do Basquetebol e do evento **Baskferia**.
Next.js 15 + Tailwind CSS. Imagens servidas pelo **Cloudinary**.

---

## ⚡ Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

---

## ☁️ Configurando o Cloudinary (5 minutos)

### 1 — Criar conta gratuita
Acesse cloudinary.com — plano grátis tem 25GB de armazenamento e 25GB/mês de banda.

### 2 — Pegar credenciais
- **Cloud Name** → topo do Dashboard
- **API Key** e **API Secret** → Settings → Access Keys

### 3 — Preencher o .env.local
```env
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

CLOUDINARY_GALLERY_FOLDER=coyotes/gallery
CLOUDINARY_HERO_FOLDER=coyotes/hero
CLOUDINARY_LOGOS_FOLDER=coyotes/logos
```

### 4 — Criar pastas no Cloudinary (Media Library)
```
coyotes/
├── gallery/    ← fotos da galeria
├── hero/       ← foto do time completo
└── logos/      ← logos do Coyotes e Baskferia
```

### 5 — Fazer upload
Qualquer pessoa do time arrasta as fotos para a pasta correta no painel do Cloudinary. O site atualiza em até 60 segundos, sem código.

---

## 🖼️ O que vai em cada pasta

| Imagem | Pasta no Cloudinary |
|--------|---------------------|
| Logo Coyotes | `coyotes/logos/` |
| Logo Baskferia | `coyotes/logos/` |
| Foto do time (hero) | `coyotes/hero/` |
| Fotos da galeria | `coyotes/gallery/` |

Cloudinary aceita JPG, PNG, WebP, HEIC — pode subir direto do celular sem compressão prévia. As imagens chegam para o usuário já convertidas para WebP/AVIF e redimensionadas.

---
 
## 📸 Integração Instagram (Opcional)
 
O componente `InstaFeed.tsx` está preparado para exibir o feed, mas requer a configuração da API oficial do Meta para funcionar com dados reais.
 
1.  **Criar App no Meta** → Acesse [Facebook Developers](https://developers.facebook.com/) e crie um App do tipo "Consumidor".
2.  **Adicionar Instagram** → Painel do App → Adicionar Produto → "Instagram Basic Display".
3.  **Configurar Basic Display** → Siga o passo a passo do Meta para adicionar um usuário de teste do Instagram.
4.  **Gerar Token** → Nas configurações do Basic Display, gere um **Long-Lived Access Token** (válido por 60 dias).
5.  **Preencher o .env.local** (veja seção de variáveis acima).
 
### 💡 Alternativa Simples (Sem Facebook)
Se você não tem uma conta do Facebook vinculada ou quer evitar a complexidade do Meta Developers, use o **[Behold.so](https://behold.so/)**:
1.  Crie uma conta gratuita no Behold.
2.  Conecte seu Instagram (é feito via login direto, sem precisar de App no Meta).
3.  O Behold te dará uma **URL de API (JSON)**.
4.  No código (`components/InstaFeed.tsx`), basta substituir a busca dos posts por esse link.
 
*Nota: O componente atual exibe um mockup elegante até que a integração da API seja concluída no código (veja comentários em `components/InstaFeed.tsx`).*
 
---

## 📁 Estrutura

```
├── app/
│   ├── layout.tsx
│   ├── page.tsx               → Página principal (Coyotes)
│   ├── baskferia/page.tsx     → Página do evento
│   └── api/gallery/route.ts
├── components/
│   ├── DynamicGallery.tsx     → Busca imagens do Cloudinary (Server Component)
│   ├── InstaFeed.tsx          → Placeholder Instagram
│   ├── MarqueeStrip.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/
│   └── cloudinary.ts          → Client da API Cloudinary (só servidor)
└── .env.example               → Template de variáveis
```

---

## 🚀 Deploy (Vercel)

O site foi otimizado para a plataforma **Vercel**, suportando todas as funções dinâmicas (Server Components e API Proxy).

1.  **GitHub** → Crie um repositório e suba o projeto.
2.  **Vercel** → Vá em [vercel.com](https://vercel.com/) e importe o repositório.
3.  **Ambiente** → Adicione as seguintes variáveis no painel da Vercel (Environment Variables):
    *   `CLOUDINARY_CLOUD_NAME`
    *   `CLOUDINARY_API_KEY`
    *   `CLOUDINARY_API_SECRET`
    *   `NEXT_PUBLIC_BEHOLD_URL_COYOTES`
    *   `NEXT_PUBLIC_BEHOLD_URL_BASKFERIA`
    *   `CLOUDINARY_GALLERY_FOLDER` (ex: `coyotes/gallery`)
    *   `CLOUDINARY_HERO_FOLDER` (ex: `coyotes/hero`)
    *   `CLOUDINARY_LOGOS_FOLDER` (ex: `coyotes/logos`)
4.  **Build** → Clique em Deploy. O site estará online com domínio gratuito ou próprio.
