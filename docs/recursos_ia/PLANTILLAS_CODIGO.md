# Plantillas de Código

Este documento proporciona plantillas y ejemplos de código para los componentes principales de la plataforma de competencia de minijuegos, diseñados para facilitar la generación de código mediante IA.

## Índice

1. [Servicios](#servicios)
2. [Componentes](#componentes)
3. [Modelos de Datos](#modelos-de-datos)
4. [Guards](#guards)
5. [Interceptores](#interceptores)
6. [Directivas](#directivas)
7. [Pipes](#pipes)

## Servicios

### Plantilla de Servicio Básico

```typescript
// src/app/core/services/nombre-servicio.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NombreServicioService {
  constructor(private afs: AngularFirestore) {}

  /**
   * Obtiene un elemento por su ID
   */
  getItem(id: string): Observable<any> {
    return this.afs.collection('coleccion').doc(id).valueChanges()
      .pipe(
        map(item => {
          if (!item) return null;
          return { id, ...item };
        })
      );
  }

  /**
   * Obtiene una lista de elementos
   */
  getItems(): Observable<any[]> {
    return this.afs.collection('coleccion', ref => 
      ref.orderBy('campo', 'desc').limit(10)
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  /**
   * Crea un nuevo elemento
   */
  createItem(data: any): Promise<string> {
    const id = this.afs.createId();
    return this.afs.collection('coleccion').doc(id).set({
      ...data,
      createdAt: new Date()
    })
    .then(() => id);
  }

  /**
   * Actualiza un elemento existente
   */
  updateItem(id: string, data: any): Promise<void> {
    return this.afs.collection('coleccion').doc(id).update({
      ...data,
      updatedAt: new Date()
    });
  }

  /**
   * Elimina un elemento
   */
  deleteItem(id: string): Promise<void> {
    return this.afs.collection('coleccion').doc(id).delete();
  }
}
```

### Plantilla de Servicio de Autenticación

```typescript
// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, map, take } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): Observable<string | null> {
    return this.user$.pipe(
      map(user => user ? user.role : null)
    );
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): Observable<boolean> {
    return this.getUserRole().pipe(
      map(userRole => userRole === role)
    );
  }

  /**
   * Registra un nuevo usuario
   */
  async register(email: string, password: string, displayName: string, role: string = 'participant'): Promise<string> {
    try {
      const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      
      if (credential.user) {
        // Actualizar perfil
        await credential.user.updateProfile({ displayName });
        
        // Guardar datos adicionales en Firestore
        await this.afs.collection('users').doc(credential.user.uid).set({
          uid: credential.user.uid,
          email: email,
          displayName: displayName,
          role: role,
          createdAt: new Date()
        });
        
        return credential.user.uid;
      } else {
        throw new Error('No se pudo crear el usuario');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async login(email: string, password: string): Promise<void> {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Cierra la sesión actual
   */
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por su email
   */
  getUserByEmail(email: string): Observable<User | null> {
    return this.afs.collection<User>('users', ref => 
      ref.where('email', '==', email).limit(1)
    ).valueChanges().pipe(
      take(1),
      map(users => users.length > 0 ? users[0] : null)
    );
  }
}
```

### Plantilla de Servicio de Notificaciones

```typescript
// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from '../../../environments/environment';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Resend } from 'resend';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private resendApiKey = environment.resendApiKey;

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore
  ) {}

  /**
   * Envía un correo electrónico
   */
  sendEmail(to: string, subject: string, templateId: string, templateData: any): Observable<any> {
    // Crear el contenido HTML basado en la plantilla y los datos
    const htmlContent = this.getTemplateHtml(templateId, {
      ...templateData,
      platformName: 'Competencia de Minijuegos con Temáticas Chilenas',
      platformUrl: window.location.origin
    });
    
    const emailData = {
      from: 'Competencia Minijuegos <noreply@minijuegos-chile.com>',
      to: to,
      subject: subject,
      html: htmlContent
    };

    return this.http.post(
      'https://api.resend.com/emails',
      emailData,
      {
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  /**
   * Envía un código de verificación
   */
  sendVerificationCode(email: string, code: string): Observable<any> {
    return this.sendEmail(
      email,
      'Código de Verificación - Competencia de Minijuegos',
      'verification-code',
      {
        code: code,
        email: email,
        expirationMinutes: 15
      }
    );
  }

  /**
   * Registra una notificación en el sistema
   */
  createNotification(userId: string, title: string, message: string, type: string, relatedId?: string): Observable<string> {
    const notificationData = {
      userId,
      title,
      message,
      type,
      relatedId,
      isRead: false,
      createdAt: new Date(),
      emailSent: false
    };
    
    const notificationRef = this.afs.collection('notifications').doc();
    
    return from(notificationRef.set(notificationData)).pipe(
      map(() => notificationRef.id)
    );
  }

  /**
   * Obtiene las notificaciones de un usuario
   */
  getUserNotifications(userId: string): Observable<any[]> {
    return this.afs.collection('notifications', ref => 
      ref.where('userId', '==', userId)
         .orderBy('createdAt', 'desc')
         .limit(50)
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  /**
   * Marca una notificación como leída
   */
  markAsRead(notificationId: string): Promise<void> {
    return this.afs.collection('notifications').doc(notificationId).update({
      isRead: true
    });
  }
}
```

## Componentes

### Plantilla de Componente Básico

```typescript
// src/app/modules/nombre-modulo/components/nombre-componente/nombre-componente.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-nombre-componente',
  templateUrl: './nombre-componente.component.html',
  styleUrls: ['./nombre-componente.component.scss']
})
export class NombreComponenteComponent implements OnInit {
  @Input() inputData: any;
  @Output() outputEvent = new EventEmitter<any>();
  
  form: FormGroup;
  loading = false;
  error: string | null = null;
  
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      campo1: ['', [Validators.required]],
      campo2: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Inicialización del componente
    if (this.inputData) {
      this.form.patchValue(this.inputData);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    
    this.loading = true;
    this.error = null;
    
    const formData = this.form.value;
    
    // Lógica de procesamiento
    
    // Emitir resultado
    this.outputEvent.emit(formData);
    
    this.loading = false;
  }

  resetForm(): void {
    this.form.reset();
    this.error = null;
  }
}
```

### Plantilla de HTML para Componente

```html
<!-- src/app/modules/nombre-modulo/components/nombre-componente/nombre-componente.component.html -->
<div class="container">
  <div class="row">
    <div class="col-md-8 offset-md-2">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">Título del Componente</h4>
        </div>
        <div class="card-body">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Campo 1 -->
            <div class="mb-3">
              <label for="campo1" class="form-label">Campo 1</label>
              <input 
                type="text" 
                class="form-control" 
                id="campo1" 
                formControlName="campo1"
                [class.is-invalid]="form.get('campo1')?.invalid && form.get('campo1')?.touched"
              >
              <div *ngIf="form.get('campo1')?.invalid && form.get('campo1')?.touched" class="invalid-feedback">
                Este campo es obligatorio
              </div>
            </div>
            
            <!-- Campo 2 -->
            <div class="mb-3">
              <label for="campo2" class="form-label">Campo 2</label>
              <input 
                type="email" 
                class="form-control" 
                id="campo2" 
                formControlName="campo2"
                [class.is-invalid]="form.get('campo2')?.invalid && form.get('campo2')?.touched"
              >
              <div *ngIf="form.get('campo2')?.invalid && form.get('campo2')?.touched" class="invalid-feedback">
                <span *ngIf="form.get('campo2')?.errors?.['required']">Este campo es obligatorio</span>
                <span *ngIf="form.get('campo2')?.errors?.['email']">Debe ser un correo electrónico válido</span>
              </div>
            </div>
            
            <!-- Mensaje de error -->
            <div *ngIf="error" class="alert alert-danger">
              {{ error }}
            </div>
            
            <!-- Botones -->
            <div class="d-flex justify-content-between">
              <button 
                type="button" 
                class="btn btn-secondary" 
                (click)="resetForm()"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                [disabled]="form.invalid || loading"
              >
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Plantilla de Componente de Tabla

```typescript
// src/app/modules/nombre-modulo/components/tabla-componente/tabla-componente.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tabla-componente',
  templateUrl: './tabla-componente.component.html',
  styleUrls: ['./tabla-componente.component.scss']
})
export class TablaComponenteComponent implements OnInit {
  @Input() items: any[] = [];
  @Input() columns: {key: string, label: string}[] = [];
  @Input() loading = false;
  @Output() viewItem = new EventEmitter<string>();
  @Output() editItem = new EventEmitter<string>();
  @Output() deleteItem = new EventEmitter<string>();
  
  constructor() {}

  ngOnInit(): void {}

  onView(id: string): void {
    this.viewItem.emit(id);
  }
  
  onEdit(id: string): void {
    this.editItem.emit(id);
  }
  
  onDelete(id: string): void {
    if (confirm('¿Está seguro de eliminar este elemento?')) {
      this.deleteItem.emit(id);
    }
  }
}
```

```html
<!-- src/app/modules/nombre-modulo/components/tabla-componente/tabla-componente.component.html -->
<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
      <tr>
        <th *ngFor="let column of columns">{{ column.label }}</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngIf="loading">
        <td [attr.colspan]="columns.length + 1" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </td>
      </tr>
      <tr *ngIf="!loading && items.length === 0">
        <td [attr.colspan]="columns.length + 1" class="text-center">
          No hay elementos para mostrar
        </td>
      </tr>
      <tr *ngFor="let item of items">
        <td *ngFor="let column of columns">{{ item[column.key] }}</td>
        <td>
          <div class="btn-group">
            <button 
              type="button" 
              class="btn btn-sm btn-info" 
              (click)="onView(item.id)"
              title="Ver"
            >
              <i class="bi bi-eye"></i>
            </button>
            <button 
              type="button" 
              class="btn btn-sm btn-primary" 
              (click)="onEdit(item.id)"
              title="Editar"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button 
              type="button" 
              class="btn btn-sm btn-danger" 
              (click)="onDelete(item.id)"
              title="Eliminar"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Modelos de Datos

### Modelo de Usuario

```typescript
// src/app/core/models/user.model.ts
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'participant' | 'evaluator' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
  isPreregistered?: boolean;
  assignedGame?: string;
}
```

### Modelo de Juego

```typescript
// src/app/core/models/game.model.ts
export interface Game {
  id: string;
  title: string;
  description: string;
  instructions: string;
  controls: string;
  credits: string;
  themeId: string;
  themeName: string;
  userId: string;
  teamMembers: string[];
  status: 'pending' | 'approved' | 'rejected' | 'needs_corrections';
  gameUrl: string;
  coverImageUrl: string;
  iconUrl: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  rejectionReason?: string;
  correctionNotes?: string;
  
  // Campos de evaluación
  averageRating: number;
  ratingCount: number;
  graphicsRating: number;
  entertainmentRating: number;
  gameplayRating: number;
}
```

### Modelo de Evaluación

```typescript
// src/app/core/models/evaluation.model.ts
export interface Evaluation {
  id: string;
  gameId: string;
  evaluatorId: string;
  graphicsRating: number;
  entertainmentRating: number;
  gameplayRating: number;
  averageRating: number;
  comments: string;
  createdAt: Date;
  isAnonymous: boolean;
}
```

### Modelo de Temática

```typescript
// src/app/core/models/theme.model.ts
export interface Theme {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  reservedBy?: string;
  reservedAt?: Date;
}
```

### Modelo de Notificación

```typescript
// src/app/core/models/notification.model.ts
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'evaluation' | 'approval' | 'rejection' | 'correction' | 'system';
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
  emailSent: boolean;
}
```

### Modelo de Código de Verificación

```typescript
// src/app/core/models/verification-code.model.ts
export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  attempts: number;
  isVerified: boolean;
  createdAt: Date;
  expiresAt: Date;
}
```

## Guards

### Guard de Autenticación

```typescript
// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      map(user => !!user),
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          console.log('Acceso denegado, redirigiendo a login');
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
        }
      })
    );
  }
}
```

### Guard de Rol

```typescript
// src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredRole = route.data['role'] as string;

    return this.authService.user$.pipe(
      take(1),
      map(user => {
        if (!user) return false;
        return user.role === requiredRole;
      }),
      tap(hasRole => {
        if (!hasRole) {
          console.log('Acceso denegado, rol insuficiente');
          this.router.navigate(['/']);
        }
      })
    );
  }
}
```

## Interceptores

### Interceptor de Token

```typescript
// src/app/core/interceptors/token.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Solo interceptar peticiones a la API
    if (!request.url.includes(environment.apiUrl)) {
      return next.handle(request);
    }

    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          // Obtener token de Firebase
          return user.getIdToken().then(token => {
            // Clonar la petición y añadir el token
            const clonedReq = request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next.handle(clonedReq).toPromise();
          });
        } else {
          return next.handle(request).toPromise();
        }
      })
    );
  }
}
```

### Interceptor de Errores

```typescript
// src/app/core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error desconocido';
        
        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 401:
              errorMessage = 'No autorizado';
              this.router.navigate(['/auth/login']);
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
        
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
```

## Directivas

### Directiva de Control de Acceso por Rol

```typescript
// src/app/shared/directives/has-role.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit, OnDestroy {
  @Input('appHasRole') role: string;
  
  private subscription: Subscription;
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscription = this.authService.getUserRole().subscribe(userRole => {
      if (userRole === this.role && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (userRole !== this.role && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

### Directiva de Validación de Correo Institucional

```typescript
// src/app/shared/directives/institutional-email.directive.ts
import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[appInstitutionalEmail]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: InstitutionalEmailDirective,
      multi: true
    }
  ]
})
export class InstitutionalEmailDirective implements Validator {
  validate(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) {
      return null;
    }
    
    const isValid = control.value.endsWith('@alumnos.santotomas.cl');
    
    return isValid ? null : { 'institutionalEmail': true };
  }
}
```

## Pipes

### Pipe de Formato de Fecha

```typescript
// src/app/shared/pipes/date-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
  transform(value: any, format: string = 'dd/MM/yyyy HH:mm'): string | null {
    if (!value) return null;
    
    const datePipe = new DatePipe('es-CL');
    return datePipe.transform(value, format);
  }
}
```

### Pipe de Truncado de Texto

```typescript
// src/app/shared/pipes/truncate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 100, completeWords: boolean = false, ellipsis: string = '...'): string {
    if (!value) return '';
    
    if (value.length <= limit) {
      return value;
    }

    if (completeWords) {
      limit = value.substring(0, limit).lastIndexOf(' ');
    }
    
    return `${value.substring(0, limit)}${ellipsis}`;
  }
}
```
