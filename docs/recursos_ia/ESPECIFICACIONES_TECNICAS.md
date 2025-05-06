# Especificaciones Técnicas Adicionales

Este documento complementa la documentación existente con especificaciones técnicas detalladas para la generación de código mediante IA.

## Índice

1. [Notificaciones por Correo](#notificaciones-por-correo)
2. [Estructura de Datos](#estructura-de-datos)
3. [Autenticación](#autenticación)
4. [Despliegue](#despliegue)
5. [Interfaz de Usuario](#interfaz-de-usuario)
6. [Almacenamiento de Juegos](#almacenamiento-de-juegos)
7. [Evaluación de Juegos](#evaluación-de-juegos)
8. [Idioma](#idioma)
9. [Analítica](#analítica)
10. [Pruebas](#pruebas)
11. [Escalabilidad](#escalabilidad)
12. [Mantenimiento](#mantenimiento)

## Notificaciones por Correo

- **Tipo de Plantillas**: Plantillas HTML estáticas (no componentes React)
- **Servicio**: Resend API
- **Formato**: Correos responsivos con versión HTML y texto plano

## Estructura de Datos

- **Modelo de Evaluación**: Diseñado para facilitar el cálculo de calificación global
- **Fórmula de Calificación**: Considerar tanto la nota promedio como la cantidad de votos
  - Mayor peso a juegos con más votos y mejor calificación
- **Ejemplo de Modelo**:
  ```typescript
  interface Evaluation {
    gameId: string;
    userId: string;
    rating: number;
    createdAt: Date;
  }
  
  interface Game {
    // Otros campos...
    averageRating: number;
    ratingCount: number;
    weightedScore: number; // Calculado considerando cantidad de votos
  }
  ```

## Autenticación

- **Método Principal**: Correo institucional (@alumnos.santotomas.cl)
- **Participantes (Subida de Juegos)**:
  - Asignación de clave al momento del registro
  - Verificación de correo institucional
- **Evaluadores (Votantes)**:
  - Verificación mediante código numérico de 4 dígitos enviado por correo
  - Restricción: Solo pueden votar una vez por cada aplicación

## Despliegue

- **Plataforma**: Firebase Hosting
- **Automatización**: Configurar despliegue automático desde repositorio
- **Entornos**: Desarrollo y Producción

## Interfaz de Usuario

- **Frameworks UI**: 
  - Tailwind CSS para estilos base
  - Angular Material para componentes complejos
- **Responsive**: Diseño adaptable a dispositivos móviles y escritorio

## Almacenamiento de Juegos

- **Servicio**: Firebase Storage
- **Restricciones de Tamaño**: Sin restricciones específicas
- **Tipos de Archivos**: Principalmente juegos WebGL

## Evaluación de Juegos

- **Criterios**: Fijos, no configurables por administradores
- **Categorías de Evaluación**:
  - Gráficos
  - Jugabilidad
  - Originalidad
  - Temática chilena
- **Escala**: 1-5 estrellas para cada categoría

## Idioma

- **Único Idioma**: Español
- **Formato de Fechas**: Localización chilena (DD/MM/YYYY)

## Analítica

- **Herramientas**:
  - Google Analytics
  - Firebase Analytics
- **Eventos a Rastrear**:
  - Registros de usuarios
  - Subidas de juegos
  - Evaluaciones realizadas
  - Tiempo de juego

## Pruebas

- **Frameworks**:
  - Vitest para pruebas unitarias
  - Cypress para pruebas e2e
- **Cobertura Mínima**: 70% del código

## Escalabilidad

- **Usuarios Concurrentes**: Diseñado para soportar hasta 50 usuarios diarios
- **Picos de Uso**: Considerar mayor actividad en fechas de entrega y evaluación

## Mantenimiento

- **Versiones Futuras**: No hay planes específicos para versiones futuras
- **Documentación**: Mantener documentación actualizada para facilitar mantenimiento
