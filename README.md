# FitVal · API del gimnasio

API con NestJS 11 y PostgreSQL 17 para consultar planes y clases, reservar plazas y gestionar clases con permisos de personal. Incluye registro, login con JWT y contraseñas protegidas con Argon2.

## Puesta en marcha

Necesitas Node.js 24, npm y Docker con Docker Compose.

### 1. Instalar las dependencias

```bash
git clone https://github.com/KevinLarriega98/api-fitval.git
cd api-fitval
npm ci
```

### 2. Configurar el entorno

Copia `.env.example` como `.env`. En PowerShell:

```powershell
Copy-Item .env.example .env
```

Configura `DATABASE_URL` con el usuario, la contraseña y la base de datos de `compose.yaml`, usando `localhost:5433`. Sustituye `JWT_SECRET=CAMBIAME` por una clave generada con:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

El archivo `.env` está excluido de Git.

### 3. Preparar PostgreSQL

```bash
docker compose up -d
```

Carga las tablas y los datos de ejemplo desde PowerShell:

```powershell
Get-Content -Encoding UTF8 database/schema.sql | docker exec -i postgres-fitval psql -U alumno -d fitval
```

En Git Bash, macOS o Linux:

```bash
docker exec -i postgres-fitval psql -U alumno -d fitval < database/schema.sql
```

**Ejecutar `schema.sql` borra las tablas y vuelve a cargar los datos de ejemplo. Los usuarios registrados también se borran y la tabla `users` queda vacía.**

### 4. Arrancar la API

```bash
npm run start:dev
```

Comprueba `GET http://localhost:3000/api/health`:

```json
{ "status": "ok", "database": "fitval" }
```

## Rutas

Todas las rutas empiezan por `/api`.

| Método | Ruta                    | Acceso                                 | Función                                          |
| ------ | ----------------------- | -------------------------------------- | ------------------------------------------------ |
| GET    | `/health`               | Público                                | Comprobar la conexión con PostgreSQL             |
| GET    | `/plans`                | Público                                | Ver planes, precios y número de socios           |
| GET    | `/classes`              | Público                                | Listar clases por fecha; admite `?activity=yoga` |
| GET    | `/classes/:id`          | Público                                | Consultar una clase                              |
| POST   | `/classes`              | Personal (`staff`)                     | Crear una clase                                  |
| DELETE | `/classes/:id`          | Personal (`staff`)                     | Borrar una clase sin reservas                    |
| POST   | `/classes/:id/bookings` | Usuario autenticado con socio asociado | Reservar una plaza                               |
| POST   | `/auth/register`        | Público                                | Registrar un usuario con rol `member`            |
| POST   | `/auth/login`           | Público                                | Obtener un token de acceso                       |
| GET    | `/auth/me`              | Usuario autenticado                    | Consultar el usuario actual                      |

## Autenticación y reservas

Para registrar a Ana, envía este JSON a `POST /api/auth/register`:

```json
{
  "email": "ana@gym.com",
  "password": "12345678"
}
```

Haz login con los mismos datos en `POST /api/auth/login`. En Postman, selecciona **Authorization → Bearer Token** y pega el `accessToken` recibido. Los tokens duran una hora y los permisos se consultan en la base de datos.

Una reserva se envía sin body. El correo del usuario debe coincidir con un socio de `members`: Ana corresponde al socio 1. La API devuelve `409` si la clase está llena o la reserva ya existe, `403` si el usuario no tiene socio asociado y `404` si la clase no existe.

Para probar los permisos de personal, registra primero `recepcion@fitval.com` mediante la API y cambia su rol:

```bash
docker exec -it postgres-fitval psql -U alumno -d fitval -c "UPDATE users SET role = 'staff' WHERE email = 'recepcion@fitval.com';"
```

## Comprobaciones

```bash
npm run lint
npm run build
```

GitHub Actions revisa HTML, ejecuta ESLint y compila el proyecto en cada PR hacia `main` y cada push a `main`. Las pruebas funcionales se documentan en las PR. El archivo `test/app.e2e-spec.ts` conserva la prueba inicial de NestJS y todavía no está adaptado a esta API.

Las respuestas de la entrega están en [respuestas.md](respuestas.md).
