# Especificaciones Adicionales

Este documento proporciona especificaciones adicionales para la implementación de la plataforma de competencia de minijuegos con temáticas chilenas.

## Índice

1. [Despliegue Continuo](#despliegue-continuo)
2. [Seguridad](#seguridad)
3. [Visualización en Dispositivos](#visualización-en-dispositivos)
4. [Gestión de Contenido](#gestión-de-contenido)
5. [Actualización de Juegos](#actualización-de-juegos)
6. [Recuperación de Contraseñas](#recuperación-de-contraseñas)

## Despliegue Continuo

### GitHub Actions

Se implementará un flujo de trabajo de GitHub Actions para el despliegue automático a Firebase Hosting.

```yaml
# .github/workflows/firebase-deploy.yml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: competencia-minijuegos
```

### Configuración de Secretos

Se deben configurar los siguientes secretos en el repositorio de GitHub:

1. `FIREBASE_SERVICE_ACCOUNT`: Contenido del archivo JSON de la cuenta de servicio de Firebase.

### Proceso de Despliegue

1. Al hacer push a la rama `main`, se activa el flujo de trabajo.
2. Se instalan las dependencias y se compila la aplicación.
3. Se despliega automáticamente a Firebase Hosting.
4. Se notifica el resultado del despliegue.

## Seguridad

### Límites de Intentos Fallidos

Se implementará un sistema de límites de intentos fallidos para proteger contra ataques de fuerza bruta:

- Máximo 3 intentos fallidos consecutivos
- Tiempo de espera de 30 minutos después de alcanzar el límite
- Registro de intentos fallidos en Firestore

```typescript
// Servicio de seguridad
@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
  
  constructor(private firestore: AngularFirestore) {}
  
  // Verificar si una cuenta está bloqueada
  async isAccountLocked(email: string): Promise<boolean> {
    const doc = await this.firestore.collection('loginAttempts')
      .doc(this.hashEmail(email)).get().toPromise();
    
    if (!doc.exists) return false;
    
    const data = doc.data();
    
    // Verificar si ha excedido los intentos y está dentro del período de bloqueo
    if (data.attempts >= this.MAX_ATTEMPTS && 
        data.lastAttempt.toDate().getTime() + this.LOCKOUT_DURATION > Date.now()) {
      return true;
    }
    
    // Si el período de bloqueo ha pasado, reiniciar contador
    if (data.attempts >= this.MAX_ATTEMPTS) {
      await this.resetAttempts(email);
    }
    
    return false;
  }
  
  // Registrar intento fallido
  async recordFailedAttempt(email: string): Promise<void> {
    const docRef = this.firestore.collection('loginAttempts').doc(this.hashEmail(email));
    const doc = await docRef.get().toPromise();
    
    if (!doc.exists) {
      await docRef.set({
        attempts: 1,
        lastAttempt: new Date()
      });
    } else {
      await docRef.update({
        attempts: firebase.firestore.FieldValue.increment(1),
        lastAttempt: new Date()
      });
    }
  }
  
  // Reiniciar contador de intentos
  async resetAttempts(email: string): Promise<void> {
    await this.firestore.collection('loginAttempts')
      .doc(this.hashEmail(email)).set({
        attempts: 0,
        lastAttempt: new Date()
      });
  }
  
  // Función para hashear el email (para no almacenar emails en texto plano)
  private hashEmail(email: string): string {
    // Implementar una función de hash segura
    // Por simplicidad, aquí se usa una función básica
    return btoa(email).replace(/[/+=]/g, '');
  }
}
```

### Implementación en el Servicio de Autenticación

```typescript
// Integración con AuthService
async login(email: string, password: string): Promise<any> {
  // Verificar si la cuenta está bloqueada
  if (await this.securityService.isAccountLocked(email)) {
    throw new Error('Cuenta bloqueada temporalmente. Intente nuevamente después de 30 minutos.');
  }
  
  try {
    const result = await this.afAuth.signInWithEmailAndPassword(email, password);
    // Reiniciar contador de intentos en caso de éxito
    await this.securityService.resetAttempts(email);
    return result;
  } catch (error) {
    // Registrar intento fallido
    await this.securityService.recordFailedAttempt(email);
    throw error;
  }
}
```

## Visualización en Dispositivos

### Priorización de Dispositivos Móviles

La plataforma estará orientada principalmente a dispositivos móviles, con soporte secundario para navegadores web de escritorio.

### Implementación Responsive

```typescript
// Servicio de detección de dispositivos
@Injectable({
  providedIn: 'root'
})
export class DeviceDetectionService {
  isMobile(): boolean {
    return window.innerWidth <= 768;
  }
  
  isTablet(): boolean {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  }
  
  isDesktop(): boolean {
    return window.innerWidth > 1024;
  }
  
  // Detectar si el dispositivo puede ejecutar WebGL
  canRunWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }
}
```

### Consideraciones de Diseño

1. **Diseño Mobile-First**:
   - Implementar diseños que prioricen la experiencia en dispositivos móviles
   - Utilizar componentes de Angular Material optimizados para táctil

2. **Optimización de Juegos WebGL**:
   - Implementar detección de capacidades del dispositivo
   - Ofrecer configuraciones de calidad adaptativas
   - Mostrar advertencias para dispositivos no compatibles

3. **Adaptación de Controles**:
   - Detectar tipo de entrada (táctil vs. mouse/teclado)
   - Adaptar controles de juego según el dispositivo

```scss
// Estilos responsive
@media (max-width: 768px) {
  .game-container {
    width: 100%;
    height: calc(100vh - 56px);
  }
  
  .evaluation-form {
    padding: 16px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .game-container {
    width: 80%;
    height: 600px;
  }
}

@media (min-width: 1025px) {
  .game-container {
    width: 70%;
    height: 700px;
  }
}
```

## Gestión de Contenido

### Habilitación/Deshabilitación de Juegos

Los administradores tendrán la capacidad de habilitar o deshabilitar juegos en la plataforma.

```typescript
// Servicio de administración de juegos
@Injectable({
  providedIn: 'root'
})
export class GameAdminService {
  constructor(private firestore: AngularFirestore) {}
  
  // Habilitar un juego
  async enableGame(gameId: string): Promise<void> {
    await this.firestore.collection('games').doc(gameId).update({
      isEnabled: true,
      updatedAt: new Date(),
      updatedBy: this.authService.currentUserId,
      statusChangeReason: null
    });
    
    // Registrar acción en logs
    await this.logAdminAction('enable_game', gameId);
  }
  
  // Deshabilitar un juego
  async disableGame(gameId: string, reason: string): Promise<void> {
    await this.firestore.collection('games').doc(gameId).update({
      isEnabled: false,
      updatedAt: new Date(),
      updatedBy: this.authService.currentUserId,
      statusChangeReason: reason
    });
    
    // Registrar acción en logs
    await this.logAdminAction('disable_game', gameId, { reason });
    
    // Notificar al creador del juego
    const game = await this.firestore.collection('games').doc(gameId).get().toPromise();
    const gameData = game.data();
    
    await this.notificationService.createNotification(
      gameData.userId,
      'Juego deshabilitado',
      `Tu juego "${gameData.title}" ha sido deshabilitado. Motivo: ${reason}`,
      'system',
      gameId
    );
  }
  
  // Registrar acción administrativa
  private async logAdminAction(action: string, targetId: string, metadata?: any): Promise<void> {
    await this.firestore.collection('adminLogs').add({
      action,
      targetId,
      adminId: this.authService.currentUserId,
      timestamp: new Date(),
      metadata: metadata || {}
    });
  }
}
```

### Interfaz de Administración

```typescript
// Componente de administración de juegos
@Component({
  selector: 'app-game-admin',
  template: `
    <div class="admin-container">
      <h2>Administración de Juegos</h2>
      
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar juego</mat-label>
        <input matInput [(ngModel)]="searchTerm" (keyup)="applyFilter()">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
      
      <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8">
        <!-- Columnas de la tabla -->
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Título</th>
          <td mat-cell *matCellDef="let game">{{game.title}}</td>
        </ng-container>
        
        <ng-container matColumnDef="creator">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Creador</th>
          <td mat-cell *matCellDef="let game">{{game.creatorName}}</td>
        </ng-container>
        
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
          <td mat-cell *matCellDef="let game">
            <span [ngClass]="{'status-enabled': game.isEnabled, 'status-disabled': !game.isEnabled}">
              {{game.isEnabled ? 'Habilitado' : 'Deshabilitado'}}
            </span>
          </td>
        </ng-container>
        
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let game">
            <button mat-icon-button color="primary" (click)="viewGame(game)" matTooltip="Ver juego">
              <mat-icon>visibility</mat-icon>
            </button>
            
            <button mat-icon-button [color]="game.isEnabled ? 'warn' : 'primary'"
                    (click)="toggleGameStatus(game)"
                    [matTooltip]="game.isEnabled ? 'Deshabilitar' : 'Habilitar'">
              <mat-icon>{{game.isEnabled ? 'block' : 'check_circle'}}</mat-icon>
            </button>
          </td>
        </ng-container>
        
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      
      <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
    </div>
  `
})
export class GameAdminComponent implements OnInit {
  // Implementación...
  
  // Cambiar estado del juego
  async toggleGameStatus(game: any): Promise<void> {
    if (game.isEnabled) {
      // Mostrar diálogo para confirmar deshabilitación
      const dialogRef = this.dialog.open(DisableGameDialogComponent, {
        width: '400px',
        data: { gameTitle: game.title }
      });
      
      dialogRef.afterClosed().subscribe(async reason => {
        if (reason) {
          await this.gameAdminService.disableGame(game.id, reason);
          this.notificationService.showSuccess('Juego deshabilitado correctamente');
          this.loadGames();
        }
      });
    } else {
      // Habilitar juego
      await this.gameAdminService.enableGame(game.id);
      this.notificationService.showSuccess('Juego habilitado correctamente');
      this.loadGames();
    }
  }
}
```

## Actualización de Juegos

### Proceso de Actualización

Los alumnos participantes podrán actualizar sus minijuegos después de haberlos subido inicialmente.

```typescript
// Servicio de gestión de juegos
@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Actualizar juego existente
  async updateGame(gameId: string, gameData: any, files?: File[]): Promise<void> {
    // Verificar que el usuario sea el propietario
    const game = await this.firestore.collection('games').doc(gameId).get().toPromise();
    const gameInfo = game.data();
    
    if (gameInfo.userId !== this.authService.currentUserId) {
      throw new Error('No tienes permiso para actualizar este juego');
    }
    
    // Si hay archivos nuevos, subirlos
    if (files && files.length > 0) {
      // Eliminar archivos antiguos
      await this.storageService.deleteGameFiles(gameId);
      
      // Subir nuevos archivos
      await this.storageService.uploadGameFiles(gameId, files);
      
      // Actualizar URL del juego
      gameData.gameUrl = await this.storageService.getGameFileUrl(gameId, 'index.html');
    }
    
    // Actualizar datos del juego
    await this.firestore.collection('games').doc(gameId).update({
      ...gameData,
      updatedAt: new Date(),
      status: 'pending' // Volver a estado pendiente para revisión
    });
    
    // Notificar a administradores
    await this.notificationService.notifyAdmins(
      'Juego actualizado',
      `El juego "${gameData.title}" ha sido actualizado y requiere revisión.`
    );
  }
  
  // Obtener historial de versiones
  async getGameVersionHistory(gameId: string): Promise<any[]> {
    return this.firestore.collection('gameVersions')
      .where('gameId', '==', gameId)
      .orderBy('createdAt', 'desc')
      .get().toPromise()
      .then(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
  }
  
  // Crear versión en historial
  private async createVersionRecord(gameId: string, gameData: any): Promise<void> {
    await this.firestore.collection('gameVersions').add({
      gameId,
      versionData: gameData,
      createdAt: new Date(),
      createdBy: this.authService.currentUserId
    });
  }
}
```

### Interfaz de Actualización

```typescript
// Componente de actualización de juego
@Component({
  selector: 'app-game-update',
  template: `
    <div class="update-container">
      <h2>Actualizar Juego</h2>
      
      <form [formGroup]="updateForm" (ngSubmit)="onSubmit()">
        <!-- Campos del formulario -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Título</mat-label>
          <input matInput formControlName="title" required>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="4" required></textarea>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Instrucciones</mat-label>
          <textarea matInput formControlName="instructions" rows="4" required></textarea>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Controles</mat-label>
          <textarea matInput formControlName="controls" rows="3" required></textarea>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Créditos</mat-label>
          <textarea matInput formControlName="credits" rows="3" required></textarea>
        </mat-form-field>
        
        <!-- Sección de archivos -->
        <div class="file-upload-section">
          <h3>Archivos del Juego</h3>
          <p>Puedes mantener los archivos actuales o subir nuevos archivos.</p>
          
          <mat-radio-group [(ngModel)]="fileUpdateOption" [ngModelOptions]="{standalone: true}">
            <mat-radio-button value="keep">Mantener archivos actuales</mat-radio-button>
            <mat-radio-button value="update">Subir nuevos archivos</mat-radio-button>
          </mat-radio-group>
          
          <div *ngIf="fileUpdateOption === 'update'" class="file-dropzone"
               appDragDrop (fileDropped)="onFileDropped($event)">
            <input type="file" #fileInput multiple (change)="fileBrowseHandler($event)" style="display: none">
            
            <div class="dropzone-content">
              <mat-icon>cloud_upload</mat-icon>
              <h3>Arrastra y suelta archivos aquí</h3>
              <p>o</p>
              <button type="button" mat-raised-button color="primary" (click)="fileInput.click()">
                Seleccionar Archivos
              </button>
            </div>
          </div>
          
          <div *ngIf="files.length > 0" class="file-list">
            <h4>Archivos seleccionados:</h4>
            <mat-list>
              <mat-list-item *ngFor="let file of files; let i = index">
                {{file.name}} ({{formatFileSize(file.size)}})
                <button mat-icon-button color="warn" (click)="removeFile(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-list-item>
            </mat-list>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" mat-button (click)="cancel()">Cancelar</button>
          <button type="submit" mat-raised-button color="primary" [disabled]="updateForm.invalid || loading">
            <mat-spinner *ngIf="loading" diameter="20" class="spinner-button"></mat-spinner>
            Actualizar Juego
          </button>
        </div>
      </form>
    </div>
  `
})
export class GameUpdateComponent implements OnInit {
  // Implementación...
  
  async onSubmit(): Promise<void> {
    if (this.updateForm.invalid) return;
    
    this.loading = true;
    
    try {
      const gameData = this.updateForm.value;
      
      if (this.fileUpdateOption === 'update' && this.files.length > 0) {
        await this.gameService.updateGame(this.gameId, gameData, this.files);
      } else {
        await this.gameService.updateGame(this.gameId, gameData);
      }
      
      this.notificationService.showSuccess('Juego actualizado correctamente');
      this.router.navigate(['/games/my-games']);
    } catch (error) {
      this.notificationService.showError('Error al actualizar el juego', error.message);
    } finally {
      this.loading = false;
    }
  }
}
```

## Recuperación de Contraseñas

### Implementación con Firebase Auth

Se utilizará el sistema de recuperación de contraseñas integrado de Firebase Authentication.

```typescript
// Servicio de autenticación
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}
  
  // Enviar correo de recuperación de contraseña
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // Verificar que el correo sea institucional
      if (!email.endsWith('@alumnos.santotomas.cl')) {
        throw new Error('Debe utilizar un correo institucional (@alumnos.santotomas.cl)');
      }
      
      // Enviar correo de recuperación
      await this.afAuth.sendPasswordResetEmail(email, {
        url: `${window.location.origin}/auth/login`, // URL de redirección después de restablecer
        handleCodeInApp: true
      });
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      throw error;
    }
  }
}
```

### Componente de Recuperación

```typescript
// Componente de recuperación de contraseña
@Component({
  selector: 'app-password-reset',
  template: `
    <div class="reset-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Recuperar Contraseña</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <p>Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.</p>
          
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo Electrónico</mat-label>
              <input matInput formControlName="email" type="email" required>
              <mat-error *ngIf="resetForm.get('email').hasError('required')">
                El correo es obligatorio
              </mat-error>
              <mat-error *ngIf="resetForm.get('email').hasError('email')">
                Ingresa un correo válido
              </mat-error>
              <mat-error *ngIf="resetForm.get('email').hasError('pattern')">
                Debe ser un correo institucional (@alumnos.santotomas.cl)
              </mat-error>
            </mat-form-field>
            
            <div class="form-actions">
              <button type="button" mat-button routerLink="/auth/login">Volver al Inicio de Sesión</button>
              <button type="submit" mat-raised-button color="primary" 
                      [disabled]="resetForm.invalid || loading">
                <mat-spinner *ngIf="loading" diameter="20" class="spinner-button"></mat-spinner>
                Enviar Enlace
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class PasswordResetComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationUIService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern('.*@alumnos\\.santotomas\\.cl$')
      ]]
    });
  }
  
  ngOnInit(): void {}
  
  async onSubmit(): Promise<void> {
    if (this.resetForm.invalid) return;
    
    this.loading = true;
    
    try {
      const email = this.resetForm.get('email').value;
      await this.authService.sendPasswordResetEmail(email);
      
      this.notificationService.showSuccess(
        'Correo enviado',
        'Se ha enviado un enlace de recuperación a tu correo electrónico'
      );
    } catch (error) {
      this.notificationService.showError(
        'Error',
        error.message || 'No se pudo enviar el correo de recuperación'
      );
    } finally {
      this.loading = false;
    }
  }
}
```
