# FitVal · API del gimnasio

API con NestJS 11 y PostgreSQL 17 para consultar planes, clases y monitores, reservar plazas y gestionar clases y monitores con permisos de personal. Incluye registro, login con JWT, contraseñas protegidas con Argon2, subida de fotos y documentación con Swagger.

## API desplegada

- API: https://api-fitval-ksun.onrender.com
- Documentación (Swagger): https://api-fitval-ksun.onrender.com/docs
- Comprobación: https://api-fitval-ksun.onrender.com/api/v1/health

La API está en Render y la base de datos en Supabase. Con el plan gratuito, la primera petición tras un rato sin uso puede tardar alrededor de un minuto.

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

Configura `DATABASE_URL` con el usuario, la contraseña y la base de datos de `compose.yaml`, usando `localhost:5433`. `CORS_ORIGIN` indica la web que puede usar la API desde el navegador; en local, `http://localhost:5173`. Sustituye `JWT_SECRET=CAMBIAME` por una clave generada con:

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

Comprueba `GET http://localhost:3000/api/v1/health`:

```json
{ "status": "ok", "database": "fitval" }
```

La documentación de Swagger está en `http://localhost:3000/docs`.

## Rutas

Las rutas empiezan por `/api/v1`, salvo la versión paginada de las clases, que usa `/api/v2`.

| Método | Ruta                           | Acceso                                 | Función                                                    |
| ------ | ------------------------------ | -------------------------------------- | ---------------------------------------------------------- |
| GET    | `/api/v1/health`               | Público                                | Comprobar la conexión con PostgreSQL                       |
| GET    | `/api/v1/plans`                | Público                                | Ver planes, precios y número de socios                     |
| GET    | `/api/v1/classes`              | Público                                | Listar clases por fecha; admite `?activity=yoga`           |
| GET    | `/api/v2/classes`              | Público                                | Listar clases paginadas (`page`, `limit`, `sort`, `order`) |
| GET    | `/api/v1/classes/:id`          | Público                                | Consultar una clase                                        |
| POST   | `/api/v1/classes`              | Personal (`staff`)                     | Crear una clase                                            |
| DELETE | `/api/v1/classes/:id`          | Personal (`staff`)                     | Borrar una clase sin reservas                              |
| POST   | `/api/v1/classes/:id/bookings` | Usuario autenticado con socio asociado | Reservar una plaza                                         |
| GET    | `/api/v1/trainers/:id`         | Público                                | Consultar un monitor y sus especialidades                  |
| POST   | `/api/v1/trainers`             | Personal (`staff`)                     | Crear un monitor con sus especialidades                    |
| POST   | `/api/v1/trainers/:id/photo`   | Personal (`staff`)                     | Subir la foto de un monitor (PNG, JPG o WEBP, hasta 2 MB)  |
| POST   | `/api/v1/auth/register`        | Público                                | Registrar un usuario con rol `member`                      |
| POST   | `/api/v1/auth/login`           | Público                                | Obtener un token de acceso                                 |
| GET    | `/api/v1/auth/me`              | Usuario autenticado                    | Consultar el usuario actual                                |

## Autenticación y reservas

Para registrar a Ana, envía este JSON a `POST /api/v1/auth/register`:

```json
{
  "email": "ana@gym.com",
  "password": "12345678"
}
```

Haz login con los mismos datos en `POST /api/v1/auth/login`. En Postman, selecciona **Authorization → Bearer Token** y pega el `accessToken` recibido. Los tokens duran una hora y los permisos se consultan en la base de datos.

Una reserva se envía sin body. El correo del usuario debe coincidir con un socio de `members`: Ana corresponde al socio 1. La API devuelve `409` si la clase está llena o la reserva ya existe, `403` si el usuario no tiene socio asociado y `404` si la clase no existe.

Para probar los permisos de personal, registra primero `recepcion@fitval.com` mediante la API y cambia su rol:

```bash
docker exec -it postgres-fitval psql -U alumno -d fitval -c "UPDATE users SET role = 'staff' WHERE email = 'recepcion@fitval.com';"
```

En la API desplegada, el mismo `UPDATE` se ejecuta en el SQL Editor de Supabase.

## Fotos de los monitores

`POST /api/v1/trainers/:id/photo` recibe la imagen en el campo `photo` (form-data). El tipo se comprueba por el contenido del fichero, no por la extensión. La imagen se guarda en la carpeta `uploads/`, que la API sirve en `/uploads/...`, y su ruta en la columna `photo_url`.

En Render, `uploads/` está en el disco del servidor y se vacía en cada despliegue: la foto deja de existir aunque `photo_url` siga apuntando a ella. Para conservarlas habría que guardarlas en un almacenamiento externo, como Supabase Storage.

## Seguridad y errores

- **Cabeceras de seguridad** con Helmet. `crossOriginResourcePolicy` permite que otra web muestre las fotos de `/uploads`.
- **CORS:** solo la web indicada en `CORS_ORIGIN` puede leer las respuestas desde el navegador.
- **Límite de peticiones:** 20 por minuto en general y 5 por minuto en el login. Al superarlo, la API responde `429`. Con `trust proxy`, el límite se aplica por cliente también detrás del proxy de Render.
- **Formato común de errores:** todas las respuestas de error incluyen `statusCode`, `message`, `path` y `timestamp`. Los errores inesperados devuelven `500` con "Error interno del servidor" y la traza se registra solo en la consola del servidor.

## Comprobaciones

```bash
npm run lint
npm run build
npm test
npm run test:e2e
```

`npm test` ejecuta los tests unitarios, que no necesitan PostgreSQL. `npm run test:e2e` ejecuta los tests de integración de `test/fitval.e2e-spec.ts` contra la base de datos de Docker, así que necesita `postgres-fitval` arrancado.

GitHub Actions revisa HTML, ejecuta ESLint, compila el proyecto y pasa los tests unitarios en cada PR hacia `main` y cada push a `main`. Los tests de integración no se ejecutan en el CI porque necesitan PostgreSQL; las pruebas funcionales se documentan en las PR.

Las respuestas de la entrega están en [respuestas.md](respuestas.md).
