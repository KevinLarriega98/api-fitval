## Ejercicio 0

Al intentar hacer push directamente a `main`, GitHub rechazó la operación:

```text
remote: - Changes must be made through a pull request.
```

La rama está protegida y los cambios deben entrar mediante una pull request.

## Ejercicio 1

El cliente recibe un código 500 con el mensaje genérico "Internal server error".
En la terminal aparece ECONNREFUSED, las direcciones y el puerto 5433, además de la traza del error; estos detalles permiten depurar el fallo sin exponer información interna al cliente.

## Ejercicio 3 — Pregunta 2

La versión insegura devuelve 7 clases; la parametrizada con `$1`, 0 clases.

En la versión insegura, PostgreSQL recibe esta consulta:

```sql
SELECT c.id, c.activity, c.room, c.starts_at, c.spots,
       t.name AS trainer_name
FROM classes c
JOIN trainers t ON t.id = c.trainer_id
WHERE c.activity ILIKE '%zzz' OR 1=1 --%' ORDER BY c.starts_at
```

La comilla cierra el texto, `OR 1=1` hace que todas las filas cumplan la condición y `--` comenta el resto. Con `$1`, el valor se trata como un dato, no como instrucciones SQL, y ninguna actividad coincide.

## Ejercicio 4 — Pregunta 3

Comprobamos que el monitor existe para devolver un 400 con un mensaje claro cuando el cliente envía un `trainerId` inexistente en el body. Sin esa comprobación ni un manejo específico del error de clave ajena, PostgreSQL rechazaría la inserción y el cliente recibiría un 500 genérico.

## Ejercicio 4 — Pregunta 4

Borrar una clase con reservas devuelve 409 porque la petición es válida, pero entra en conflicto con el estado actual de la clase: tiene reservas asociadas. Un 400 indicaría que los datos de la petición son incorrectos.

## Pregunta 5

El token contiene el ID del usuario en `sub` y las fechas de emisión (`iat`) y caducidad (`exp`). No incluimos el rol porque lo consultamos en PostgreSQL en cada petición protegida, de modo que cualquier cambio de permisos se aplica sin esperar a que caduque el token.

## Pregunta 6

El mismo token de recepción funciona después del cambio a `staff` porque identifica al usuario mediante `sub`, y los guards consultan su rol actual en PostgreSQL en cada petición protegida. Si la autorización utilizara el rol guardado dentro del token, seguiría siendo `member` hasta emitir un token nuevo y no tendría los nuevos permisos.

## Pregunta 7

El test no necesita PostgreSQL porque usamos un Pool falso cuyo método `query` devuelve las respuestas que preparamos con Jest. Así comprobamos cómo reacciona el servicio, pero no que el SQL sea válido ni que funcione con las tablas y restricciones reales de PostgreSQL.

## Pregunta 8

El correo lleva `Date.now()` para que cada ejecución registre un usuario nuevo con un correo distinto, ya que `email` es único en la tabla `users`. Con un correo fijo, la segunda ejecución daría `409` en el registro porque el usuario ya existiría, y el test dependería de datos que dejó una ejecución anterior en lugar de crear los suyos.

## Pregunta 9

El `ORDER BY` es seguro porque usamos columnas de una lista fija (`SORT_COLUMNS`) y una dirección limitada a `ASC` o `DESC`, sin insertar directamente el texto del usuario. Al probar `sort=id;DROP TABLE classes`, el DTO lo rechaza con `400` mediante `@IsIn`, antes de que llegue a PostgreSQL.

## Pregunta 10

El login tiene un límite más estricto para frenar ataques de fuerza bruta que prueban muchas contraseñas. Sin `trust proxy` en Render, la API podría identificar la IP del proxy como la de todos los clientes, haciendo que compartieran el límite y bloqueando a usuarios legítimos.

## Pregunta 11

Sin la transacción, se guardaron Óscar y su relación con Fuerza, aunque la API devolvió `400` al comprobar la especialidad 99, que no existe. Nuria tiene el id 6 porque el intento fallido consumió el 5: un `ROLLBACK` deshace los datos, pero no recupera los números de la secuencia.
