# FannyShop

Tienda de tarjetas regalo, códigos digitales y suscripciones. Incluye tienda pública gaming/neón, panel administrativo tipo SaaS, inventario de códigos, sistema centralizado de precios y órdenes con precio histórico.

## Marca

- `public/logo-mark.svg` — isotipo hexagonal con la "F" y degradado neón (se usa en header, footer y panel).
- `public/logo.svg` — logotipo completo con wordmark para documentos y material externo.
- `src/app/icon.svg` — favicon.
- `src/app/opengraph-image.tsx` — imagen para redes sociales generada con el nombre y eslogan configurados.

Puedes reemplazar el logo sin tocar código desde **Configuración → URL del logo**.

## Stack

- Next.js 16 (App Router, Server Components, Server Actions)
- TypeScript · Tailwind CSS v4
- Prisma 6 · PostgreSQL mediante el driver serverless de Neon
- Sesiones JWT httpOnly con `jose` · contraseñas con PBKDF2 (WebCrypto)
- Recharts para gráficos · Zod para validación

## Puesta en marcha

```bash
npm install
cp .env.example .env      # coloca tu DATABASE_URL de Neon y un AUTH_SECRET propio
npm run db:push
npm run db:seed
npm run dev
```

La aplicación usa **la misma base PostgreSQL en desarrollo y en producción**, así que lo que pruebas en local se comporta igual una vez desplegado.

## Cuentas de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | admin@fannyshop.app | Admin123! |
| Empleado | staff@fannyshop.app | Staff123! |
| Cliente | cliente@fannyshop.app | Cliente123! |

## Sistema de precios

El precio final nunca se escribe en componentes: se calcula en `src/lib/pricing.ts`.

```
costo → + IVA → + margen (sobre costo con IVA) → + comisión → regla de redondeo → precio final
```

Jerarquía de configuración: denominación → producto → global (`Configuración` y `Precios` en el panel).
Reglas de redondeo: sin redondeo, `.00`, `.49`, `.99`, siguiente dólar.

Ejemplo: costo $10.00, IVA 13%, margen 10%, redondeo `.49` → **$12.49**.

Las órdenes guardan costo, IVA, margen, comisión, redondeo y precio unitario del momento de la compra, por lo que cambiar las reglas no altera órdenes ni reportes anteriores.

## Inventario y entrega

Estados de código: `AVAILABLE → RESERVED → SOLD/DELIVERED`, con `CANCELLED` al cancelar o reembolsar (el stock se libera). Al crear la orden se reservan códigos dentro de una transacción; si `autoDelivery` está activo se entregan al aprobar el pago. Los códigos nunca aparecen en URLs ni en el catálogo público; el cliente solo ve los suyos cuando la orden está entregada.

## Roles

- **ADMIN**: acceso completo.
- **STAFF**: órdenes, productos, categorías, inventario y clientes.
- **CUSTOMER**: compra, perfil, órdenes y códigos entregados.

Rutas protegidas por middleware, guardas en servidor y `requireAdmin`/`requireStaff` en cada acción.

## Estructura

```
prisma/            esquema y seed
src/app/(shop)     tienda pública
src/app/(auth)     login, registro, recuperación
src/app/admin      panel administrativo
src/app/api        endpoints (auth, carrito, órdenes, contacto)
src/components     ui, shop, admin, effects
src/lib            pricing, auth, utils, actions, services
```

## Integraciones pendientes

Los pagos se registran y gestionan internamente; las credenciales de Stripe, PayPal, Binance Pay y SMTP quedan declaradas en `.env` para conectar los proveedores reales sin cambiar la arquitectura.

---

# Despliegue en Cloudflare

## Por qué Workers y no `pages.dev`

Cloudflare Pages está en modo desaconsejado y para Next.js solo documenta *exports estáticos*, que dejarían la tienda sin carrito, checkout, sesiones ni panel. El adaptador que daba dominios `pages.dev` (`@cloudflare/next-on-pages`) está **deprecado** por Cloudflare.

La ruta soportada es **Cloudflare Workers** con `@opennextjs/cloudflare`, ya configurado en este proyecto. Obtendrás un dominio gratuito:

```
https://fannyshop.<tu-subdominio>.workers.dev
```

Es el mismo plan gratuito que Pages y admite dominio propio (`fannyshop.com`) sin costo adicional.

## Paso 1 — Base de datos Postgres

SQLite no funciona en Cloudflare porque no hay disco persistente. **No uses D1**: Prisma documenta que D1 ignora silenciosamente las transacciones, lo que rompería la reserva de códigos y dos clientes podrían recibir el mismo código.

Usa Postgres (Neon tiene plan gratuito):

1. Crea un proyecto en [neon.com](https://neon.com) y copia la cadena de conexión (`postgresql://...`).
2. Colócala en `.env` como `DATABASE_URL` y crea el esquema:

```bash
npm run db:push
npm run db:seed
```

Usa la cadena **pooled** (la que incluye `-pooler` en el host) tanto en local como en Cloudflare.

## Paso 2 — Subir el código a GitHub

El repositorio Git ya está inicializado con el primer commit. En Windows el empaquetado local de Cloudflare falla al crear symlinks (limitación del sistema operativo), por eso conviene que **Cloudflare compile en sus servidores Linux**:

```bash
git remote add origin https://github.com/<tu-usuario>/fannyshop.git
git push -u origin main
```

## Paso 3 — Crear el Worker en Cloudflare

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Import a repository**.
2. Selecciona el repositorio y configura:
   - **Build command**: `npx opennextjs-cloudflare build`
   - **Deploy command**: `npx wrangler deploy`
3. Añade las variables de entorno (marca `DATABASE_URL` y `AUTH_SECRET` como **Secret**):

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | tu cadena de Neon |
| `AUTH_SECRET` | cadena aleatoria de 32+ caracteres |
| `NEXT_PUBLIC_SITE_URL` | `https://fannyshop.<subdominio>.workers.dev` |

Genera el secreto con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Alternativa — Despliegue desde tu equipo

Requiere WSL o Linux/macOS (por el problema de symlinks en Windows):

```bash
npx wrangler login
npx wrangler secret put DATABASE_URL
npx wrangler secret put AUTH_SECRET
npm run cf:deploy
```

En Windows puedes habilitar el **Modo de desarrollador** (Configuración → Sistema → Para programadores) para permitir symlinks y usar `npm run cf:deploy` directamente.

## Paso 4 — Después del despliegue

1. Inicia sesión con `admin@fannyshop.app` y **cambia la contraseña** desde *Administradores*.
2. Ajusta nombre, correo, teléfono y textos legales en *Configuración*.
3. Revisa las reglas de IVA, margen y redondeo en *Precios*.
4. Importa tus códigos reales en *Inventario* y elimina los de demostración.

## Notas técnicas

- Las contraseñas usan **PBKDF2 con WebCrypto** (no bcrypt) porque el plan gratuito de Workers limita la CPU a 10 ms por petición y bcrypt consume 50-150 ms. Los hashes antiguos de bcrypt se siguen validando y se migran automáticamente en el primer inicio de sesión.
- Las consultas viajan por **HTTP** (`poolQueryViaFetch`), lo que evita el error `Cannot perform I/O on behalf of a different request` de Workers al reutilizar sockets entre peticiones.
- Las **transacciones interactivas** (reserva de códigos) necesitan WebSocket, así que `withTransaction` abre una conexión dedicada y la cierra al terminar.
- Todas las lecturas de catálogo, sesión y configuración degradan a valores por defecto si la base no responde, de modo que la tienda nunca devuelve error 500 por un fallo de base de datos.
- Las variables se leen de `process.env` y, como respaldo, del contexto de Cloudflare.
- `compatibility_flags` incluye `nodejs_compat`, requerido por Prisma.
- `public/_headers` fija el cacheo inmutable de los assets estáticos.

## Variables en Cloudflare

Cloudflare distingue dos lugares con nombres casi idénticos:

| Variable | Dónde va |
| --- | --- |
| `DATABASE_URL` | **Settings → Runtime variables and secrets** (tipo Secret) |
| `AUTH_SECRET` | **Settings → Runtime variables and secrets** (tipo Secret) |
| `NEXT_PUBLIC_SITE_URL` | **Settings → Builds → Variables and secrets** (se incrusta al compilar) |

Colocar las dos primeras en la sección de *Builds* no funciona: solo existen durante la compilación y el sitio arranca sin base de datos.
