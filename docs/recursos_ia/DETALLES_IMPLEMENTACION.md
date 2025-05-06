# Detalles de Implementación

Este documento proporciona información detallada sobre aspectos específicos de implementación para la plataforma de competencia de minijuegos.

## Índice

1. [Verificación de Evaluadores](#verificación-de-evaluadores)
2. [Cálculo de Puntuación](#cálculo-de-puntuación)
3. [Estructura de Juegos WebGL](#estructura-de-juegos-webgl)
4. [Criterios de Evaluación](#criterios-de-evaluación)
5. [Preregistro Masivo](#preregistro-masivo)
6. [Temáticas Chilenas](#temáticas-chilenas)
7. [Framework de UI](#framework-de-ui)
8. [Gestión de Errores](#gestión-de-errores)
9. [Estrategia de Pruebas](#estrategia-de-pruebas)
10. [Análisis y Métricas](#análisis-y-métricas)

## Verificación de Evaluadores

### Proceso de Verificación

- Se envía un código de 4 dígitos al correo del evaluador cada vez que desee evaluar un juego específico.
- La verificación es por navegador: si el evaluador cambia de navegador, deberá solicitar un nuevo código.
- No se requiere crear una cuenta de usuario para los evaluadores.
- Se utiliza una cookie o almacenamiento local en el navegador para mantener la sesión activa.
- La validez de la sesión es de 1 día.

### Implementación

```typescript
// Servicio de verificación para evaluadores
export class EvaluationAuthService {
  // Enviar código de verificación
  async sendVerificationCode(email: string, gameId: string): Promise<boolean> {
    // Generar código de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Guardar en Firestore con expiración
    await this.firestore.collection('evaluationCodes').add({
      email,
      gameId,
      code,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      used: false
    });
    
    // Enviar por correo
    return this.notificationService.sendEvaluationCode(email, code, gameId);
  }
  
  // Verificar código
  async verifyCode(email: string, gameId: string, code: string): Promise<boolean> {
    // Verificar en Firestore
    const result = await this.verifyCodeInFirestore(email, gameId, code);
    
    if (result) {
      // Establecer cookie de sesión
      this.setCookie(email, gameId);
      return true;
    }
    
    return false;
  }
  
  // Verificar si ya tiene sesión activa
  hasActiveSession(gameId: string): boolean {
    const sessionData = localStorage.getItem('evaluation_session');
    if (!sessionData) return false;
    
    const session = JSON.parse(sessionData);
    return session.gameId === gameId && 
           new Date(session.expiresAt) > new Date();
  }
  
  // Establecer cookie/localStorage
  private setCookie(email: string, gameId: string): void {
    const session = {
      email,
      gameId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    localStorage.setItem('evaluation_session', JSON.stringify(session));
  }
}
```

## Cálculo de Puntuación

### Fórmula de Puntuación Ponderada

Para calcular la puntuación ponderada que considere tanto la calificación promedio como la cantidad de votos, se implementará la siguiente fórmula:

```
WS = (v / (v + m)) * R + (m / (v + m)) * C
```

Donde:
- WS = Puntuación ponderada (Weighted Score)
- v = Número de votos que ha recibido el juego
- m = Número mínimo de votos requeridos para considerar confiable la calificación (se usará 5)
- R = Promedio de calificaciones del juego
- C = Calificación promedio global de todos los juegos (se usará 3 como valor predeterminado)

### Implementación

```typescript
// Función para calcular puntuación ponderada
function calculateWeightedScore(averageRating: number, ratingCount: number): number {
  const m = 5; // Votos mínimos para considerar
  const C = 3; // Promedio global predeterminado
  
  return ((ratingCount / (ratingCount + m)) * averageRating) + 
         ((m / (ratingCount + m)) * C);
}

// Uso en transacción de Firestore
async function submitEvaluation(gameId: string, ratings: any): Promise<void> {
  // Calcular promedio de esta evaluación
  const averageRating = (
    ratings.graphicsRating + 
    ratings.entertainmentRating + 
    ratings.gameplayRating
  ) / 3;
  
  return this.firestore.runTransaction(async transaction => {
    // Obtener documento del juego
    const gameRef = this.firestore.collection('games').doc(gameId);
    const gameDoc = await transaction.get(gameRef);
    
    if (!gameDoc.exists) throw new Error('Juego no encontrado');
    
    const gameData = gameDoc.data();
    const currentRatingCount = gameData.ratingCount || 0;
    const currentAvgRating = gameData.averageRating || 0;
    
    // Calcular nuevo promedio
    const newRatingCount = currentRatingCount + 1;
    const newAvgRating = (
      (currentAvgRating * currentRatingCount) + averageRating
    ) / newRatingCount;
    
    // Calcular puntuación ponderada
    const weightedScore = calculateWeightedScore(newAvgRating, newRatingCount);
    
    // Actualizar juego
    transaction.update(gameRef, {
      averageRating: newAvgRating,
      ratingCount: newRatingCount,
      weightedScore: weightedScore,
      updatedAt: new Date()
    });
    
    // Crear documento de evaluación
    // ...
  });
}
```

## Estructura de Juegos WebGL

### Estructura de Archivos

Los juegos WebGL deben seguir esta estructura básica:

```
juego/
├── index.html       # Archivo principal que carga el juego
├── Build/           # Carpeta con archivos compilados (si aplica)
│   ├── UnityLoader.js
│   └── [nombre].json
├── TemplateData/    # Recursos adicionales
│   ├── favicon.ico
│   ├── style.css
│   └── ...
└── assets/          # Recursos del juego
    ├── images/
    ├── sounds/
    └── ...
```

### Requisitos del Archivo Principal

El archivo `index.html` debe:
- Ser el punto de entrada principal del juego
- Contener todos los scripts necesarios para cargar el juego
- Ser compatible con la visualización en iframe
- No requerir permisos especiales del navegador

## Criterios de Evaluación

### Categorías y Ponderaciones

Todos los criterios se evalúan en una escala de 1 a 5 estrellas, y cada categoría tiene igual ponderación (33.3%):

1. **Gráficos y Estética** (33.3%)
   - Calidad visual del juego
   - Coherencia estética
   - Diseño visual y animaciones

2. **Entretenimiento** (33.3%)
   - ¿Qué tan divertido y atractivo es el juego?
   - ¿Mantiene el interés del jugador?
   - ¿Ofrece desafíos adecuados?

3. **Jugabilidad** (33.3%)
   - Controles intuitivos y responsivos
   - Mecánicas bien implementadas
   - Dificultad balanceada

### Implementación en la Interfaz

```typescript
// Componente de evaluación
@Component({
  selector: 'app-evaluation-form',
  template: `
    <div class="evaluation-form">
      <h2>Evaluar: {{game.title}}</h2>
      
      <div class="criteria-section">
        <h3>Gráficos y Estética</h3>
        <p>Calidad visual, coherencia estética, diseño y animaciones</p>
        <mat-slider
          [max]="5"
          [min]="1"
          [step]="1"
          [(ngModel)]="evaluation.graphicsRating">
        </mat-slider>
        <div class="rating-stars">
          <mat-icon *ngFor="let star of [1,2,3,4,5]"
                   [class.filled]="evaluation.graphicsRating >= star">
            star
          </mat-icon>
        </div>
      </div>
      
      <!-- Secciones similares para Entretenimiento y Jugabilidad -->
      
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Comentarios</mat-label>
        <textarea matInput [(ngModel)]="evaluation.comments" rows="4"></textarea>
      </mat-form-field>
      
      <button mat-raised-button color="primary" (click)="submitEvaluation()">
        Enviar Evaluación
      </button>
    </div>
  `
})
export class EvaluationFormComponent {
  // Implementación...
}
```

## Preregistro Masivo

### Formato CSV

El archivo CSV para preregistro masivo debe tener la siguiente estructura:

```csv
email,nombre,apellido,juego
estudiante1@alumnos.santotomas.cl,Nombre1,Apellido1,Nombre del Juego 1
estudiante2@alumnos.santotomas.cl,Nombre2,Apellido2,Nombre del Juego 1
estudiante3@alumnos.santotomas.cl,Nombre3,Apellido3,Nombre del Juego 2
```

### Validaciones

- Cada correo debe tener el dominio `@alumnos.santotomas.cl`
- Un juego puede tener máximo 2 estudiantes asignados
- Un estudiante no puede estar asignado a más de un juego
- No puede haber correos duplicados

### Implementación

```typescript
// Servicio de preregistro
export class PreregistrationService {
  // Procesar archivo CSV
  async processCSVFile(file: File): Promise<{
    valid: any[],
    invalid: any[]
  }> {
    const content = await this.readFile(file);
    const rows = this.parseCSV(content);
    
    const validEntries = [];
    const invalidEntries = [];
    
    // Validar entradas
    // ...
    
    return { valid: validEntries, invalid: invalidEntries };
  }
  
  // Realizar preregistro masivo
  async bulkPreregister(validEntries: any[]): Promise<{
    success: number,
    failed: number
  }> {
    const batch = this.firestore.batch();
    
    // Agrupar por juego
    const gameGroups = this.groupByGame(validEntries);
    
    // Validar restricciones
    // ...
    
    // Crear usuarios y asignar juegos
    // ...
    
    await batch.commit();
    
    // Enviar notificaciones
    // ...
    
    return { success: successCount, failed: failedCount };
  }
}
```

## Temáticas Chilenas

Las temáticas chilenas se encuentran definidas en la carpeta `/docs/concurso/` y deben cargarse en la base de datos Firestore al inicializar la aplicación.

## Framework de UI

### Angular Material

Se utilizará exclusivamente Angular Material como framework de UI para la plataforma, siguiendo las guías de estilo de Material Design.

### Componentes Principales

- `mat-toolbar` para la barra de navegación
- `mat-card` para tarjetas de juegos y contenido
- `mat-form-field` para formularios
- `mat-table` para tablas de datos
- `mat-dialog` para diálogos modales
- `mat-snackbar` para notificaciones breves

### Tema Personalizado

```scss
// src/theme.scss
@use '@angular/material' as mat;

$primary-palette: mat.define-palette(mat.$indigo-palette);
$accent-palette: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$warn-palette: mat.define-palette(mat.$red-palette);

$theme: mat.define-light-theme((
  color: (
    primary: $primary-palette,
    accent: $accent-palette,
    warn: $warn-palette,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

@include mat.all-component-themes($theme);
```

## Gestión de Errores

### Biblioteca de Notificaciones

Se utilizará SweetAlert2 para mostrar mensajes de éxito y error.

### Implementación

```typescript
// Servicio de notificaciones UI
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationUIService {
  // Mostrar mensaje de éxito
  showSuccess(title: string, message?: string): void {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      timer: 3000,
      showConfirmButton: false
    });
  }
  
  // Mostrar mensaje de error
  showError(title: string, message?: string): void {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonText: 'Entendido'
    });
  }
  
  // Mostrar confirmación
  async showConfirmation(title: string, message: string): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });
    
    return result.isConfirmed;
  }
}
```

### Interceptor HTTP

```typescript
// Interceptor para errores HTTP
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationUIService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error';
        
        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 401:
              errorMessage = 'No autorizado';
              break;
            case 403:
              errorMessage = 'Acceso prohibido';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado';
              break;
            case 500:
              errorMessage = 'Error interno del servidor';
              break;
            default:
              errorMessage = `Error ${error.status}: ${error.message}`;
          }
        }
        
        this.notificationService.showError('Error', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
```

## Estrategia de Pruebas

### Pruebas Unitarias con Vitest

Se implementará una estrategia de pruebas unitarias para servicios y componentes clave utilizando Vitest.

#### Estructura de Pruebas

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── auth.service.spec.ts
│   │   └── ...
│   ├── modules/
│   │   ├── games/
│   │   │   ├── components/
│   │   │   │   ├── game-card.component.ts
│   │   │   │   └── game-card.component.spec.ts
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── ...
```

#### Ejemplo de Prueba Unitaria

```typescript
// auth.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let afAuthMock: any;
  
  beforeEach(() => {
    afAuthMock = {
      signInWithEmailAndPassword: vi.fn(),
      createUserWithEmailAndPassword: vi.fn(),
      signOut: vi.fn()
    };
    
    service = new AuthService(afAuthMock, /* otros mocks */);
  });
  
  it('debería iniciar sesión correctamente', async () => {
    afAuthMock.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: '123', email: 'test@alumnos.santotomas.cl' }
    });
    
    await service.login('test@alumnos.santotomas.cl', 'password');
    
    expect(afAuthMock.signInWithEmailAndPassword).toHaveBeenCalledWith(
      'test@alumnos.santotomas.cl', 'password'
    );
  });
  
  // Más pruebas...
});
```

### Pruebas E2E con Cypress

Se implementarán pruebas end-to-end para flujos completos de usuario utilizando Cypress.

#### Estructura de Pruebas E2E

```
cypress/
├── e2e/
│   ├── auth/
│   │   ├── login.cy.ts
│   │   └── register.cy.ts
│   ├── games/
│   │   ├── upload-game.cy.ts
│   │   └── evaluate-game.cy.ts
│   └── ...
├── fixtures/
│   ├── users.json
│   └── games.json
└── support/
    ├── commands.ts
    └── ...
```

#### Ejemplo de Prueba E2E

```typescript
// cypress/e2e/auth/login.cy.ts
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });
  
  it('debería mostrar error con credenciales inválidas', () => {
    cy.get('[data-cy=email-input]').type('invalid@example.com');
    cy.get('[data-cy=password-input]').type('wrongpassword');
    cy.get('[data-cy=login-button]').click();
    
    cy.get('.swal2-html-container').should('contain', 'Credenciales inválidas');
  });
  
  it('debería iniciar sesión con credenciales válidas', () => {
    cy.get('[data-cy=email-input]').type('test@alumnos.santotomas.cl');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();
    
    cy.url().should('include', '/dashboard');
  });
});
```

## Análisis y Métricas

### Google Analytics

Se implementará Google Analytics para rastrear métricas estándar como:

- Páginas vistas
- Tiempo en la página
- Tasa de rebote
- Flujo de usuarios
- Dispositivos y navegadores utilizados

### Firebase Analytics

Se implementará Firebase Analytics para rastrear eventos específicos de la aplicación:

- Registro de usuarios
- Inicio de sesión
- Subida de juegos
- Evaluaciones realizadas
- Tiempo de juego
- Interacciones con juegos específicos

### Implementación

```typescript
// Servicio de analytics
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(
    private firebaseAnalytics: AngularFireAnalytics
  ) {}
  
  // Rastrear evento de registro
  trackRegistration(method: string): void {
    this.firebaseAnalytics.logEvent('sign_up', { method });
  }
  
  // Rastrear evento de inicio de sesión
  trackLogin(method: string): void {
    this.firebaseAnalytics.logEvent('login', { method });
  }
  
  // Rastrear subida de juego
  trackGameUpload(gameId: string, themeId: string): void {
    this.firebaseAnalytics.logEvent('game_upload', {
      game_id: gameId,
      theme_id: themeId
    });
  }
  
  // Rastrear evaluación
  trackEvaluation(gameId: string, rating: number): void {
    this.firebaseAnalytics.logEvent('game_evaluation', {
      game_id: gameId,
      rating: rating
    });
  }
  
  // Rastrear tiempo de juego
  trackGamePlay(gameId: string, timeInSeconds: number): void {
    this.firebaseAnalytics.logEvent('game_play', {
      game_id: gameId,
      time: timeInSeconds
    });
  }
}
```
