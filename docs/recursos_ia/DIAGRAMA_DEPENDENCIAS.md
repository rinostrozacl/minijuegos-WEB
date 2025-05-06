# Diagrama de Dependencias

Este documento proporciona una visualización clara de cómo los diferentes módulos y componentes se relacionan entre sí en la plataforma de competencia de minijuegos.

## Índice

1. [Diagrama General](#diagrama-general)
2. [Dependencias del Módulo de Autenticación](#dependencias-del-módulo-de-autenticación)
3. [Dependencias del Módulo de Gestión de Juegos](#dependencias-del-módulo-de-gestión-de-juegos)
4. [Dependencias del Módulo de Evaluación](#dependencias-del-módulo-de-evaluación)
5. [Dependencias del Módulo de Administración](#dependencias-del-módulo-de-administración)
6. [Dependencias del Módulo de Notificaciones](#dependencias-del-módulo-de-notificaciones)

## Diagrama General

```mermaid
graph TD
    A[App Module] --> B[Core Module]
    A --> C[Shared Module]
    A --> D[Auth Module]
    A --> E[Games Module]
    A --> F[Evaluation Module]
    A --> G[Admin Module]
    A --> H[Notification Module]
    
    B --> I[AuthService]
    B --> J[FirestoreService]
    B --> K[StorageService]
    B --> L[NotificationService]
    
    C --> M[UI Components]
    C --> N[Directives]
    C --> O[Pipes]
    
    D --> I
    D --> P[VerificationService]
    
    E --> I
    E --> J
    E --> K
    E --> Q[GameService]
    E --> R[ThemeService]
    
    F --> I
    F --> J
    F --> S[EvaluationService]
    F --> Q
    
    G --> I
    G --> J
    G --> T[AdminService]
    G --> U[PreregistrationService]
    
    H --> I
    H --> J
    H --> L
    
    P --> J
    P --> L
    
    Q --> J
    Q --> K
    
    R --> J
    
    S --> J
    S --> L
    
    T --> J
    T --> L
    
    U --> J
    U --> L
    U --> P
```

## Dependencias del Módulo de Autenticación

```mermaid
graph TD
    A[Auth Module] --> B[Login Component]
    A --> C[Register Component]
    A --> D[Verification Component]
    A --> E[Password Reset Component]
    A --> F[Profile Component]
    
    B --> G[AuthService]
    C --> G
    C --> H[VerificationService]
    D --> H
    E --> G
    F --> G
    F --> I[UserService]
    
    G --> J[AngularFireAuth]
    G --> K[FirestoreService]
    
    H --> K
    H --> L[NotificationService]
    
    I --> K
    
    L --> M[Resend Email Service]
```

### Descripción de Dependencias

- **AuthService**: Gestiona la autenticación de usuarios, registro, inicio de sesión y cierre de sesión.
- **VerificationService**: Maneja la verificación de correos electrónicos mediante códigos.
- **UserService**: Gestiona la información de perfil de los usuarios.
- **FirestoreService**: Proporciona acceso a la base de datos Firestore.
- **NotificationService**: Gestiona el envío de notificaciones por correo electrónico y en la plataforma.

## Dependencias del Módulo de Gestión de Juegos

```mermaid
graph TD
    A[Games Module] --> B[Game List Component]
    A --> C[Game Detail Component]
    A --> D[Game Form Component]
    A --> E[Game Upload Component]
    A --> F[Theme Selection Component]
    
    B --> G[GameService]
    C --> G
    C --> H[EvaluationService]
    D --> G
    D --> I[ThemeService]
    E --> G
    E --> J[StorageService]
    F --> I
    
    G --> K[FirestoreService]
    G --> J
    G --> L[NotificationService]
    
    H --> K
    
    I --> K
    
    L --> M[Resend Email Service]
```

### Descripción de Dependencias

- **GameService**: Gestiona la creación, actualización, eliminación y consulta de juegos.
- **ThemeService**: Gestiona las temáticas disponibles para los juegos.
- **StorageService**: Gestiona el almacenamiento de archivos (juegos WebGL, imágenes).
- **EvaluationService**: Proporciona acceso a las evaluaciones de los juegos.
- **FirestoreService**: Proporciona acceso a la base de datos Firestore.
- **NotificationService**: Gestiona el envío de notificaciones.

## Dependencias del Módulo de Evaluación

```mermaid
graph TD
    A[Evaluation Module] --> B[Evaluation List Component]
    A --> C[Evaluation Form Component]
    A --> D[Game Player Component]
    A --> E[Results Component]
    
    B --> F[EvaluationService]
    B --> G[GameService]
    C --> F
    C --> G
    D --> G
    E --> F
    E --> G
    
    F --> H[FirestoreService]
    F --> I[NotificationService]
    
    G --> H
    G --> J[StorageService]
    
    I --> K[Email Service]
```

### Descripción de Dependencias

- **EvaluationService**: Gestiona la creación, actualización y consulta de evaluaciones.
- **GameService**: Proporciona acceso a los juegos que se van a evaluar.
- **FirestoreService**: Proporciona acceso a la base de datos Firestore.
- **NotificationService**: Gestiona el envío de notificaciones a los participantes.
- **StorageService**: Proporciona acceso a los archivos de los juegos.

## Dependencias del Módulo de Administración

```mermaid
graph TD
    A[Admin Module] --> B[Dashboard Component]
    A --> C[User Management Component]
    A --> D[Game Management Component]
    A --> E[Theme Management Component]
    A --> F[Preregistration Component]
    
    B --> G[AdminService]
    C --> G
    C --> H[AuthService]
    D --> G
    D --> I[GameService]
    E --> G
    E --> J[ThemeService]
    F --> G
    F --> K[PreregistrationService]
    
    G --> L[FirestoreService]
    
    H --> L
    H --> M[AngularFireAuth]
    
    I --> L
    I --> N[StorageService]
    
    J --> L
    
    K --> L
    K --> O[NotificationService]
    K --> P[VerificationService]
    
    O --> Q[Email Service]
    
    P --> L
    P --> O
```

### Descripción de Dependencias

- **AdminService**: Proporciona funcionalidades específicas para administradores.
- **AuthService**: Gestiona la autenticación y los roles de usuarios.
- **GameService**: Gestiona los juegos en la plataforma.
- **ThemeService**: Gestiona las temáticas disponibles.
- **PreregistrationService**: Gestiona el preregistro masivo de alumnos.
- **FirestoreService**: Proporciona acceso a la base de datos Firestore.
- **StorageService**: Gestiona el almacenamiento de archivos.
- **NotificationService**: Gestiona el envío de notificaciones.
- **VerificationService**: Gestiona la verificación de correos electrónicos.

## Dependencias del Módulo de Notificaciones

```mermaid
graph TD
    A[Notification Module] --> B[Notification List Component]
    A --> C[Notification Detail Component]
    A --> D[Notification Settings Component]
    
    B --> E[NotificationService]
    C --> E
    D --> E
    D --> F[UserService]
    
    E --> G[FirestoreService]
    E --> H[Email Service]
    
    F --> G
```

### Descripción de Dependencias

- **NotificationService**: Gestiona el envío y consulta de notificaciones.
- **UserService**: Gestiona las preferencias de notificación de los usuarios.
- **FirestoreService**: Proporciona acceso a la base de datos Firestore.
- **Email Service**: Servicio externo para el envío de correos electrónicos (Resend).

## Flujo de Datos entre Servicios

```mermaid
sequenceDiagram
    participant User
    participant AuthService
    participant GameService
    participant EvaluationService
    participant NotificationService
    participant FirestoreService
    
    User->>AuthService: Registrarse/Iniciar sesión
    AuthService->>FirestoreService: Guardar/Verificar credenciales
    FirestoreService-->>AuthService: Resultado
    AuthService-->>User: Sesión iniciada
    
    User->>GameService: Subir juego
    GameService->>FirestoreService: Guardar datos del juego
    GameService->>NotificationService: Notificar a evaluadores
    NotificationService->>FirestoreService: Guardar notificaciones
    
    User->>EvaluationService: Evaluar juego
    EvaluationService->>FirestoreService: Guardar evaluación
    EvaluationService->>GameService: Actualizar calificación promedio
    GameService->>FirestoreService: Actualizar juego
    EvaluationService->>NotificationService: Notificar al participante
    NotificationService->>FirestoreService: Guardar notificación
```
