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
