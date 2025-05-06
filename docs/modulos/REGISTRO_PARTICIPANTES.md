# Módulo de Registro de Participantes

Este documento detalla los requerimientos e implementación del módulo de registro de participantes para la plataforma de competencia de minijuegos con temáticas chilenas.

## Requerimientos Funcionales

- RF07: El sistema debe permitir a los participantes registrarse individualmente o en parejas
- RF08: El sistema debe mostrar las temáticas disponibles para selección
- RF09: El sistema debe impedir la selección de temáticas ya reservadas
- RF10: El sistema debe registrar la fecha y hora de reserva de temáticas

## Descripción de la Funcionalidad

El módulo de registro de participantes permite a los alumnos registrarse para participar en la competencia, ya sea de forma individual o en parejas, y seleccionar una temática chilena para su minijuego. Este proceso es fundamental para establecer las bases de la competencia y asegurar una distribución adecuada de las temáticas.

### Registro Individual o en Parejas

Los participantes pueden elegir entre dos modalidades:

1. **Participación Individual**: Un solo alumno desarrolla el minijuego
2. **Participación en Pareja**: Dos alumnos colaboran en el desarrollo del minijuego

En ambos casos, se requiere que todos los participantes tengan correos institucionales validados (@alumnos.santotomas.cl) y que hayan completado el proceso de verificación de correo.

### Selección de Temáticas

La plataforma ofrece un catálogo de temáticas chilenas predefinidas para los minijuegos. Cada temática incluye:

- Nombre descriptivo
- Descripción detallada
- Imagen representativa
- Estado de disponibilidad

Una vez que un participante o equipo selecciona una temática, esta queda reservada y no estará disponible para otros participantes. El sistema registra automáticamente la fecha y hora de la reserva.

## Flujo de Trabajo

### Proceso de Registro y Selección de Temática

1. **Inicio del Proceso**:
   - El usuario accede a la sección "Participar" después de iniciar sesión
   - El sistema verifica que el usuario tenga correo verificado

2. **Selección de Modalidad**:
   - El usuario elige entre participación individual o en pareja
   - Si elige en pareja, debe ingresar el correo institucional del compañero
   - El sistema valida que el compañero tenga una cuenta verificada

3. **Exploración de Temáticas**:
   - El sistema muestra el catálogo de temáticas disponibles
   - El usuario puede ver detalles de cada temática
   - Las temáticas ya reservadas aparecen como no disponibles

4. **Reserva de Temática**:
   - El usuario selecciona una temática disponible
   - El sistema solicita confirmación
   - Al confirmar, el sistema registra la reserva con fecha y hora

5. **Confirmación**:
   - El sistema muestra un resumen de la participación
   - Se envía un correo de confirmación a los participantes
   - Se habilita la opción para subir el minijuego (cuando la fase correspondiente esté activa)

## Implementación Técnica

### Modelo de Datos

```typescript
// Colección 'participants'
interface Participant {
  id: string;                 // ID único
  userId: string;             // ID del usuario principal
  partnerId?: string;         // ID del compañero (si es en pareja)
  themeId: string;            // ID de la temática seleccionada
  registrationType: 'individual' | 'pair';  // Tipo de registro
  registrationDate: Timestamp;  // Fecha y hora de registro
  gameId?: string;            // ID del juego (una vez subido)
  status: 'registered' | 'game_uploaded' | 'evaluated' | 'completed';  // Estado
}
```

### Servicio de Registro de Participantes

```typescript
// src/app/core/services/participant.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NotificationService } from './notification.service';
import { Observable, from, throwError, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private notificationService: NotificationService
  ) {}

  /**
   * Registra un participante individual
   */
  registerIndividualParticipant(userId: string, themeId: string): Observable<string> {
    // Verificar si el usuario ya está registrado
    return this.checkUserRegistration(userId).pipe(
      switchMap(isRegistered => {
        if (isRegistered) {
          return throwError(() => new Error('El usuario ya está registrado en la competencia'));
        }
        
        // Verificar disponibilidad de la temática
        return this.checkThemeAvailability(themeId);
      }),
      switchMap(isAvailable => {
        if (!isAvailable) {
          return throwError(() => new Error('La temática seleccionada ya no está disponible'));
        }
        
        // Crear registro de participante
        const participantData = {
          userId: userId,
          themeId: themeId,
          registrationType: 'individual',
          registrationDate: firebase.default.firestore.FieldValue.serverTimestamp(),
          status: 'registered'
        };
        
        // Guardar en Firestore
        const participantRef = this.afs.collection('participants').doc();
        return from(participantRef.set(participantData)).pipe(
          switchMap(() => {
            // Actualizar estado de la temática
            return this.updateThemeStatus(themeId, userId);
          }),
          map(() => participantRef.id)
        );
      })
    );
  }

  /**
   * Registra un equipo de dos participantes
   */
  registerPairParticipants(userId: string, partnerId: string, themeId: string): Observable<string> {
    // Verificar si alguno de los usuarios ya está registrado
    return this.checkUserRegistration(userId).pipe(
      switchMap(isUserRegistered => {
        if (isUserRegistered) {
          return throwError(() => new Error('El usuario principal ya está registrado en la competencia'));
        }
        
        return this.checkUserRegistration(partnerId);
      }),
      switchMap(isPartnerRegistered => {
        if (isPartnerRegistered) {
          return throwError(() => new Error('El compañero ya está registrado en la competencia'));
        }
        
        // Verificar disponibilidad de la temática
        return this.checkThemeAvailability(themeId);
      }),
      switchMap(isAvailable => {
        if (!isAvailable) {
          return throwError(() => new Error('La temática seleccionada ya no está disponible'));
        }
        
        // Crear registro de participantes
        const participantData = {
          userId: userId,
          partnerId: partnerId,
          themeId: themeId,
          registrationType: 'pair',
          registrationDate: firebase.default.firestore.FieldValue.serverTimestamp(),
          status: 'registered'
        };
        
        // Guardar en Firestore
        const participantRef = this.afs.collection('participants').doc();
        return from(participantRef.set(participantData)).pipe(
          switchMap(() => {
            // Actualizar estado de la temática
            return this.updateThemeStatus(themeId, userId);
          }),
          map(() => participantRef.id)
        );
      })
    );
  }

  /**
   * Verifica si un usuario ya está registrado
   */
  private checkUserRegistration(userId: string): Observable<boolean> {
    return this.afs.collection('participants', ref => 
      ref.where('userId', '==', userId)
        .limit(1)
    ).get().pipe(
      map(snapshot => !snapshot.empty),
      catchError(error => {
        console.error('Error al verificar registro de usuario:', error);
        return of(true); // Asumir que está registrado en caso de error
      })
    );
  }

  /**
   * Verifica si una temática está disponible
   */
  private checkThemeAvailability(themeId: string): Observable<boolean> {
    return this.afs.collection('themes').doc(themeId).get().pipe(
      map(doc => {
        if (!doc.exists) {
          throw new Error('La temática seleccionada no existe');
        }
        
        const data = doc.data() as any;
        return data.isAvailable === true;
      }),
      catchError(error => {
        console.error('Error al verificar disponibilidad de temática:', error);
        return of(false);
      })
    );
  }

  /**
   * Actualiza el estado de una temática a reservada
   */
  private updateThemeStatus(themeId: string, userId: string): Observable<void> {
    return from(this.afs.collection('themes').doc(themeId).update({
      isAvailable: false,
      reservedBy: userId,
      reservedAt: firebase.default.firestore.FieldValue.serverTimestamp()
    }));
  }

  /**
   * Obtiene los detalles de participación de un usuario
   */
  getParticipantDetails(userId: string): Observable<any> {
    return this.afs.collection('participants', ref => 
      ref.where('userId', '==', userId)
        .limit(1)
    ).snapshotChanges().pipe(
      map(actions => {
        if (actions.length === 0) {
          return null;
        }
        
        const data = actions[0].payload.doc.data() as any;
        const id = actions[0].payload.doc.id;
        
        return { id, ...data };
      })
    );
  }

  /**
   * Obtiene las temáticas disponibles
   */
  getAvailableThemes(): Observable<any[]> {
    return this.afs.collection('themes', ref => 
      ref.where('isAvailable', '==', true)
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  /**
   * Obtiene todas las temáticas
   */
  getAllThemes(): Observable<any[]> {
    return this.afs.collection('themes').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }
}
```

### Componente de Registro de Participantes

```typescript
// src/app/modules/participant/components/registration/registration.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ParticipantService } from '../../../../core/services/participant.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  themes: any[] = [];
  loading = false;
  error: string | null = null;
  success = false;
  participationType: 'individual' | 'pair' = 'individual';
  currentUser: any;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private participantService: ParticipantService,
    private notificationService: NotificationService
  ) {
    this.registrationForm = this.fb.group({
      participationType: ['individual', Validators.required],
      partnerEmail: ['', [Validators.email]],
      themeId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Obtener usuario actual
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      
      // Verificar si ya está registrado
      this.participantService.getParticipantDetails(user.uid).subscribe(details => {
        if (details) {
          this.router.navigate(['/participant/dashboard']);
        }
      });
    });
    
    // Cargar temáticas disponibles
    this.loadThemes();
    
    // Actualizar validadores cuando cambia el tipo de participación
    this.registrationForm.get('participationType')?.valueChanges.subscribe(value => {
      this.participationType = value;
      
      if (value === 'pair') {
        this.registrationForm.get('partnerEmail')?.setValidators([Validators.required, Validators.email]);
      } else {
        this.registrationForm.get('partnerEmail')?.clearValidators();
        this.registrationForm.get('partnerEmail')?.setValue('');
      }
      
      this.registrationForm.get('partnerEmail')?.updateValueAndValidity();
    });
  }

  loadThemes(): void {
    this.loading = true;
    this.participantService.getAvailableThemes()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (themes) => {
          this.themes = themes;
        },
        error: (err) => {
          this.error = 'Error al cargar las temáticas disponibles';
          console.error(err);
        }
      });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) return;
    
    this.loading = true;
    this.error = null;
    
    const participationType = this.registrationForm.get('participationType')?.value;
    const themeId = this.registrationForm.get('themeId')?.value;
    
    if (participationType === 'individual') {
      this.registerIndividual(themeId);
    } else {
      const partnerEmail = this.registrationForm.get('partnerEmail')?.value;
      this.registerPair(partnerEmail, themeId);
    }
  }

  registerIndividual(themeId: string): void {
    this.participantService.registerIndividualParticipant(this.currentUser.uid, themeId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (participantId) => {
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/participant/dashboard']);
          }, 2000);
        },
        error: (err) => {
          this.error = err.message;
        }
      });
  }

  registerPair(partnerEmail: string, themeId: string): void {
    // Primero obtener el ID del compañero
    this.authService.getUserByEmail(partnerEmail)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (partner) => {
          if (!partner) {
            this.error = 'El correo del compañero no está registrado en el sistema';
            return;
          }
          
          // Registrar el equipo
          this.loading = true;
          this.participantService.registerPairParticipants(this.currentUser.uid, partner.uid, themeId)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
              next: (participantId) => {
                this.success = true;
                
                // Enviar notificación al compañero
                this.notificationService.sendPartnerNotification(
                  partnerEmail,
                  this.currentUser.displayName,
                  this.themes.find(t => t.id === themeId)?.name
                );
                
                setTimeout(() => {
                  this.router.navigate(['/participant/dashboard']);
                }, 2000);
              },
              error: (err) => {
                this.error = err.message;
              }
            });
        },
        error: (err) => {
          this.error = 'Error al verificar el correo del compañero';
        }
      });
  }

  getThemeDetails(themeId: string): any {
    return this.themes.find(theme => theme.id === themeId);
  }
}
```

### Plantilla HTML del Componente

```html
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">Registro de Participación</h4>
        </div>
        <div class="card-body">
          <div *ngIf="success" class="alert alert-success">
            <h5>¡Registro exitoso!</h5>
            <p>Tu participación ha sido registrada correctamente. Serás redirigido a tu panel de participante.</p>
          </div>
          
          <form *ngIf="!success" [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="form-label">Tipo de Participación</label>
              <div class="d-flex">
                <div class="form-check me-4">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    id="individual" 
                    value="individual" 
                    formControlName="participationType"
                  >
                  <label class="form-check-label" for="individual">
                    Individual
                  </label>
                </div>
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    id="pair" 
                    value="pair" 
                    formControlName="participationType"
                  >
                  <label class="form-check-label" for="pair">
                    En Pareja
                  </label>
                </div>
              </div>
            </div>
            
            <div *ngIf="participationType === 'pair'" class="mb-4">
              <label for="partnerEmail" class="form-label">Correo de tu Compañero</label>
              <input 
                type="email" 
                class="form-control" 
                id="partnerEmail" 
                formControlName="partnerEmail"
                placeholder="compañero@alumnos.santotomas.cl"
              >
              <div class="form-text">
                Tu compañero debe tener una cuenta verificada en la plataforma.
              </div>
              <div *ngIf="registrationForm.get('partnerEmail')?.invalid && registrationForm.get('partnerEmail')?.touched" class="text-danger">
                Por favor, ingresa un correo institucional válido.
              </div>
            </div>
            
            <div class="mb-4">
              <label for="themeId" class="form-label">Selecciona una Temática</label>
              <select 
                class="form-select" 
                id="themeId" 
                formControlName="themeId"
              >
                <option value="">-- Selecciona una temática --</option>
                <option *ngFor="let theme of themes" [value]="theme.id">{{ theme.name }}</option>
              </select>
              <div *ngIf="registrationForm.get('themeId')?.value" class="mt-3">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">{{ getThemeDetails(registrationForm.get('themeId')?.value)?.name }}</h5>
                    <p class="card-text">{{ getThemeDetails(registrationForm.get('themeId')?.value)?.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div *ngIf="error" class="alert alert-danger">
              {{ error }}
            </div>
            
            <div class="d-grid">
              <button 
                type="submit" 
                class="btn btn-primary" 
                [disabled]="registrationForm.invalid || loading"
              >
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                Registrar Participación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Consideraciones de Seguridad

1. **Validación de Usuarios**:
   - Verificar que todos los participantes tengan correos institucionales validados
   - Comprobar que los usuarios no estén ya registrados en la competencia

2. **Reserva de Temáticas**:
   - Implementar bloqueo optimista para evitar conflictos en la reserva
   - Registrar información de auditoría (quién, cuándo) para cada reserva

3. **Protección de Datos**:
   - Limitar la visibilidad de los datos de participación según el rol
   - Implementar reglas de seguridad en Firestore para proteger los registros

## Reglas de Seguridad de Firestore

```
match /participants/{participantId} {
  allow read: if request.auth != null && (
    resource.data.userId == request.auth.uid || 
    resource.data.partnerId == request.auth.uid || 
    request.auth.token.role == 'admin'
  );
  allow create: if request.auth != null && request.auth.token.role == 'participant';
  allow update: if request.auth != null && (
    resource.data.userId == request.auth.uid || 
    request.auth.token.role == 'admin'
  );
  allow delete: if request.auth != null && request.auth.token.role == 'admin';
}

match /themes/{themeId} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'admin';
}
```

## Casos de Prueba

1. **Registro Individual**:
   - Verificar que un usuario pueda registrarse individualmente
   - Comprobar que la temática quede correctamente reservada

2. **Registro en Pareja**:
   - Verificar que dos usuarios puedan registrarse como equipo
   - Comprobar que ambos usuarios queden vinculados al mismo registro

3. **Validaciones**:
   - Intentar registrar a un usuario ya registrado
   - Intentar seleccionar una temática ya reservada
   - Verificar que el compañero tenga una cuenta verificada
