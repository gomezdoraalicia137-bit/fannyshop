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
- Prisma 6 · SQLite (cambiable a PostgreSQL/MySQL desde `prisma/schema.prisma`)
- Sesiones JWT httpOnly con `jose` · contraseñas con `bcryptjs`
- Recharts para gráficos · Zod para validación

## Puesta en marcha

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Variables de entorno en `.env` (ver `.env.example`). Genera un `AUTH_SECRET` propio antes de producción.

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
