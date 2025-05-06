# Guía de Estilos de Código

Este documento define las convenciones de nomenclatura, estructura de archivos y patrones a seguir para mantener la consistencia en el código de la plataforma de competencia de minijuegos.

## Índice

1. [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Patrones de Diseño](#patrones-de-diseño)
4. [Estilos CSS/SCSS](#estilos-cssscss)
5. [Comentarios y Documentación](#comentarios-y-documentación)
6. [Buenas Prácticas](#buenas-prácticas)

## Convenciones de Nomenclatura

### Generales

- Utilizar **camelCase** para variables, propiedades y métodos
- Utilizar **PascalCase** para clases, interfaces, tipos y enumeraciones
- Utilizar **kebab-case** para nombres de archivos y carpetas
- Utilizar **UPPER_SNAKE_CASE** para constantes

### Componentes Angular

- Nombres de componentes: **NombreComponenteComponent**
- Selector de componentes: **app-nombre-componente**
- Archivos de componentes: **nombre-componente.component.ts**
- Nombres de servicios: **NombreServicioService**
- Archivos de servicios: **nombre-servicio.service.ts**
- Nombres de directivas: **NombreDirectivaDirective**
- Archivos de directivas: **nombre-directiva.directive.ts**
- Nombres de pipes: **NombrePipePipe**
- Archivos de pipes: **nombre-pipe.pipe.ts**
- Nombres de guards: **NombreGuard**
- Archivos de guards: **nombre.guard.ts**

### Interfaces y Modelos

- Nombres de interfaces: **INombre** o simplemente **Nombre**
- Archivos de interfaces: **nombre.interface.ts**
- Nombres de modelos: **Nombre**
- Archivos de modelos: **nombre.model.ts**

### Colecciones de Firestore

- Nombres de colecciones: Utilizar plural y minúsculas (ej: **users**, **games**, **evaluations**)
- Subcollecciones: Utilizar plural y minúsculas (ej: **comments**, **ratings**)

## Estructura de Archivos

### Estructura General del Proyecto

```
src/
├── app/
│   ├── core/                 # Servicios, modelos y utilidades globales
│   │   ├── guards/           # Guards de autenticación y autorización
│   │   ├── interceptors/     # Interceptores HTTP
│   │   ├── models/           # Interfaces y modelos de datos
│   │   ├── services/         # Servicios globales
│   │   └── core.module.ts    # Módulo core
│   ├── modules/              # Módulos funcionales de la aplicación
│   │   ├── auth/             # Módulo de autenticación
│   │   ├── admin/            # Módulo de administración
│   │   ├── games/            # Módulo de gestión de juegos
│   │   ├── evaluations/      # Módulo de evaluaciones
│   │   └── ...
│   ├── shared/               # Componentes, directivas y pipes compartidos
│   │   ├── components/       # Componentes reutilizables
│   │   ├── directives/       # Directivas personalizadas
│   │   ├── pipes/            # Pipes personalizados
│   │   └── shared.module.ts  # Módulo shared
│   ├── app-routing.module.ts # Rutas principales
│   ├── app.component.ts      # Componente raíz
│   └── app.module.ts         # Módulo raíz
├── assets/                   # Recursos estáticos
│   ├── images/               # Imágenes
│   ├── icons/                # Iconos
│   └── ...
├── environments/             # Configuraciones de entorno
│   ├── environment.ts        # Configuración de desarrollo
│   └── environment.prod.ts   # Configuración de producción
└── ...
```

### Estructura de un Módulo

```
modules/nombre-modulo/
├── components/               # Componentes del módulo
│   ├── componente-uno/
│   │   ├── componente-uno.component.ts
│   │   ├── componente-uno.component.html
│   │   ├── componente-uno.component.scss
│   │   └── componente-uno.component.spec.ts
│   └── ...
├── pages/                    # Páginas del módulo (componentes de ruta)
│   ├── pagina-uno/
│   │   ├── pagina-uno.component.ts
│   │   ├── pagina-uno.component.html
│   │   ├── pagina-uno.component.scss
│   │   └── pagina-uno.component.spec.ts
│   └── ...
├── services/                 # Servicios específicos del módulo
│   ├── servicio-uno.service.ts
│   ├── servicio-uno.service.spec.ts
│   └── ...
├── models/                   # Modelos específicos del módulo
│   ├── modelo-uno.model.ts
│   └── ...
├── nombre-modulo-routing.module.ts  # Rutas del módulo
└── nombre-modulo.module.ts          # Definición del módulo
```

## Patrones de Diseño

### Patrón de Repositorio

Para el acceso a datos, utilizar el patrón de repositorio para abstraer la lógica de acceso a Firestore:

```typescript
// Ejemplo de servicio que implementa el patrón repositorio
@Injectable({
  providedIn: 'root'
})
export class GameRepository {
  private gamesCollection: AngularFirestoreCollection<Game>;
  
  constructor(private afs: AngularFirestore) {
    this.gamesCollection = this.afs.collection<Game>('games');
  }
  
  getAll(): Observable<Game[]> {
    return this.gamesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Game;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }
  
  getById(id: string): Observable<Game | null> {
    return this.gamesCollection.doc<Game>(id).valueChanges().pipe(
      map(game => game ? { id, ...game } : null)
    );
  }
  
  create(game: Omit<Game, 'id'>): Promise<string> {
    const id = this.afs.createId();
    return this.gamesCollection.doc(id).set({
      ...game,
      createdAt: new Date(),
      updatedAt: new Date()
    }).then(() => id);
  }
  
  update(id: string, game: Partial<Game>): Promise<void> {
    return this.gamesCollection.doc(id).update({
      ...game,
      updatedAt: new Date()
    });
  }
  
  delete(id: string): Promise<void> {
    return this.gamesCollection.doc(id).delete();
  }
}
```

### Patrón de Fachada

Utilizar el patrón de fachada para simplificar interfaces complejas:

```typescript
// Ejemplo de servicio que implementa el patrón fachada
@Injectable({
  providedIn: 'root'
})
export class GameFacade {
  constructor(
    private gameRepository: GameRepository,
    private evaluationRepository: EvaluationRepository,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}
  
  // Método que encapsula múltiples operaciones
  submitGameForEvaluation(gameId: string): Observable<boolean> {
    return this.gameRepository.getById(gameId).pipe(
      switchMap(game => {
        if (!game) {
          throw new Error('Juego no encontrado');
        }
        
        // Actualizar estado del juego
        return from(this.gameRepository.update(gameId, {
          status: 'pending'
        })).pipe(
          // Notificar a los evaluadores
          switchMap(() => this.notifyEvaluators(gameId, game.title)),
          // Devolver resultado
          map(() => true)
        );
      })
    );
  }
  
  private notifyEvaluators(gameId: string, gameTitle: string): Observable<void> {
    return this.authService.getUsersByRole('evaluator').pipe(
      switchMap(evaluators => {
        const notifications = evaluators.map(evaluator => 
          this.notificationService.createNotification(
            evaluator.uid,
            'Nuevo juego para evaluar',
            `El juego "${gameTitle}" está listo para ser evaluado.`,
            'evaluation',
            gameId
          )
        );
        
        return forkJoin(notifications).pipe(map(() => {}));
      })
    );
  }
}
```

### Patrón de Estado

Utilizar el patrón de estado para manejar diferentes estados de los juegos:

```typescript
// Interfaces para el patrón de estado
interface GameState {
  canEdit(): boolean;
  canSubmit(): boolean;
  canEvaluate(): boolean;
  canPublish(): boolean;
  getNextStatus(action: string): string;
}

// Implementaciones concretas
class PendingGameState implements GameState {
  canEdit() { return false; }
  canSubmit() { return false; }
  canEvaluate() { return true; }
  canPublish() { return false; }
  getNextStatus(action: string) {
    switch(action) {
      case 'approve': return 'approved';
      case 'reject': return 'rejected';
      case 'request_corrections': return 'needs_corrections';
      default: return 'pending';
    }
  }
}

// Otras implementaciones: DraftGameState, ApprovedGameState, etc.

// Uso en un servicio
@Injectable()
export class GameStateService {
  getState(status: string): GameState {
    switch(status) {
      case 'pending': return new PendingGameState();
      case 'approved': return new ApprovedGameState();
      case 'rejected': return new RejectedGameState();
      case 'needs_corrections': return new NeedsCorrectionGameState();
      default: return new DraftGameState();
    }
  }
}
```

## Estilos CSS/SCSS

### Convenciones BEM (Block Element Modifier)

Utilizar la metodología BEM para nombrar clases CSS:

```scss
// Ejemplo de BEM
.game-card {                  // Bloque
  &__title {                  // Elemento
    font-size: 1.5rem;
  }
  
  &__description {            // Elemento
    margin-top: 1rem;
  }
  
  &--featured {               // Modificador
    border: 2px solid gold;
  }
}
```

### Variables y Temas

Definir variables para colores, fuentes y espaciados:

```scss
// src/styles/_variables.scss
$primary-color: #3f51b5;
$secondary-color: #ff4081;
$accent-color: #ffc107;

$text-color-primary: #212121;
$text-color-secondary: #757575;

$font-family-base: 'Roboto', sans-serif;
$font-size-base: 16px;

$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;

// Breakpoints
$breakpoint-xs: 576px;
$breakpoint-sm: 768px;
$breakpoint-md: 992px;
$breakpoint-lg: 1200px;
```

### Mixins Útiles

```scss
// src/styles/_mixins.scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin responsive($breakpoint) {
  @if $breakpoint == xs {
    @media (max-width: $breakpoint-xs) { @content; }
  } @else if $breakpoint == sm {
    @media (min-width: $breakpoint-xs) and (max-width: $breakpoint-sm) { @content; }
  } @else if $breakpoint == md {
    @media (min-width: $breakpoint-sm) and (max-width: $breakpoint-md) { @content; }
  } @else if $breakpoint == lg {
    @media (min-width: $breakpoint-md) and (max-width: $breakpoint-lg) { @content; }
  } @else if $breakpoint == xl {
    @media (min-width: $breakpoint-lg) { @content; }
  }
}

@mixin truncate-text($lines: 1) {
  overflow: hidden;
  text-overflow: ellipsis;
  
  @if $lines == 1 {
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
  }
}
```

## Comentarios y Documentación

### Comentarios JSDoc

Utilizar comentarios JSDoc para documentar clases, métodos y propiedades:

```typescript
/**
 * Servicio para gestionar juegos
 */
@Injectable({
  providedIn: 'root'
})
export class GameService {
  /**
   * Obtiene un juego por su ID
   * @param id - ID del juego
   * @returns Observable con el juego o null si no existe
   */
  getGame(id: string): Observable<Game | null> {
    // Implementación
  }
  
  /**
   * Actualiza el estado de un juego
   * @param id - ID del juego
   * @param status - Nuevo estado
   * @param notes - Notas opcionales
   * @returns Promesa que se resuelve cuando se completa la actualización
   * @throws Error si el juego no existe
   */
  updateGameStatus(id: string, status: string, notes?: string): Promise<void> {
    // Implementación
  }
}
```

### Comentarios de Región

Utilizar comentarios de región para organizar secciones grandes de código:

```typescript
// #region Propiedades y Constructor

private games: Game[] = [];
private loading = false;

constructor(private gameService: GameService) {}

// #endregion

// #region Métodos Públicos

public loadGames(): void {
  // Implementación
}

public filterGames(criteria: string): Game[] {
  // Implementación
}

// #endregion

// #region Métodos Privados

private sortGames(games: Game[]): Game[] {
  // Implementación
}

// #endregion
```

## Buenas Prácticas

### Manejo de Errores

```typescript
// Ejemplo de manejo de errores
submitForm() {
  this.loading = true;
  this.error = null;
  
  this.authService.register(this.form.value)
    .pipe(
      finalize(() => this.loading = false),
      catchError(error => {
        this.error = this.getErrorMessage(error);
        return throwError(() => error);
      })
    )
    .subscribe({
      next: (result) => {
        this.router.navigate(['/dashboard']);
      }
    });
}

private getErrorMessage(error: any): string {
  if (error.code === 'auth/email-already-in-use') {
    return 'El correo electrónico ya está en uso';
  }
  
  if (error.code === 'auth/invalid-email') {
    return 'El correo electrónico no es válido';
  }
  
  return error.message || 'Ha ocurrido un error desconocido';
}
```

### Unsubscribe de Observables

```typescript
// Ejemplo de unsubscribe en componentes
@Component({
  // ...
})
export class GameListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.gameService.getGames()
      .pipe(takeUntil(this.destroy$))
      .subscribe(games => {
        this.games = games;
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Lazy Loading de Módulos

```typescript
// app-routing.module.ts
const routes: Routes = [
  { 
    path: 'auth', 
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) 
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'games', 
    loadChildren: () => import('./modules/games/games.module').then(m => m.GamesModule),
    canActivate: [AuthGuard]
  }
];
```

### Uso de Interfaces y Tipos

```typescript
// Definir interfaces para parámetros y retornos
interface FilterOptions {
  status?: string;
  theme?: string;
  search?: string;
}

// Usar interfaces en métodos
filterGames(options: FilterOptions): Observable<Game[]> {
  return this.gameService.getGames().pipe(
    map(games => {
      return games.filter(game => {
        if (options.status && game.status !== options.status) {
          return false;
        }
        
        if (options.theme && game.themeId !== options.theme) {
          return false;
        }
        
        if (options.search) {
          const searchLower = options.search.toLowerCase();
          return game.title.toLowerCase().includes(searchLower) ||
                 game.description.toLowerCase().includes(searchLower);
        }
        
        return true;
      });
    })
  );
}
```
