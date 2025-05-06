# Módulo de Administración

Este documento detalla los requerimientos e implementación del módulo de administración para la plataforma de competencia de minijuegos con temáticas chilenas.

## Requerimientos Funcionales

- RF26: El sistema debe proporcionar un panel de administración para gestionar usuarios
- RF27: El sistema debe permitir a los administradores revisar y aprobar juegos
- RF28: El sistema debe permitir a los administradores configurar fechas y fases de la competencia
- RF29: El sistema debe generar estadísticas y reportes de la competencia
- RF30: El sistema debe permitir a los administradores preregistrar de forma masiva a los alumnos participantes
- RF31: El sistema debe validar que cada minijuego sea asignado a un máximo de 2 alumnos
- RF32: El sistema debe impedir que un minijuego sea asignado a más de un grupo de alumnos
- RF33: El sistema debe impedir que un alumno sea asignado a más de un minijuego

## Descripción de la Funcionalidad

### Preregistro Masivo de Alumnos

El preregistro masivo permite a los administradores registrar previamente a los alumnos que participarán en la competencia, asignándolos a minijuegos específicos y validando las restricciones establecidas:

1. Cada minijuego puede ser asignado a un máximo de 2 alumnos (individual o en pareja)
2. Un minijuego no puede ser asignado a más de un grupo de alumnos
3. Un alumno no puede ser asignado a más de un minijuego

## Interfaz de Usuario

### Pantalla de Preregistro Masivo

La interfaz de preregistro masivo incluirá:

1. **Carga de Archivo CSV**: Opción para cargar un archivo CSV con los datos de los alumnos
2. **Formulario de Ingreso Manual**: Alternativa para ingresar datos manualmente
3. **Vista Previa**: Tabla con los datos a registrar, con validación visual
4. **Registro por Lotes**: Botón para procesar el registro de todos los alumnos
5. **Notificaciones**: Sistema de alertas para informar sobre errores o éxito

### Estructura del Archivo CSV

El archivo CSV para el preregistro masivo debe seguir esta estructura:

```
correo_alumno1,correo_alumno2,nombre_minijuego
alumno1@alumnos.santotomas.cl,,Pudú Aventurero
alumno2@alumnos.santotomas.cl,alumno3@alumnos.santotomas.cl,Cóndor de los Andes
alumno4@alumnos.santotomas.cl,,Terremoto Chileno
```

Donde:
- `correo_alumno1`: Correo institucional del primer alumno (obligatorio)
- `correo_alumno2`: Correo institucional del segundo alumno (opcional, para participación en pareja)
- `nombre_minijuego`: Nombre exacto del minijuego a asignar

## Flujo de Trabajo

### Proceso de Preregistro Masivo

1. **Preparación de Datos**:
   - El administrador prepara el archivo CSV con los datos de los alumnos
   - Alternativamente, ingresa los datos manualmente en la interfaz

2. **Carga y Validación**:
   - El sistema carga los datos y realiza validaciones preliminares:
     - Verificar que los correos pertenezcan al dominio institucional (@alumnos.santotomas.cl)
     - Comprobar que no haya duplicados en los correos
     - Validar que no se asignen más de 2 alumnos a un minijuego
     - Verificar que no se asigne un minijuego a más de un grupo
     - Comprobar que un alumno no esté asignado a más de un minijuego

3. **Visualización de Resultados de Validación**:
   - El sistema muestra los resultados de la validación
   - Resalta los registros con errores
   - Proporciona mensajes específicos para cada tipo de error

4. **Confirmación y Registro**:
   - El administrador revisa los resultados y confirma el registro
   - El sistema procesa solo los registros válidos

5. **Creación de Cuentas y Notificación**:
   - Para cada registro válido, el sistema:
     - Crea una cuenta de usuario si no existe
     - Asigna una contraseña temporal aleatoria
     - Asigna el rol de participante
     - Asocia al alumno con el minijuego correspondiente
     - Envía un correo de notificación con las credenciales

## Implementación Técnica

### Modelo de Datos

```typescript
// Modelo para el preregistro
interface PreregistrationEntry {
  studentEmail1: string;
  studentEmail2?: string;
  gameName: string;
  isValid: boolean;
  errors: string[];
}

// Modelo para el resultado del preregistro
interface PreregistrationResult {
  success: number;
  failed: number;
  successEntries: {
    emails: string[];
    gameName: string;
    password?: string;
  }[];
  failedEntries: {
    emails: string[];
    gameName: string;
    errors: string[];
  }[];
}
```

### Servicio de Preregistro

```typescript
// src/app/core/services/preregistration.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NotificationService } from './notification.service';
import { Observable, from, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class PreregistrationService {
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private notificationService: NotificationService
  ) {}

  /**
   * Valida los datos de preregistro
   */
  validatePreregistrationData(entries: any[]): Observable<PreregistrationEntry[]> {
    // Convertir entradas a formato estándar
    const standardizedEntries: PreregistrationEntry[] = entries.map(entry => ({
      studentEmail1: this.normalizeEmail(entry.studentEmail1 || entry[0]),
      studentEmail2: this.normalizeEmail(entry.studentEmail2 || entry[1]),
      gameName: entry.gameName || entry[2],
      isValid: true,
      errors: []
    }));

    // Validar cada entrada
    standardizedEntries.forEach(entry => {
      // Validar correo principal
      if (!entry.studentEmail1 || !this.validateInstitutionalEmail(entry.studentEmail1)) {
        entry.isValid = false;
        entry.errors.push('El correo principal no es un correo institucional válido');
      }

      // Validar correo secundario si existe
      if (entry.studentEmail2 && !this.validateInstitutionalEmail(entry.studentEmail2)) {
        entry.isValid = false;
        entry.errors.push('El correo secundario no es un correo institucional válido');
      }

      // Validar nombre del minijuego
      if (!entry.gameName || entry.gameName.trim() === '') {
        entry.isValid = false;
        entry.errors.push('El nombre del minijuego es obligatorio');
      }
    });

    // Validar restricciones globales
    const emails = new Set<string>();
    const games = new Map<string, string[]>();

    standardizedEntries.forEach(entry => {
      if (!entry.isValid) return;

      // Verificar que un alumno no esté en más de un minijuego
      if (emails.has(entry.studentEmail1)) {
        entry.isValid = false;
        entry.errors.push(`El alumno ${entry.studentEmail1} ya está asignado a otro minijuego`);
      } else {
        emails.add(entry.studentEmail1);
      }

      if (entry.studentEmail2) {
        if (emails.has(entry.studentEmail2)) {
          entry.isValid = false;
          entry.errors.push(`El alumno ${entry.studentEmail2} ya está asignado a otro minijuego`);
        } else {
          emails.add(entry.studentEmail2);
        }
      }

      // Verificar que un minijuego no esté asignado a más de un grupo
      if (games.has(entry.gameName)) {
        entry.isValid = false;
        entry.errors.push(`El minijuego "${entry.gameName}" ya está asignado a otro grupo`);
      } else {
        games.set(entry.gameName, [entry.studentEmail1, entry.studentEmail2].filter(Boolean) as string[]);
      }
    });

    return of(standardizedEntries);
  }

  /**
   * Procesa el preregistro masivo de alumnos
   */
  bulkPreregister(validEntries: any[]): Observable<any> {
    const batch = this.afs.firestore.batch();
    const results = {
      success: 0,
      failed: 0,
      successEntries: [] as any[],
      failedEntries: [] as any[]
    };

    // Procesar cada entrada válida
    const registrationObservables = validEntries.filter(entry => entry.isValid).map(entry => {
      const emails = [entry.studentEmail1, entry.studentEmail2].filter(Boolean);
      const password = this.generateTemporaryPassword();
      
      // Crear objeto de resultado
      const resultEntry = {
        emails,
        gameName: entry.gameName,
        password
      };

      // Crear observables para cada correo
      const emailObservables = emails.map(email => 
        this.registerUser(email, password, 'participant', entry.gameName)
          .pipe(
            map(() => {
              // Enviar correo de notificación
              this.notificationService.sendPreregistrationNotification(
                email, 
                password, 
                entry.gameName
              );
              return true;
            }),
            catchError(error => {
              console.error(`Error al registrar ${email}:`, error);
              return of(false);
            })
          )
      );

      // Combinar resultados de todos los correos
      return forkJoin(emailObservables).pipe(
        map(results => {
          const allSuccess = results.every(r => r === true);
          
          if (allSuccess) {
            return { success: true, entry: resultEntry };
          } else {
            return { 
              success: false, 
              entry: { 
                emails, 
                gameName: entry.gameName, 
                errors: ['Error al crear la cuenta o asignar el minijuego'] 
              } 
            };
          }
        })
      );
    });

    // Procesar todos los registros
    return forkJoin(registrationObservables.length > 0 ? registrationObservables : [of(null)]).pipe(
      map(allResults => {
        allResults.forEach(result => {
          if (!result) return;
          
          if (result.success) {
            results.success++;
            results.successEntries.push(result.entry);
          } else {
            results.failed++;
            results.failedEntries.push(result.entry);
          }
        });
        
        return results;
      })
    );
  }

  /**
   * Registra un usuario y lo asocia con un minijuego
   */
  private registerUser(email: string, password: string, role: string, gameName: string): Observable<any> {
    // Verificar si el usuario ya existe
    return from(this.afAuth.fetchSignInMethodsForEmail(email)).pipe(
      switchMap(methods => {
        if (methods.length > 0) {
          // El usuario ya existe, solo actualizar su asignación
          return this.updateUserGameAssignment(email, gameName);
        } else {
          // Crear nuevo usuario
          return from(this.afAuth.createUserWithEmailAndPassword(email, password)).pipe(
            switchMap(credential => {
              // Crear documento de usuario
              const userData = {
                email,
                role,
                createdAt: firebase.default.firestore.FieldValue.serverTimestamp(),
                isPreregistered: true,
                assignedGame: gameName
              };
              
              return from(this.afs.collection('users').doc(credential.user?.uid).set(userData));
            })
          );
        }
      })
    );
  }

  /**
   * Actualiza la asignación de minijuego para un usuario existente
   */
  private updateUserGameAssignment(email: string, gameName: string): Observable<any> {
    return from(
      this.afs.collection('users', ref => ref.where('email', '==', email)).get()
    ).pipe(
      switchMap(snapshot => {
        if (snapshot.empty) {
          throw new Error(`Usuario no encontrado: ${email}`);
        }
        
        const userDoc = snapshot.docs[0];
        return from(userDoc.ref.update({
          assignedGame: gameName,
          isPreregistered: true
        }));
      })
    );
  }

  /**
   * Genera una contraseña temporal aleatoria
   */
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Valida que el correo sea institucional
   */
  private validateInstitutionalEmail(email: string): boolean {
    return email && email.endsWith('@alumnos.santotomas.cl');
  }

  /**
   * Normaliza un correo electrónico (trim y lowercase)
   */
  private normalizeEmail(email: string | undefined): string {
    if (!email) return '';
    return email.trim().toLowerCase();
  }
}
```

### Componente de Preregistro

```typescript
// src/app/modules/admin/components/preregistration/preregistration.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PreregistrationService } from '../../../../core/services/preregistration.service';
import { finalize } from 'rxjs/operators';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-preregistration',
  templateUrl: './preregistration.component.html',
  styleUrls: ['./preregistration.component.scss']
})
export class PreregistrationComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  
  preregistrationForm: FormGroup;
  manualEntryForm: FormGroup;
  entries: any[] = [];
  validatedEntries: any[] = [];
  loading = false;
  validating = false;
  processing = false;
  validated = false;
  results: any = null;
  
  constructor(
    private fb: FormBuilder,
    private preregistrationService: PreregistrationService
  ) {
    this.preregistrationForm = this.fb.group({
      csvFile: [null, Validators.required]
    });
    
    this.manualEntryForm = this.fb.group({
      studentEmail1: ['', [Validators.required, Validators.email]],
      studentEmail2: ['', Validators.email],
      gameName: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.preregistrationForm.patchValue({
        csvFile: file
      });
      
      this.parseCSV(file);
    }
  }

  parseCSV(file: File): void {
    this.validating = true;
    this.validated = false;
    this.entries = [];
    
    Papa.parse(file, {
      complete: (result) => {
        // Filtrar filas vacías
        this.entries = result.data.filter((row: any) => 
          Array.isArray(row) && row.length >= 3 && row[0] && row[0].trim() !== ''
        );
        
        this.validateEntries();
      },
      error: (error) => {
        console.error('Error al parsear CSV:', error);
        this.validating = false;
      }
    });
  }

  addManualEntry(): void {
    if (this.manualEntryForm.invalid) return;
    
    const entry = this.manualEntryForm.value;
    this.entries.push([
      entry.studentEmail1,
      entry.studentEmail2 || '',
      entry.gameName
    ]);
    
    this.manualEntryForm.reset();
    this.validateEntries();
  }

  validateEntries(): void {
    this.validating = true;
    this.validated = false;
    
    this.preregistrationService.validatePreregistrationData(this.entries)
      .pipe(finalize(() => {
        this.validating = false;
        this.validated = true;
      }))
      .subscribe(validatedEntries => {
        this.validatedEntries = validatedEntries;
      });
  }

  processPreregistration(): void {
    if (!this.validated || this.validatedEntries.length === 0) return;
    
    this.processing = true;
    this.results = null;
    
    this.preregistrationService.bulkPreregister(this.validatedEntries)
      .pipe(finalize(() => this.processing = false))
      .subscribe(results => {
        this.results = results;
        // Limpiar formularios y datos
        this.entries = [];
        this.validatedEntries = [];
        this.validated = false;
        this.preregistrationForm.reset();
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      });
  }

  resetForm(): void {
    this.entries = [];
    this.validatedEntries = [];
    this.validated = false;
    this.results = null;
    this.preregistrationForm.reset();
    this.manualEntryForm.reset();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  downloadTemplate(): void {
    const template = 'correo_alumno1,correo_alumno2,nombre_minijuego\nalumno1@alumnos.santotomas.cl,,Pudú Aventurero\nalumno2@alumnos.santotomas.cl,alumno3@alumnos.santotomas.cl,Cóndor de los Andes';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_preregistro.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
```

### Plantilla HTML del Componente

```html
<div class="container mt-4">
  <div class="row">
    <div class="col-12">
      <h2>Preregistro Masivo de Alumnos</h2>
      <p class="text-muted">
        Registre previamente a los alumnos participantes y asígnelos a minijuegos específicos.
      </p>
    </div>
  </div>

  <div class="row mt-3">
    <div class="col-md-6">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Carga de Archivo CSV</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="preregistrationForm">
            <div class="mb-3">
              <label for="csvFile" class="form-label">Archivo CSV</label>
              <input 
                type="file" 
                class="form-control" 
                id="csvFile" 
                accept=".csv" 
                (change)="onFileSelected($event)"
                #fileInput
              >
              <div class="form-text">
                El archivo debe tener el formato: correo_alumno1,correo_alumno2,nombre_minijuego
              </div>
            </div>
            <div class="d-flex justify-content-between">
              <button 
                type="button" 
                class="btn btn-outline-secondary" 
                (click)="downloadTemplate()"
              >
                Descargar Plantilla
              </button>
              <button 
                type="button" 
                class="btn btn-primary" 
                [disabled]="!preregistrationForm.valid || validating"
                (click)="validateEntries()"
              >
                <span *ngIf="validating" class="spinner-border spinner-border-sm me-2"></span>
                Validar Datos
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Ingreso Manual</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="manualEntryForm">
            <div class="mb-3">
              <label for="studentEmail1" class="form-label">Correo Alumno 1</label>
              <input 
                type="email" 
                class="form-control" 
                id="studentEmail1" 
                formControlName="studentEmail1"
                placeholder="alumno1@alumnos.santotomas.cl"
              >
            </div>
            <div class="mb-3">
              <label for="studentEmail2" class="form-label">Correo Alumno 2 (opcional)</label>
              <input 
                type="email" 
                class="form-control" 
                id="studentEmail2" 
                formControlName="studentEmail2"
                placeholder="alumno2@alumnos.santotomas.cl"
              >
            </div>
            <div class="mb-3">
              <label for="gameName" class="form-label">Nombre del Minijuego</label>
              <input 
                type="text" 
                class="form-control" 
                id="gameName" 
                formControlName="gameName"
                placeholder="Nombre del minijuego"
              >
            </div>
            <div class="d-flex justify-content-end">
              <button 
                type="button" 
                class="btn btn-primary" 
                [disabled]="!manualEntryForm.valid"
                (click)="addManualEntry()"
              >
                Agregar Entrada
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="validated && validatedEntries.length > 0" class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header bg-info text-white">
          <h5 class="mb-0">Entradas Validadas</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Correo Alumno 1</th>
                  <th>Correo Alumno 2</th>
                  <th>Minijuego</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let entry of validatedEntries" [ngClass]="{'table-danger': !entry.isValid}">
                  <td>{{ entry.studentEmail1 }}</td>
                  <td>{{ entry.studentEmail2 || '-' }}</td>
                  <td>{{ entry.gameName }}</td>
                  <td>
                    <span *ngIf="entry.isValid" class="badge bg-success">Válido</span>
                    <span *ngIf="!entry.isValid" class="badge bg-danger">Inválido</span>
                    <div *ngIf="!entry.isValid" class="small text-danger mt-1">
                      <div *ngFor="let error of entry.errors">{{ error }}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="mt-3 d-flex justify-content-between">
            <button 
              type="button" 
              class="btn btn-secondary" 
              (click)="resetForm()"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-success" 
              [disabled]="processing || validatedEntries.filter(e => e.isValid).length === 0"
              (click)="processPreregistration()"
            >
              <span *ngIf="processing" class="spinner-border spinner-border-sm me-2"></span>
              Procesar Preregistro
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="results" class="row mt-4">
    <div class="col-md-8 offset-md-2">
      <div class="card">
        <div class="card-header" [ngClass]="{'bg-success text-white': results.success > 0 && results.failed === 0, 'bg-warning': results.failed > 0 && results.success > 0, 'bg-danger text-white': results.success === 0 && results.failed > 0}">
          <h4 class="mb-0">Resultados del Preregistro</h4>
        </div>
        <div class="card-body">
          <div class="alert" [ngClass]="{'alert-success': results.success > 0 && results.failed === 0, 'alert-warning': results.failed > 0 && results.success > 0, 'alert-danger': results.success === 0 && results.failed > 0}">
            <p><strong>Resumen:</strong></p>
            <p>Registros exitosos: {{ results.success }}</p>
            <p>Registros fallidos: {{ results.failed }}</p>
          </div>
          
          <button 
            type="button" 
            class="btn btn-primary mt-3" 
            (click)="resetForm()"
          >
            Volver al Formulario
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Notificaciones por Correo

Para el envío de notificaciones a los alumnos preregistrados, se utilizará el servicio de notificaciones con la siguiente función adicional:

```typescript
// Añadir al NotificationService existente
sendPreregistrationNotification(recipientEmail: string, password: string, gameName: string) {
  const emailData = {
    to: recipientEmail,
    subject: `Preregistro - Competencia de Minijuegos`,
    templateId: 'preregistration-notification',
    templateData: {
      email: recipientEmail,
      password: password,
      gameName: gameName,
      platformName: 'Competencia de Minijuegos con Temáticas Chilenas',
      platformUrl: window.location.origin,
      loginUrl: `${window.location.origin}/auth/login`
    }
  };

  return this.http.post(
    `${this.zeniApiUrl}/send-email`,
    emailData,
    {
      headers: {
        'Authorization': `Bearer ${this.zeniApiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
}
```

## Consideraciones de Seguridad

1. **Validación de Datos**:
   - Validar rigurosamente todos los datos de entrada
   - Verificar que los correos pertenezcan al dominio institucional
   - Comprobar las restricciones de asignación de minijuegos

2. **Protección de Credenciales**:
   - Generar contraseñas temporales seguras
   - Requerir cambio de contraseña en el primer inicio de sesión
   - No almacenar contraseñas en texto plano

3. **Control de Acceso**:
   - Limitar esta funcionalidad exclusivamente a usuarios con rol de administrador
   - Implementar reglas de seguridad en Firestore para proteger los datos

## Reglas de Seguridad de Firestore

```
match /users/{userId} {
  allow read: if request.auth != null && (request.auth.uid == userId || request.auth.token.role == 'admin');
  allow create: if request.auth != null && request.auth.token.role == 'admin';
  allow update: if request.auth != null && (request.auth.uid == userId || request.auth.token.role == 'admin');
  allow delete: if request.auth != null && request.auth.token.role == 'admin';
}
```

## Casos de Prueba

1. **Validación de Datos**:
   - Probar con archivos CSV bien formateados
   - Probar con archivos CSV mal formateados
   - Verificar la validación de correos institucionales
   - Comprobar la detección de duplicados

2. **Restricciones de Asignación**:
   - Intentar asignar más de 2 alumnos a un minijuego
   - Intentar asignar un minijuego a más de un grupo
   - Intentar asignar un alumno a más de un minijuego

3. **Procesamiento de Preregistro**:
   - Verificar la creación correcta de cuentas
   - Comprobar la asignación de minijuegos
   - Verificar el envío de notificaciones por correo
