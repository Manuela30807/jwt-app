# jwt-app — Sistema de Biblioteca (front-end)

Next.js 16 (App Router) que consome a `jwt-api`.

## Como rodar

```bash
npm install
cp .env.example .env.local      # API_URL=http://localhost:3000/v1
npm run dev                     # http://localhost:3001  (a API usa a 3000)
```

Suba antes a `jwt-api` e entre com o admin do seed (`admin@biblioteca.com` / `123456`).

## Como funciona a sessão e o refresh automático

O navegador **nunca vê os tokens**. Eles ficam em cookies `httpOnly` (`access_token`, `refresh_token`, `user`):

- **Login/Logout**: server actions (`actions/login.ts`, `actions/logout.ts`). O logout revoga o refresh token na API.
- **Chamadas à API**: as telas chamam `/api/proxy/...` (`app/api/proxy/[...path]/route.ts`), um handler no servidor que lê os cookies, chama a API com `Authorization: Bearer` e, ao receber **401**, renova o par de tokens e repete a requisição original — o usuário não percebe.
- **Fila única de refresh** (`lib/refresh.ts`): se várias requisições recebem 401 ao mesmo tempo, sai só **uma** chamada a `/auth/refresh`; as outras aguardam a mesma promessa. O resultado é reaproveitado por 30 s para que requisições que já estavam a caminho com o cookie antigo não reenviem um refresh já rotacionado (a API trataria isso como roubo e derrubaria a sessão).
- **Refresh inválido/expirado**: os cookies são apagados e o front volta para o login.
- `proxy.ts` (antigo middleware) manda quem não tem sessão para `/`. Menus de administrador ficam ocultos para atendentes, mas **quem decide é a API** (403).

### Riscos da escolha de armazenamento

Cookies `httpOnly` impedem que um XSS leia os tokens (ao contrário de `localStorage`). Como contrapartida, cookies são enviados automaticamente, então há risco de CSRF; mitigado por `SameSite=Lax` e porque o handler só aceita as rotas da API. Em produção, use HTTPS (`secure` é ligado quando `NODE_ENV=production`).

## Telas

Login · Dashboard (admin: relatório completo; atendente: resumo) · Livros (filtros, vários autores) · Categorias · Autores · Leitores (+ histórico) · Empréstimos (novo, filtro por status, devolução com multa) · Atendentes (somente admin: cadastro, edição, ativar/desativar).

## Vídeo de apresentação

[Assistir ao vídeo do projeto](https://drive.google.com/file/d/1Po7-PIUL0AptQ-MbCeCsCmkUpg0GcKjo/view?usp=sharing)
