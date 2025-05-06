# Módulo de Gestión de Juegos

Este documento detalla los requerimientos e implementación del módulo de gestión de juegos para la plataforma de competencia de minijuegos con temáticas chilenas.

## Requerimientos Funcionales

- RF11: El sistema debe permitir la subida de archivos de juegos en formato WebGL
- RF12: El sistema debe permitir la subida de imágenes de portada (1280x720 px) e iconos (256x256 px)
- RF13: El sistema debe permitir la edición de la información del juego
- RF14: El sistema debe mostrar el estado de revisión del juego (preliminar y final)

## Descripción de la Funcionalidad

El módulo de gestión de juegos permite a los participantes subir sus minijuegos desarrollados en Unity y exportados en formato WebGL, junto con imágenes de portada e iconos. También permite a los administradores revisar y aprobar los juegos subidos.

### Subida de Juegos

Los participantes pueden subir sus minijuegos desarrollados en Unity y exportados en formato WebGL. El proceso incluye:

1. Subida de archivos del juego (carpeta Build de WebGL)
2. Subida de imagen de portada (1280x720 px)
3. Subida de icono (256x256 px)
4. Ingreso de información del juego:
   - Título
   - Descripción
   - Instrucciones
   - Controles
   - Créditos

### Gestión de Estado

Los juegos pasan por diferentes estados durante su ciclo de vida:

1. **Pendiente**: Juego recién subido, pendiente de revisión
2. **Aprobado**: Juego revisado y aprobado por un administrador
3. **Rechazado**: Juego rechazado por incumplir requisitos
4. **Requiere Correcciones**: Juego que necesita modificaciones específicas

## Implementación Técnica

### Modelo de Datos

```typescript
// Colección 'games'
interface Game {
  id: string;                 // ID único
  title: string;              // Título del juego
  description: string;        // Descripción del juego
  instructions: string;       // Instrucciones de juego
  controls: string;           // Descripción de controles
  credits: string;            // Créditos y atribuciones
  themeId: string;            // ID de la temática
  themeName: string;          // Nombre de la temática (para búsqueda)
  userId: string;             // ID del creador principal
  teamMembers: string[];      // IDs de todos los miembros del equipo
  status: 'pending' | 'approved' | 'rejected' | 'needs_corrections';  // Estado de revisión
  gameUrl: string;            // URL del juego en Storage
  coverImageUrl: string;      // URL de la imagen de portada
  iconUrl: string;            // URL del icono
  createdAt: Timestamp;       // Fecha de creación
  updatedAt: Timestamp;       // Fecha de última actualización
  publishedAt?: Timestamp;    // Fecha de publicación (aprobación)
  rejectionReason?: string;   // Motivo de rechazo (si aplica)
  correctionNotes?: string;   // Notas para corrección (si aplica)
}
```

### Servicio de Gestión de Juegos

El servicio de gestión de juegos proporciona las siguientes funcionalidades:

1. **Subida de archivos**: Gestiona la subida de archivos WebGL e imágenes a Firebase Storage
2. **Creación y actualización**: Permite crear y actualizar la información de los juegos
3. **Gestión de estados**: Facilita la transición entre diferentes estados del juego
4. **Consultas**: Proporciona métodos para obtener juegos según diferentes criterios

### Componentes Principales

1. **Formulario de Subida**: Permite a los participantes subir sus juegos e información
2. **Visor de Juegos**: Permite reproducir los juegos WebGL directamente en el navegador
3. **Panel de Revisión**: Permite a los administradores revisar y aprobar/rechazar juegos
4. **Listado de Juegos**: Muestra los juegos disponibles con opciones de filtrado

## Consideraciones Técnicas

1. **Límites de Tamaño**:
   - Tamaño máximo de juego: 100MB
   - Dimensiones de imagen de portada: 1280x720 px
   - Dimensiones de icono: 256x256 px

2. **Compatibilidad WebGL**:
   - Los juegos deben ser compatibles con WebGL 2.0
   - Se recomienda Unity 2020.3 LTS o superior para la exportación

3. **Optimización**:
   - Implementar carga progresiva para juegos grandes
   - Utilizar compresión para reducir el tamaño de los archivos

## Reglas de Seguridad

```
// Reglas de Firestore
match /games/{gameId} {
  allow read: if true;
  allow create: if request.auth != null && request.auth.token.role == 'participant';
  allow update: if request.auth != null && (
    resource.data.userId == request.auth.uid || 
    request.auth.token.role == 'admin'
  );
  allow delete: if request.auth != null && request.auth.token.role == 'admin';
}

// Reglas de Storage
match /games/{gameId}/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null && (
    firestore.get(/databases/(default)/documents/games/$(gameId)).data.userId == request.auth.uid || 
    request.auth.token.role == 'admin'
  );
}
```

## Casos de Prueba

1. **Subida de Juego**:
   - Verificar la subida correcta de archivos WebGL
   - Comprobar la validación de tamaños y formatos

2. **Revisión de Juego**:
   - Verificar el proceso de aprobación por parte de administradores
   - Comprobar el envío de notificaciones al cambiar el estado

3. **Visualización de Juego**:
   - Verificar la reproducción correcta en diferentes navegadores
   - Comprobar la carga de instrucciones y controles
