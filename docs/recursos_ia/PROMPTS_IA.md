# Prompts para Generación con IA

Este documento proporciona ejemplos de prompts efectivos para solicitar a la IA la generación de componentes específicos para la plataforma de competencia de minijuegos.

## Índice

1. [Prompts para Componentes](#prompts-para-componentes)
2. [Prompts para Servicios](#prompts-para-servicios)
3. [Prompts para Modelos](#prompts-para-modelos)
4. [Prompts para Reglas de Seguridad](#prompts-para-reglas-de-seguridad)
5. [Prompts para Integración](#prompts-para-integración)

## Prompts para Componentes

### Formulario de Registro

```
Genera un componente Angular para el formulario de registro de participantes con las siguientes características:
- Validación de correo institucional (@alumnos.santotomas.cl)
- Campos para nombre, apellido, correo y contraseña
- Integración con el servicio de autenticación
- Estilo usando Tailwind CSS y Angular Material
- Debe incluir manejo de errores y estado de carga
- Implementar verificación de correo con código de 6 dígitos
```

### Componente de Subida de Juegos

```
Crea un componente Angular para la subida de juegos WebGL con:
- Arrastrar y soltar archivos (drag and drop)
- Barra de progreso de carga
- Validación de archivos
- Campos para título, descripción, instrucciones y créditos
- Selector de temática chilena
- Integración con Firebase Storage
- Estilo con Tailwind CSS y Angular Material
```

### Componente de Evaluación

```
Desarrolla un componente de evaluación de juegos que incluya:
- Sistema de calificación con estrellas (1-5) para cada criterio
- Los criterios son: Gráficos, Jugabilidad, Originalidad y Temática chilena
- Campo para comentarios
- Verificación de que el usuario solo pueda evaluar una vez cada juego
- Cálculo automático de puntuación promedio
- Diseño responsivo con Tailwind CSS
- Integración con el servicio de evaluaciones
```

### Dashboard de Administrador

```
Genera un dashboard para administradores que incluya:
- Resumen de estadísticas (total de juegos, evaluaciones, usuarios)
- Lista de juegos pendientes de aprobación
- Gestión de usuarios (activar/desactivar)
- Panel de preregistro masivo
- Gráficos de actividad usando ng2-charts
- Diseño con Angular Material y Tailwind CSS
- Navegación por pestañas para las diferentes secciones
```

## Prompts para Servicios

### Servicio de Autenticación

```
Crea un servicio de autenticación Angular que:
- Implemente registro con correo institucional
- Valide el dominio @alumnos.santotomas.cl
- Integre Firebase Authentication
- Incluya verificación de correo con código de 6 dígitos
- Gestione roles de usuario (participante, evaluador, administrador)
- Implemente guards para proteger rutas según rol
- Maneje errores de autenticación con mensajes claros
```

### Servicio de Notificaciones

```
Desarrolla un servicio de notificaciones que:
- Integre la API de Resend para envío de correos
- Implemente plantillas HTML estáticas para diferentes tipos de notificaciones
- Almacene registro de notificaciones en Firestore
- Incluya métodos para enviar notificaciones de:
  * Verificación de correo
  * Confirmación de registro
  * Aprobación/rechazo de juegos
  * Recordatorios de evaluación
- Gestione notificaciones en la plataforma (no solo por correo)
```

### Servicio de Evaluación

```
Crea un servicio de evaluación de juegos que:
- Permita a los usuarios evaluar juegos una sola vez
- Verifique mediante código de 4 dígitos enviado por correo
- Calcule puntuación promedio y ponderada considerando cantidad de votos
- Actualice automáticamente las estadísticas del juego
- Almacene evaluaciones en Firestore
- Implemente consultas para obtener:
  * Juegos mejor evaluados
  * Evaluaciones pendientes
  * Historial de evaluaciones por usuario
```

## Prompts para Modelos

### Modelo de Datos Completo

```
Genera los modelos de datos TypeScript para la plataforma con:
- Interfaces para Usuario, Juego, Evaluación, Temática y Notificación
- Tipos para estados de juegos y roles de usuario
- Modelos para la estructura de Firestore
- Interfaces para respuestas de API
- Consideraciones para cálculo de puntuación ponderada
- Documentación JSDoc completa
```

### Modelo de Evaluación

```
Crea un modelo de datos para el sistema de evaluación que:
- Permita calcular puntuación ponderada considerando cantidad de votos
- Almacene evaluaciones individuales con criterios específicos
- Mantenga estadísticas agregadas en el documento del juego
- Implemente estructura optimizada para consultas frecuentes
- Incluya campos para seguimiento de evaluadores
```

## Prompts para Reglas de Seguridad

### Reglas de Firestore

```
Genera reglas de seguridad de Firestore para:
- Permitir a los usuarios leer todos los juegos aprobados
- Restringir la escritura de juegos solo a sus creadores
- Permitir a los administradores leer y escribir en todas las colecciones
- Limitar las evaluaciones a una por usuario por juego
- Validar que los correos de registro sean del dominio @alumnos.santotomas.cl
- Implementar validación de campos obligatorios
```

### Reglas de Storage

```
Crea reglas de seguridad para Firebase Storage que:
- Limiten la subida de archivos solo a usuarios autenticados
- Restrinjan el acceso a archivos de juegos solo a sus creadores y administradores
- Permitan la lectura pública de archivos de juegos aprobados
- Validen el tamaño y tipo de archivos
- Implementen estructura de carpetas por usuario y tipo de contenido
```

## Prompts para Integración

### Integración con Resend

```
Desarrolla el código para integrar Resend Email API:
- Configuración del servicio en Angular
- Implementación de plantillas HTML estáticas
- Métodos para diferentes tipos de correos
- Manejo de errores y reintentos
- Seguimiento de estado de envío
- Configuración de variables de entorno
```

### Integración con Firebase Analytics

```
Crea la implementación de Firebase Analytics para:
- Rastrear eventos clave (registro, subida de juegos, evaluaciones)
- Configurar propiedades personalizadas para segmentación
- Implementar seguimiento de conversión
- Crear dashboard personalizado
- Integrar con el servicio de autenticación para datos demográficos
- Configurar exportación de datos a BigQuery (opcional)
```

### Integración con Cypress

```
Genera configuración y pruebas e2e con Cypress para:
- Flujo completo de registro y verificación
- Proceso de subida de juegos
- Sistema de evaluación
- Panel de administración
- Incluir comandos personalizados para autenticación
- Configurar pruebas para diferentes roles de usuario
```
