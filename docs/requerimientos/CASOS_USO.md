# Casos de Uso: Plataforma de Competencia de Minijuegos

Este documento detalla los principales casos de uso de la plataforma web para la competencia de minijuegos con temáticas chilenas.

## CU01: Registro de Usuario

### Actores
- Participante
- Evaluador

### Descripción
Este caso de uso describe el proceso mediante el cual un usuario (participante o evaluador) se registra en la plataforma utilizando su correo institucional.

### Flujo Principal
1. El usuario accede a la página de registro
2. El sistema muestra el formulario de registro
3. El usuario ingresa sus datos personales:
   - Nombre completo
   - Correo institucional (@alumnos.santotomas.cl)
   - Contraseña
   - Rol (participante o evaluador)
4. El sistema valida que el correo pertenezca al dominio institucional
5. El sistema genera y envía un código de verificación al correo del usuario
6. El sistema muestra la pantalla de verificación de correo
7. El usuario recibe el código en su correo y lo ingresa en la plataforma
8. El sistema valida el código ingresado
9. El sistema crea la cuenta de usuario
10. El sistema redirige al usuario a su panel correspondiente

### Flujos Alternativos

#### FA01: Correo no institucional
1. En el paso 4, si el correo no pertenece al dominio institucional
2. El sistema muestra un mensaje de error
3. El usuario debe ingresar un correo válido
4. El flujo continúa en el paso 4

#### FA02: Código de verificación incorrecto
1. En el paso 8, si el código ingresado es incorrecto
2. El sistema muestra un mensaje de error
3. El usuario puede reintentar hasta 3 veces
4. Si excede los intentos, debe solicitar un nuevo código
5. El flujo continúa en el paso 7

#### FA03: Reenvío de código
1. En la pantalla de verificación, el usuario puede solicitar un nuevo código
2. El sistema genera y envía un nuevo código
3. El código anterior queda invalidado
4. El flujo continúa en el paso 7

### Precondiciones
- El usuario no debe tener una cuenta en el sistema

### Postcondiciones
- El usuario queda registrado en el sistema
- El usuario puede iniciar sesión con sus credenciales

## CU02: Reserva de Temática

### Actores
- Participante

### Descripción
Este caso de uso describe el proceso mediante el cual un participante selecciona y reserva una temática chilena para su minijuego.

### Flujo Principal
1. El participante inicia sesión en la plataforma
2. El participante accede a la sección "Reservar Temática"
3. El sistema muestra las temáticas disponibles con su descripción
4. El participante selecciona una temática
5. El sistema solicita confirmación
6. El participante confirma la selección
7. El sistema registra la reserva con fecha y hora
8. El sistema notifica al participante que la reserva fue exitosa

### Flujos Alternativos

#### FA01: Temática ya reservada
1. En el paso 4, si la temática seleccionada ya fue reservada por otro participante
2. El sistema muestra un mensaje indicando que la temática no está disponible
3. El participante debe seleccionar otra temática
4. El flujo continúa en el paso 4

#### FA02: Participante ya tiene una temática reservada
1. En el paso 2, si el participante ya tiene una temática reservada
2. El sistema muestra la temática actual y ofrece la opción de cambiarla
3. Si el participante decide cambiarla, el sistema libera la temática anterior
4. El flujo continúa en el paso 3

### Precondiciones
- El participante debe estar registrado y autenticado
- La fase de reserva de temáticas debe estar activa

### Postcondiciones
- La temática queda reservada para el participante
- La temática no estará disponible para otros participantes

## CU03: Subida de Juego

### Actores
- Participante

### Descripción
Este caso de uso describe el proceso mediante el cual un participante sube su minijuego a la plataforma.

### Flujo Principal
1. El participante inicia sesión en la plataforma
2. El participante accede a la sección "Subir Juego"
3. El sistema muestra el formulario de subida
4. El participante ingresa la información del juego:
   - Título
   - Descripción
   - Instrucciones
   - Controles
   - Créditos
5. El participante sube los archivos del juego (formato WebGL)
6. El participante sube una imagen de portada (1280x720 px)
7. El participante sube un icono (256x256 px)
8. El sistema valida los archivos e información
9. El sistema almacena el juego y lo marca como "Pendiente de Revisión"
10. El sistema notifica al participante que la subida fue exitosa

### Flujos Alternativos

#### FA01: Archivos con formato incorrecto
1. En el paso 8, si algún archivo no cumple con los requisitos
2. El sistema muestra un mensaje de error específico
3. El participante debe corregir los archivos
4. El flujo continúa en el paso correspondiente (5, 6 o 7)

#### FA02: Tamaño de archivo excedido
1. En el paso 5, si el tamaño del juego excede el límite (100MB)
2. El sistema muestra un mensaje de error
3. El participante debe optimizar su juego
4. El flujo continúa en el paso 5

#### FA03: Edición de juego existente
1. En el paso 2, si el participante ya subió un juego
2. El sistema muestra la información actual y ofrece la opción de editarla
3. El participante realiza las modificaciones necesarias
4. El flujo continúa en el paso 8

### Precondiciones
- El participante debe estar registrado y autenticado
- El participante debe tener una temática reservada
- La fase de subida de juegos debe estar activa

### Postcondiciones
- El juego queda almacenado en la plataforma
- El juego queda pendiente de revisión por un administrador

## CU04: Evaluación de Juego

### Actores
- Evaluador
- Participante (como evaluador de otros juegos)

### Descripción
Este caso de uso describe el proceso mediante el cual un usuario evalúa un minijuego según los criterios establecidos.

### Flujo Principal
1. El evaluador inicia sesión en la plataforma
2. El evaluador accede a la sección "Juegos para Evaluar"
3. El sistema muestra la lista de juegos disponibles para evaluación
4. El evaluador selecciona un juego
5. El sistema muestra la información del juego y el formulario de evaluación
6. El evaluador juega al minijuego
7. El evaluador califica el juego según los criterios:
   - Gráficos (1-7)
   - Entretenimiento (1-7)
   - Jugabilidad (1-7)
8. El evaluador ingresa comentarios (opcional)
9. El evaluador envía la evaluación
10. El sistema registra la evaluación y actualiza el promedio del juego
11. El sistema notifica al creador del juego sobre la nueva evaluación

### Flujos Alternativos

#### FA01: Evaluación ya realizada
1. En el paso 3, si el evaluador ya evaluó todos los juegos disponibles
2. El sistema muestra un mensaje indicando que no hay juegos pendientes
3. El caso de uso finaliza

#### FA02: Problemas técnicos con el juego
1. En el paso 6, si el evaluador tiene problemas para jugar
2. El evaluador puede reportar el problema
3. El sistema registra el reporte
4. El caso de uso finaliza o continúa en el paso 3

### Precondiciones
- El evaluador debe estar registrado y autenticado
- La fase de evaluación debe estar activa
- Debe haber juegos disponibles para evaluar

### Postcondiciones
- La evaluación queda registrada en el sistema
- El promedio del juego se actualiza
- El creador del juego recibe una notificación

## CU05: Revisión y Aprobación de Juego

### Actores
- Administrador

### Descripción
Este caso de uso describe el proceso mediante el cual un administrador revisa y aprueba un minijuego subido por un participante.

### Flujo Principal
1. El administrador inicia sesión en la plataforma
2. El administrador accede a la sección "Juegos Pendientes"
3. El sistema muestra la lista de juegos pendientes de revisión
4. El administrador selecciona un juego
5. El sistema muestra la información completa y el juego
6. El administrador revisa el juego:
   - Verifica que funcione correctamente
   - Comprueba que cumpla con la temática asignada
   - Valida que no tenga contenido inapropiado
7. El administrador aprueba el juego
8. El sistema actualiza el estado del juego a "Aprobado"
9. El sistema notifica al participante que su juego fue aprobado

### Flujos Alternativos

#### FA01: Rechazo de juego
1. En el paso 7, si el juego no cumple con los requisitos
2. El administrador rechaza el juego e indica los motivos
3. El sistema actualiza el estado del juego a "Rechazado"
4. El sistema notifica al participante que su juego fue rechazado con los motivos
5. El participante puede corregir y volver a subir el juego

#### FA02: Solicitud de correcciones
1. En el paso 7, si el juego requiere correcciones menores
2. El administrador solicita correcciones específicas
3. El sistema actualiza el estado del juego a "Requiere Correcciones"
4. El sistema notifica al participante con las correcciones solicitadas
5. El participante puede corregir y volver a subir el juego

### Precondiciones
- El administrador debe estar autenticado
- Debe haber juegos pendientes de revisión

### Postcondiciones
- El estado del juego se actualiza
- El participante recibe una notificación

## CU06: Preregistro Masivo de Alumnos

### Actores
- Administrador

### Descripción
Este caso de uso describe el proceso mediante el cual un administrador registra previamente a múltiples alumnos y los asigna a minijuegos específicos.

### Flujo Principal
1. El administrador inicia sesión en la plataforma
2. El administrador accede a la sección "Preregistro Masivo"
3. El administrador carga un archivo CSV con los datos de los alumnos
4. El sistema valida los datos:
   - Verifica que los correos pertenezcan al dominio institucional
   - Comprueba que no haya duplicados
   - Valida las restricciones de asignación de minijuegos
5. El sistema muestra los resultados de la validación
6. El administrador confirma el preregistro
7. El sistema crea las cuentas de usuario y asigna los minijuegos
8. El sistema genera contraseñas temporales
9. El sistema envía notificaciones por correo a los alumnos
10. El sistema muestra un resumen del proceso

### Flujos Alternativos

#### FA01: Errores en los datos
1. En el paso 5, si hay errores en los datos
2. El sistema muestra los registros con errores y los motivos
3. El administrador puede corregir los datos o continuar solo con los válidos
4. El flujo continúa en el paso 6

#### FA02: Ingreso manual de datos
1. En el paso 3, el administrador puede optar por ingresar datos manualmente
2. El sistema muestra un formulario para ingresar los datos
3. El administrador ingresa los datos de cada alumno y minijuego
4. El flujo continúa en el paso 4

### Precondiciones
- El administrador debe estar autenticado
- La fase de registro debe estar activa

### Postcondiciones
- Se crean las cuentas de usuario para los alumnos
- Los alumnos quedan asignados a sus respectivos minijuegos
- Los alumnos reciben notificaciones con sus credenciales

## CU07: Visualización de Resultados

### Actores
- Participante
- Evaluador
- Administrador

### Descripción
Este caso de uso describe el proceso mediante el cual un usuario visualiza los resultados de la competencia.

### Flujo Principal
1. El usuario inicia sesión en la plataforma
2. El usuario accede a la sección "Resultados"
3. El sistema muestra la clasificación general de los juegos
4. El usuario puede filtrar por categoría o temática
5. El usuario puede ver detalles de cada juego:
   - Calificación promedio
   - Número de evaluaciones
   - Posición en la clasificación

### Flujos Alternativos

#### FA01: Resultados no disponibles
1. En el paso 3, si la fase de resultados no está activa
2. El sistema muestra un mensaje indicando que los resultados aún no están disponibles
3. El caso de uso finaliza

#### FA02: Vista detallada de evaluaciones
1. En el paso 5, el participante puede ver las evaluaciones de su propio juego
2. El sistema muestra las evaluaciones individuales con comentarios
3. El caso de uso finaliza

### Precondiciones
- El usuario debe estar autenticado
- La fase de resultados debe estar activa (excepto para administradores)

### Postcondiciones
- El usuario visualiza los resultados de la competencia
