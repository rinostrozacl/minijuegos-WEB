# Requerimientos Generales: Plataforma de Competencia de Minijuegos

Este documento especifica los requerimientos funcionales y técnicos para el desarrollo e implementación de la plataforma web que gestionará la competencia de minijuegos con temáticas chilenas.

## 1. Introducción

### 1.1 Propósito

Este documento tiene como objetivo definir los requerimientos para el desarrollo de una plataforma web que gestionará la "Competencia de Minijuegos con Temáticas Chilenas" para la asignatura "Programación en Videojuegos". La plataforma facilitará todo el proceso de la competencia, desde el registro de participantes hasta la evaluación de los juegos y la publicación de resultados.

### 1.2 Alcance

La plataforma web incluirá las siguientes funcionalidades principales:

- Mostrar información sobre la competencia y sus bases
- Gestionar el registro de participantes y selección de temáticas
- Permitir la subida y visualización de juegos WebGL
- Implementar un sistema de evaluación basado en criterios específicos
- Notificar a los participantes sobre evaluaciones recibidas
- Mostrar resultados y clasificaciones
- Proporcionar un panel de administración para la gestión de la competencia

### 1.3 Definiciones y Acrónimos

- **WebGL**: Tecnología web que permite la renderización de gráficos 3D en navegadores sin necesidad de plugins
- **Nuxt 3**: Framework de desarrollo para aplicaciones web basado en Vue 3
- **Firebase**: Plataforma de desarrollo de aplicaciones móviles y web
- **Resend**: Servicio de envío de correos electrónicos

### 1.4 Referencias

- Documento "bases_del_concurso.md"
- Documento "tematicas_chilenas.md"
- Documento "tipos_de_juegos.md"

## 2. Descripción General

### 2.1 Perspectiva del Producto

La plataforma web será un sistema independiente desarrollado específicamente para la competencia de minijuegos. Se integrará con servicios de Firebase para la autenticación, almacenamiento y base de datos, así como con Resend para el envío de notificaciones por correo electrónico.

### 2.2 Funciones del Producto

La plataforma ofrecerá las siguientes funciones principales:

- Registro y autenticación de usuarios
- Selección y reserva de temáticas chilenas
- Subida y visualización de juegos WebGL
- Evaluación de juegos según criterios establecidos
- Notificaciones por correo electrónico
- Administración de la competencia

### 2.3 Características de los Usuarios

La plataforma tendrá tres tipos principales de usuarios:

1. **Participantes**: Estudiantes de la asignatura que desarrollan y suben juegos
2. **Evaluadores**: Estudiantes con correo institucional que evalúan los juegos
3. **Administradores**: Docentes o personal encargado de gestionar la competencia

### 2.4 Restricciones

- La plataforma debe ser accesible desde navegadores web modernos
- Los juegos deben ser desarrollados en Unity y exportados en formato WebGL
- El tamaño máximo de los archivos de juego será de 100MB
- La autenticación debe realizarse exclusivamente con correos institucionales (@alumnos.santotomas.cl o @santotomas.cl)

### 2.5 Suposiciones y Dependencias

- Se asume que los participantes tienen acceso a Unity para el desarrollo de sus juegos
- La plataforma dependerá de los servicios de Firebase y Zeni para su funcionamiento

## 3. Requerimientos Específicos

### 3.1 Requerimientos Funcionales

#### 3.1.1 Módulo de Autenticación

- RF01: El sistema debe permitir el registro de usuarios con correo institucional (@alumnos.santotomas.cl o @santotomas.cl)
- RF02: El sistema debe validar que el correo electrónico pertenezca al dominio institucional (@alumnos.santotomas.cl o @santotomas.cl)
- RF03: El sistema debe enviar un código de verificación al correo electrónico del usuario durante el registro
- RF04: El sistema debe requerir la validación del código enviado para completar el registro
- RF05: El sistema debe permitir el inicio de sesión de usuarios registrados
- RF06: El sistema debe implementar roles de usuario (participante, evaluador, administrador)

#### 3.1.2 Módulo de Registro de Participantes

- RF07: El sistema debe permitir a los participantes registrarse individualmente o en parejas
- RF08: El sistema debe mostrar las temáticas disponibles para selección
- RF09: El sistema debe impedir la selección de temáticas ya reservadas
- RF10: El sistema debe registrar la fecha y hora de reserva de temáticas

#### 3.1.3 Módulo de Gestión de Juegos

- RF11: El sistema debe permitir la subida de archivos de juegos en formato WebGL
- RF12: El sistema debe permitir la subida de imágenes de portada (1280x720 px) e iconos (256x256 px)
- RF13: El sistema debe permitir la edición de la información del juego
- RF14: El sistema debe mostrar el estado de revisión del juego (preliminar y final)

#### 3.1.4 Módulo de Visualización de Juegos

- RF15: El sistema debe mostrar un listado de todos los juegos participantes
- RF16: El sistema debe permitir filtrar juegos por categoría o temática
- RF17: El sistema debe permitir la reproducción de los juegos WebGL directamente en el navegador
- RF18: El sistema debe mostrar la información completa de cada juego (título, descripción, instrucciones, etc.)

#### 3.1.5 Módulo de Evaluación

- RF19: El sistema debe permitir a usuarios autenticados evaluar juegos
- RF20: El sistema debe implementar los tres criterios de evaluación (gráficos, entretenimiento, jugabilidad)
- RF21: El sistema debe impedir evaluaciones duplicadas (un usuario solo puede evaluar un juego una vez)
- RF22: El sistema debe calcular automáticamente el promedio de calificaciones

#### 3.1.6 Módulo de Notificaciones

- RF23: El sistema debe enviar notificaciones por correo cuando un juego recibe una evaluación
- RF24: El sistema debe incluir en las notificaciones las calificaciones detalladas y comentarios
- RF25: El sistema debe mantener un registro de todas las notificaciones enviadas

#### 3.1.7 Módulo de Administración

- RF26: El sistema debe proporcionar un panel de administración para gestionar usuarios
- RF27: El sistema debe permitir a los administradores revisar y aprobar juegos
- RF28: El sistema debe permitir a los administradores configurar fechas y fases de la competencia
- RF29: El sistema debe generar estadísticas y reportes de la competencia
- RF30: El sistema debe permitir a los administradores preregistrar de forma masiva a los alumnos participantes
- RF31: El sistema debe validar que cada minijuego sea asignado a un máximo de 2 alumnos
- RF32: El sistema debe impedir que un minijuego sea asignado a más de un grupo de alumnos
- RF33: El sistema debe impedir que un alumno sea asignado a más de un minijuego

### 3.2 Requerimientos No Funcionales

#### 3.2.1 Requisitos de Rendimiento

- RNF01: El tiempo de carga de la página principal no debe exceder los 3 segundos
- RNF02: El sistema debe soportar al menos 100 usuarios concurrentes
- RNF03: El tiempo de respuesta para operaciones de base de datos no debe exceder 1 segundo

#### 3.2.2 Requisitos de Seguridad

- RNF04: Todas las comunicaciones deben ser cifradas mediante HTTPS
- RNF05: Las contraseñas deben almacenarse de forma segura (hash + salt)
- RNF06: El acceso a funcionalidades administrativas debe estar restringido a usuarios con rol de administrador

#### 3.2.3 Requisitos de Fiabilidad

- RNF07: El sistema debe estar disponible al menos el 99.5% del tiempo
- RNF08: El sistema debe realizar copias de seguridad diarias de la base de datos
- RNF09: El sistema debe implementar mecanismos de recuperación ante fallos

#### 3.2.4 Requisitos de Usabilidad

- RNF10: La interfaz debe ser responsive y adaptarse a diferentes tamaños de pantalla
- RNF11: El sistema debe proporcionar mensajes de error claros y descriptivos
- RNF12: La navegación debe ser intuitiva y consistente en toda la plataforma

#### 3.2.5 Requisitos Técnicos

- RNF13: El frontend debe desarrollarse con Nuxt 3 (Vue 3)
- RNF14: El backend debe implementarse con Firebase
- RNF15: El sistema debe ser compatible con los navegadores Chrome, Firefox, Safari y Edge en sus versiones más recientes

## 4. Matriz de Trazabilidad

La siguiente tabla muestra la relación entre los requerimientos funcionales y los casos de uso principales:

| Requerimiento | CU01: Registro | CU02: Reserva Temática | CU03: Subida Juego | CU04: Evaluación | CU05: Revisión |
| ------------- | -------------- | ---------------------- | ------------------ | ---------------- | -------------- |
| RF01-RF06     | ✓              |                        |                    |                  |                |
| RF07-RF10     | ✓              | ✓                      |                    |                  |                |
| RF11-RF14     |                |                        | ✓                  |                  | ✓              |
| RF15-RF18     |                |                        | ✓                  | ✓                |                |
| RF19-RF22     |                |                        |                    | ✓                |                |
| RF23-RF25     |                |                        |                    | ✓                | ✓              |
| RF26-RF33     |                | ✓                      |                    |                  | ✓              |

## 5. Priorización de Requerimientos

Los requerimientos se han clasificado según su prioridad:

### Alta Prioridad

- RF01-RF06: Autenticación y verificación de correo
- RF07-RF10: Registro de participantes
- RF11-RF14: Gestión de juegos
- RF26-RF29: Administración básica

### Media Prioridad

- RF15-RF18: Visualización de juegos
- RF19-RF22: Evaluación de juegos
- RF30-RF33: Preregistro masivo

### Baja Prioridad

- RF23-RF25: Notificaciones

## 6. Consideraciones Adicionales

### 6.1 Internacionalización

- El sistema se desarrollará inicialmente solo en español
- Se utilizará el formato de fecha y hora chileno (DD/MM/YYYY)

### 6.2 Accesibilidad

- Se implementarán etiquetas ARIA básicas para mejorar la accesibilidad
- Se asegurará un contraste adecuado para la legibilidad

### 6.3 Escalabilidad

- La arquitectura debe permitir la expansión para futuras ediciones de la competencia
- El diseño de la base de datos debe facilitar la adición de nuevas funcionalidades

Para más detalles sobre la implementación de cada módulo, consulte los documentos específicos en la carpeta "modulos/".
