# Módulo de Evaluación

Este documento detalla los requerimientos e implementación del módulo de evaluación para la plataforma de competencia de minijuegos con temáticas chilenas.

## Requerimientos Funcionales

- RF19: El sistema debe permitir a usuarios autenticados evaluar juegos
- RF20: El sistema debe implementar los tres criterios de evaluación (gráficos, entretenimiento, jugabilidad)
- RF21: El sistema debe impedir evaluaciones duplicadas (un usuario solo puede evaluar un juego una vez)
- RF22: El sistema debe calcular automáticamente el promedio de calificaciones

## Descripción de la Funcionalidad

El módulo de evaluación permite a los usuarios con rol de evaluador y a los participantes evaluar los juegos de otros participantes según criterios predefinidos. Este proceso es fundamental para determinar los ganadores de la competencia y proporcionar retroalimentación valiosa a los desarrolladores.

### Criterios de Evaluación

Cada juego se evalúa según tres criterios principales, con una escala de 1 a 7:

1. **Gráficos**: Calidad visual, estética, diseño de personajes y escenarios
2. **Entretenimiento**: Diversión, enganche, rejugabilidad
3. **Jugabilidad**: Controles, mecánicas, fluidez, dificultad

### Proceso de Evaluación

1. El evaluador accede a la lista de juegos disponibles para evaluación
2. Selecciona un juego y lo juega directamente en la plataforma
3. Completa el formulario de evaluación con calificaciones para cada criterio
4. Opcionalmente, añade comentarios para proporcionar retroalimentación
5. Envía la evaluación, que se registra en el sistema
6. El sistema actualiza automáticamente el promedio del juego

## Implementación Técnica

### Modelo de Datos

```typescript
// Colección 'evaluations'
interface Evaluation {
  id: string;                 // ID único
  gameId: string;             // ID del juego evaluado
  evaluatorId: string;        // ID del evaluador
  graphicsRating: number;     // Calificación de gráficos (1-7)
  entertainmentRating: number; // Calificación de entretenimiento (1-7)
  gameplayRating: number;     // Calificación de jugabilidad (1-7)
  averageRating: number;      // Promedio de las tres calificaciones
  comments: string;           // Comentarios adicionales
  createdAt: Timestamp;       // Fecha de evaluación
  isAnonymous: boolean;       // Si la evaluación es anónima
}
```

### Servicio de Evaluación

El servicio de evaluación proporciona las siguientes funcionalidades:

1. **Creación de evaluaciones**: Permite a los usuarios evaluar juegos
2. **Validación de restricciones**: Impide evaluaciones duplicadas
3. **Cálculo de promedios**: Actualiza automáticamente los promedios de los juegos
4. **Consultas**: Proporciona métodos para obtener evaluaciones según diferentes criterios

### Componentes Principales

1. **Formulario de Evaluación**: Permite a los usuarios calificar juegos según los criterios
2. **Listado de Juegos para Evaluar**: Muestra los juegos disponibles para evaluación
3. **Resumen de Evaluaciones**: Muestra las evaluaciones recibidas por un juego
4. **Estadísticas de Evaluación**: Proporciona análisis y gráficos de las evaluaciones

## Consideraciones Técnicas

1. **Asignación de Juegos**:
   - Cada evaluador debe evaluar un mínimo de juegos
   - Los juegos se asignan de forma equitativa entre los evaluadores
   - Los participantes pueden evaluar juegos que no sean los propios

2. **Cálculo de Promedios**:
   - El promedio general se calcula como la media de los tres criterios
   - Cada criterio puede tener un peso diferente según la configuración

3. **Notificaciones**:
   - Los creadores reciben notificaciones cuando sus juegos son evaluados
   - Las notificaciones incluyen el promedio y los comentarios

## Reglas de Seguridad

```
// Reglas de Firestore
match /evaluations/{evaluationId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && 
    !exists(/databases/$(database)/documents/evaluations/$(request.resource.data.evaluatorId + '_' + request.resource.data.gameId));
  allow update: if request.auth != null && 
    request.auth.uid == resource.data.evaluatorId;
  allow delete: if request.auth != null && 
    request.auth.token.role == 'admin';
}
```

## Casos de Prueba

1. **Creación de Evaluación**:
   - Verificar que un usuario pueda evaluar un juego correctamente
   - Comprobar que se actualice el promedio del juego

2. **Restricciones**:
   - Verificar que un usuario no pueda evaluar su propio juego
   - Comprobar que un usuario no pueda evaluar un juego más de una vez

3. **Cálculo de Promedios**:
   - Verificar que los promedios se calculen correctamente
   - Comprobar que las clasificaciones se actualicen en tiempo real
