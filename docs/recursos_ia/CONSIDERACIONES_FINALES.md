# Consideraciones Finales

Este documento complementa la documentación existente con especificaciones adicionales y aclaraciones sobre aspectos específicos de la plataforma de competencia de minijuegos.

## Índice

1. [Registro de Participantes](#registro-de-participantes)
2. [Temáticas de Juegos](#temáticas-de-juegos)
3. [Visualización de Resultados](#visualización-de-resultados)
4. [Evaluaciones](#evaluaciones)
5. [Escalabilidad](#escalabilidad)

## Registro de Participantes

### Proceso de Preregistro Exclusivo

La plataforma utilizará **exclusivamente** el sistema de preregistro masivo para la inscripción de estudiantes. No habrá un proceso de registro individual para los alumnos.

```typescript
// core/guards/registration.guard.ts
@Injectable({
  providedIn: 'root'
})
export class RegistrationGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => {
        // Si el usuario ya está autenticado, permitir acceso
        if (user) return true;
        
        // Si no está autenticado, redirigir a página informativa
        this.router.navigate(['/info/preregistration']);
        return false;
      })
    );
  }
}
```

### Página Informativa

```typescript
// features/info/components/preregistration-info.component.ts
@Component({
  selector: 'app-preregistration-info',
  template: `
    <div class="info-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Información de Registro</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="info-content">
            <mat-icon color="info" class="info-icon">info</mat-icon>
            
            <div class="info-text">
              <p>El registro en esta plataforma se realiza exclusivamente a través del proceso de preregistro masivo
              administrado por los coordinadores del concurso.</p>
              
              <p>Si eres un estudiante y deseas participar, por favor contacta a tu profesor o al coordinador
              del concurso para ser incluido en el registro.</p>
              
              <p>Una vez preregistrado, recibirás un correo electrónico con las instrucciones para acceder
              a la plataforma.</p>
            </div>
          </div>
        </mat-card-content>
        
        <mat-card-actions align="end">
          <button mat-button color="primary" routerLink="/auth/login">Ir al Inicio de Sesión</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `
})
export class PreregistrationInfoComponent {}
```

## Temáticas de Juegos

### Selección de Temáticas Predefinidas

Los juegos deben adherirse a temáticas chilenas predefinidas en el sistema. Los participantes seleccionarán la temática de su juego de una lista de opciones disponibles.

```typescript
// features/games/models/game-theme.model.ts
export interface GameTheme {
  id: string;
  name: string;
  description: string;
  examples?: string;
  imageUrl?: string;
}

// Lista de temáticas chilenas predefinidas
export const CHILEAN_THEMES: GameTheme[] = [
  {
    id: 'folklore',
    name: 'Folklore Chileno',
    description: 'Juegos basados en mitos, leyendas y tradiciones del folklore chileno.',
    examples: 'La Pincoya, El Trauco, La Lola, etc.',
    imageUrl: 'assets/themes/folklore.jpg'
  },
  {
    id: 'geography',
    name: 'Geografía de Chile',
    description: 'Juegos que exploran la diversa geografía chilena, desde el desierto hasta la Antártica.',
    examples: 'Desierto de Atacama, Patagonia, Isla de Pascua, etc.',
    imageUrl: 'assets/themes/geography.jpg'
  },
  {
    id: 'history',
    name: 'Historia de Chile',
    description: 'Juegos basados en eventos históricos o personajes importantes de la historia chilena.',
    examples: 'Independencia, Guerra del Pacífico, etc.',
    imageUrl: 'assets/themes/history.jpg'
  },
  {
    id: 'culture',
    name: 'Cultura Chilena',
    description: 'Juegos que representan aspectos de la cultura chilena contemporánea.',
    examples: 'Fiestas Patrias, gastronomía, costumbres, etc.',
    imageUrl: 'assets/themes/culture.jpg'
  },
  {
    id: 'indigenous',
    name: 'Pueblos Originarios',
    description: 'Juegos basados en la cultura, historia y mitología de los pueblos originarios de Chile.',
    examples: 'Mapuche, Aymara, Rapa Nui, etc.',
    imageUrl: 'assets/themes/indigenous.jpg'
  }
];
```

### Validación de Temáticas

```typescript
// features/games/services/game.service.ts
// Método para validar la temática del juego
validateGameTheme(themeId: string): boolean {
  return CHILEAN_THEMES.some(theme => theme.id === themeId);
}

// Implementación en el formulario de creación/actualización de juego
@Component({
  // ...
})
export class GameFormComponent {
  themes = CHILEAN_THEMES;
  
  // Formulario con validación de temática
  gameForm = this.fb.group({
    // ...otros campos
    themeId: ['', [Validators.required, this.themeValidator]]
  });
  
  // Validador personalizado para temáticas
  themeValidator(control: AbstractControl): ValidationErrors | null {
    const themeId = control.value;
    const valid = CHILEAN_THEMES.some(theme => theme.id === themeId);
    return valid ? null : { invalidTheme: true };
  }
}
```

## Visualización de Resultados

### Lista de Resultados

La plataforma mostrará los resultados de la competencia en una lista ordenada según las puntuaciones obtenidas.

```typescript
// features/results/services/results.service.ts
@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  constructor(private firestore: AngularFirestore) {}
  
  // Obtener resultados ordenados por puntuación
  getResults(): Observable<any[]> {
    return this.firestore.collection('games', ref => 
      ref.where('isEnabled', '==', true)
         .orderBy('weightedScore', 'desc')
    ).valueChanges({ idField: 'id' })
    .pipe(
      map(games => {
        return games.map((game, index) => ({
          ...game,
          position: index + 1
        }));
      })
    );
  }
  
  // Obtener resultados por categoría
  getResultsByCategory(categoryId: string): Observable<any[]> {
    return this.firestore.collection('games', ref => 
      ref.where('isEnabled', '==', true)
         .where('categoryId', '==', categoryId)
         .orderBy('weightedScore', 'desc')
    ).valueChanges({ idField: 'id' })
    .pipe(
      map(games => {
        return games.map((game, index) => ({
          ...game,
          position: index + 1
        }));
      })
    );
  }
  
  // Obtener resultados por temática
  getResultsByTheme(themeId: string): Observable<any[]> {
    return this.firestore.collection('games', ref => 
      ref.where('isEnabled', '==', true)
         .where('themeId', '==', themeId)
         .orderBy('weightedScore', 'desc')
    ).valueChanges({ idField: 'id' })
    .pipe(
      map(games => {
        return games.map((game, index) => ({
          ...game,
          position: index + 1
        }));
      })
    );
  }
}
```

### Componente de Visualización de Resultados

```typescript
// features/results/components/results-list.component.ts
@Component({
  selector: 'app-results-list',
  template: `
    <div class="results-container">
      <h2>Resultados de la Competencia</h2>
      
      <!-- Filtros -->
      <div class="filters">
        <mat-button-toggle-group [(ngModel)]="selectedFilter" (change)="applyFilter()">
          <mat-button-toggle value="all">Todos</mat-button-toggle>
          <mat-button-toggle value="category">Por Categoría</mat-button-toggle>
          <mat-button-toggle value="theme">Por Temática</mat-button-toggle>
        </mat-button-toggle-group>
        
        <mat-form-field *ngIf="selectedFilter === 'category'" appearance="outline">
          <mat-label>Categoría</mat-label>
          <mat-select [(ngModel)]="selectedCategory" (selectionChange)="applyFilter()">
            <mat-option *ngFor="let category of categories" [value]="category.id">
              {{category.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field *ngIf="selectedFilter === 'theme'" appearance="outline">
          <mat-label>Temática</mat-label>
          <mat-select [(ngModel)]="selectedTheme" (selectionChange)="applyFilter()">
            <mat-option *ngFor="let theme of themes" [value]="theme.id">
              {{theme.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      
      <!-- Lista de resultados -->
      <div class="results-list">
        <mat-card *ngFor="let game of results" class="result-card" [ngClass]="{'top-three': game.position <= 3}">
          <div class="position-badge" [ngClass]="getPositionClass(game.position)">
            {{game.position}}
          </div>
          
          <mat-card-header>
            <div mat-card-avatar class="game-avatar" [style.background-image]="'url(' + game.thumbnailUrl + ')'"></div>
            <mat-card-title>{{game.title}}</mat-card-title>
            <mat-card-subtitle>
              <span class="theme-badge">{{getThemeName(game.themeId)}}</span>
              <span class="category-badge">{{getCategoryName(game.categoryId)}}</span>
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="score-container">
              <div class="score-item">
                <div class="score-label">Gráficos</div>
                <div class="stars">
                  <mat-icon *ngFor="let star of getStarsArray(game.graphicsRating)">star</mat-icon>
                </div>
                <div class="score-value">{{game.graphicsRating | number:'1.1-1'}}</div>
              </div>
              
              <div class="score-item">
                <div class="score-label">Entretenimiento</div>
                <div class="stars">
                  <mat-icon *ngFor="let star of getStarsArray(game.entertainmentRating)">star</mat-icon>
                </div>
                <div class="score-value">{{game.entertainmentRating | number:'1.1-1'}}</div>
              </div>
              
              <div class="score-item">
                <div class="score-label">Jugabilidad</div>
                <div class="stars">
                  <mat-icon *ngFor="let star of getStarsArray(game.gameplayRating)">star</mat-icon>
                </div>
                <div class="score-value">{{game.gameplayRating | number:'1.1-1'}}</div>
              </div>
            </div>
            
            <div class="weighted-score">
              <div class="score-label">Puntuación Total</div>
              <div class="score-value total">{{game.weightedScore | number:'1.1-1'}}</div>
            </div>
            
            <div class="creators">
              <strong>Creadores:</strong> {{game.creatorNames.join(', ')}}
            </div>
          </mat-card-content>
          
          <mat-card-actions align="end">
            <button mat-button color="primary" (click)="playGame(game)">
              <mat-icon>videogame_asset</mat-icon> Jugar
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `
})
export class ResultsListComponent implements OnInit {
  // Implementación...
  
  // Método para obtener array de estrellas (para visualización)
  getStarsArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    return Array(fullStars).fill(0);
  }
  
  // Método para obtener clase CSS según posición
  getPositionClass(position: number): string {
    if (position === 1) return 'first-place';
    if (position === 2) return 'second-place';
    if (position === 3) return 'third-place';
    return '';
  }
}
```

## Evaluaciones

### Sistema de Calificación por Estrellas

Las evaluaciones se realizan mediante un sistema de calificación de 1 a 5 estrellas para cada criterio, sin comentarios textuales.

```typescript
// features/evaluation/components/evaluation-form.component.ts
@Component({
  selector: 'app-evaluation-form',
  template: `
    <div class="evaluation-container">
      <h2>Evaluar Juego</h2>
      <h3>{{game?.title}}</h3>
      
      <form [formGroup]="evaluationForm" (ngSubmit)="onSubmit()">
        <div class="criteria-container">
          <div class="criteria-item">
            <h4>Gráficos y Estética (33.3%)</h4>
            <p class="criteria-description">
              Evalúa la calidad visual, diseño artístico y estética general del juego.
            </p>
            <div class="star-rating">
              <mat-icon *ngFor="let star of starsArray; let i = index"
                       [class.filled]="graphicsRating >= i + 1"
                       (click)="setRating('graphics', i + 1)">
                star
              </mat-icon>
            </div>
            <div class="rating-value">{{graphicsRating}}/5</div>
          </div>
          
          <div class="criteria-item">
            <h4>Entretenimiento (33.3%)</h4>
            <p class="criteria-description">
              Evalúa qué tan divertido y entretenido es el juego.
            </p>
            <div class="star-rating">
              <mat-icon *ngFor="let star of starsArray; let i = index"
                       [class.filled]="entertainmentRating >= i + 1"
                       (click)="setRating('entertainment', i + 1)">
                star
              </mat-icon>
            </div>
            <div class="rating-value">{{entertainmentRating}}/5</div>
          </div>
          
          <div class="criteria-item">
            <h4>Jugabilidad (33.3%)</h4>
            <p class="criteria-description">
              Evalúa los controles, mecánicas y experiencia general de juego.
            </p>
            <div class="star-rating">
              <mat-icon *ngFor="let star of starsArray; let i = index"
                       [class.filled]="gameplayRating >= i + 1"
                       (click)="setRating('gameplay', i + 1)">
                star
              </mat-icon>
            </div>
            <div class="rating-value">{{gameplayRating}}/5</div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" mat-button (click)="cancel()">Cancelar</button>
          <button type="submit" mat-raised-button color="primary" 
                  [disabled]="!isFormValid() || loading">
            <mat-spinner *ngIf="loading" diameter="20" class="spinner-button"></mat-spinner>
            Enviar Evaluación
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .star-rating {
      display: flex;
      font-size: 24px;
    }
    
    .star-rating mat-icon {
      cursor: pointer;
      color: #ccc;
      transition: color 0.2s;
    }
    
    .star-rating mat-icon.filled {
      color: #ffc107;
    }
    
    .criteria-item {
      margin-bottom: 24px;
      padding: 16px;
      border-radius: 8px;
      background-color: #f5f5f5;
    }
    
    .rating-value {
      font-weight: bold;
      margin-top: 8px;
    }
  `]
})
export class EvaluationFormComponent implements OnInit {
  starsArray = [1, 2, 3, 4, 5];
  graphicsRating = 0;
  entertainmentRating = 0;
  gameplayRating = 0;
  
  evaluationForm: FormGroup;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private evaluationService: EvaluationService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.evaluationForm = this.fb.group({
      graphicsRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      entertainmentRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      gameplayRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }
  
  // Establecer calificación
  setRating(criteria: string, value: number): void {
    switch (criteria) {
      case 'graphics':
        this.graphicsRating = value;
        this.evaluationForm.get('graphicsRating').setValue(value);
        break;
      case 'entertainment':
        this.entertainmentRating = value;
        this.evaluationForm.get('entertainmentRating').setValue(value);
        break;
      case 'gameplay':
        this.gameplayRating = value;
        this.evaluationForm.get('gameplayRating').setValue(value);
        break;
    }
  }
  
  // Verificar si el formulario es válido
  isFormValid(): boolean {
    return this.graphicsRating > 0 && 
           this.entertainmentRating > 0 && 
           this.gameplayRating > 0;
  }
  
  // Enviar evaluación
  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;
    
    this.loading = true;
    
    try {
      const gameId = this.route.snapshot.paramMap.get('id');
      const evaluatorEmail = this.evaluationService.getEvaluatorEmail();
      
      const evaluation: Evaluation = {
        gameId,
        evaluatorEmail,
        graphicsRating: this.graphicsRating,
        entertainmentRating: this.entertainmentRating,
        gameplayRating: this.gameplayRating,
        createdAt: new Date()
      };
      
      await this.evaluationService.submitEvaluation(evaluation);
      
      this.notificationService.showSuccess('Evaluación enviada correctamente');
      this.router.navigate(['/games/list']);
    } catch (error) {
      this.notificationService.showError('Error al enviar evaluación', error.message);
    } finally {
      this.loading = false;
    }
  }
}
```

## Escalabilidad

### Optimización para Carga Moderada

La plataforma está diseñada para manejar un máximo de 50 usuarios diarios, lo que implica una carga moderada en términos de recursos.

```typescript
// core/services/performance.service.ts
@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}
  
  // Optimizar consultas de Firestore
  optimizeFirestoreQueries(): void {
    // Configurar persistencia para mejorar rendimiento offline y reducir lecturas
    this.firestore.firestore.enablePersistence({
      synchronizeTabs: true
    }).catch(err => {
      console.error('Error al habilitar persistencia:', err);
    });
  }
  
  // Optimizar carga de archivos
  optimizeStorageDownloads(): void {
    // Configurar caché para archivos de Storage
    this.storage.storage.setMaxUploadRetryTime(30000); // 30 segundos
    this.storage.storage.setMaxOperationRetryTime(15000); // 15 segundos
  }
  
  // Monitorear uso diario
  monitorDailyUsage(): void {
    // Registrar accesos diarios para monitoreo
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.firestore.collection('usage').doc(today.toISOString().split('T')[0]).set({
      date: today,
      count: firebase.firestore.FieldValue.increment(1)
    }, { merge: true });
  }
  
  // Verificar si se está acercando al límite de uso diario
  async checkDailyLimit(): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const usageDoc = await this.firestore.collection('usage')
      .doc(today.toISOString().split('T')[0])
      .get().toPromise();
    
    if (!usageDoc.exists) return false;
    
    const data = usageDoc.data();
    return data.count >= 45; // Alerta cuando se acerca al límite de 50
  }
}
```

### Implementación en el Módulo Principal

```typescript
// app.module.ts
@NgModule({
  // ...
})
export class AppModule {
  constructor(
    private performanceService: PerformanceService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // Inicializar optimizaciones
    this.performanceService.optimizeFirestoreQueries();
    this.performanceService.optimizeStorageDownloads();
    
    // Registrar uso
    this.performanceService.monitorDailyUsage();
    
    // Verificar límites
    this.checkLimits();
  }
  
  private async checkLimits(): Promise<void> {
    const nearLimit = await this.performanceService.checkDailyLimit();
    
    if (nearLimit) {
      this.notificationService.showWarning(
        'Alto tráfico',
        'La plataforma está experimentando un alto número de usuarios hoy. Algunas funciones podrían ser más lentas.'
      );
    }
  }
}
```

### Reglas de Firestore para Optimización

```typescript
// Reglas de Firestore optimizadas para carga moderada
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Limitar número de lecturas por usuario
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null && 
                    (request.auth.token.role == 'admin' || 
                     request.auth.token.uid == resource.data.userId);
                     
      // Índices compuestos para consultas frecuentes
      // Esto mejora el rendimiento de las consultas de listado
    }
    
    // Optimizar evaluaciones
    match /evaluations/{evaluationId} {
      allow read: if request.auth != null && request.auth.token.role == 'admin';
      allow create: if request.auth != null || true; // Permitir evaluaciones anónimas
      allow update, delete: if false; // No permitir modificaciones
    }
  }
}
```
