## Ejercicio 0

Al intentar hacer push directamente a `main`, GitHub rechazó la operación:

```text
remote: - Changes must be made through a pull request.
```

La rama está protegida y los cambios deben entrar mediante una pull request.

## Ejercicio 1

El cliente recibe un código 500 con el mensaje genérico "Internal server error".
En la terminal aparece ECONNREFUSED, las direcciones y el puerto 5433, además de la traza del error; estos detalles permiten depurar el fallo sin exponer información interna al cliente.
