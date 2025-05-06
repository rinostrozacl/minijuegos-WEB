# Módulo de Autenticación

Este documento detalla los requerimientos e implementación del módulo de autenticación para la plataforma de competencia de minijuegos con temáticas chilenas.

## Requerimientos Funcionales

- RF01: El sistema debe permitir el registro de usuarios con correo institucional (@alumnos.santotomas.cl)
- RF02: El sistema debe validar que el correo electrónico pertenezca al dominio institucional (@alumnos.santotomas.cl)
- RF03: El sistema debe enviar un código de verificación al correo electrónico del usuario durante el registro
- RF04: El sistema debe requerir la validación del código enviado para completar el registro
- RF05: El sistema debe permitir el inicio de sesión de usuarios registrados
- RF06: El sistema debe implementar roles de usuario (participante, evaluador, administrador)

## Descripción de la Funcionalidad

### Verificación de Correo Electrónico

La verificación de correo electrónico mediante código es un proceso de seguridad que garantiza que los usuarios (alumnos y evaluadores) que se registran en la plataforma tengan acceso real a los correos institucionales que proporcionan. Esta funcionalidad:

1. Envía un código de verificación único al correo electrónico del usuario durante el proceso de registro
2. Requiere que el usuario ingrese este código en la plataforma para completar su registro
3. Previene registros fraudulentos o suplantación de identidad
4. Asegura que solo los alumnos y evaluadores con correos institucionales válidos puedan acceder a la plataforma

## Flujo de Trabajo

### Proceso de Registro y Verificación

1. **Inicio del Registro**:
   - El usuario accede al formulario de registro
   - Ingresa sus datos personales y correo institucional (@alumnos.santotomas.cl)
   - El sistema valida el formato del correo institucional

2. **Generación y Envío del Código**:
   - El sistema genera un código alfanumérico único de 6 caracteres
   - Envía el código al correo institucional proporcionado
   - Muestra una pantalla de verificación al usuario

3. **Verificación del Código**:
   - El usuario recibe el correo con el código
   - Ingresa el código en la pantalla de verificación
   - El sistema valida el código ingresado

4. **Finalización del Registro**:
   - Si el código es correcto, se completa el registro
   - Se crea la cuenta de usuario en el sistema
   - Se redirige al usuario a su panel correspondiente

5. **Manejo de Errores**:
   - Si el código es incorrecto, se permite al usuario reintentar
   - Después de 3 intentos fallidos, se bloquea temporalmente la verificación
   - Se ofrece la opción de reenviar el código si no se recibió

## Implementación Técnica

### Modelo de Datos

Se utilizará la siguiente colección en Firestore para gestionar la verificación de correos:

```typescript
// Colección 'verification_codes'
interface VerificationCode {
  id: string;               // ID único (correo electrónico)
  email: string;            // Correo electrónico a verificar
  code: string;             // Código de verificación
  attempts: number;         // Número de intentos realizados
  isVerified: boolean;      // Si ya ha sido verificado
  createdAt: Date;          // Fecha de creación
  expiresAt: Date;          // Fecha de expiración (15 minutos después)
}
```

### Servicio de Verificación

```typescript
// src/app/core/services/verification.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NotificationService } from './notification.service';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {
  constructor(
    private afs: AngularFirestore,
    private notificationService: NotificationService
  ) {}

  /**
   * Genera y envía un código de verificación al correo proporcionado
   */
  generateAndSendVerificationCode(email: string): Observable<boolean> {
    // Validar que sea un correo institucional
    if (!this.validateInstitutionalEmail(email)) {
      return throwError(() => new Error('El correo debe ser un correo institucional válido'));
    }

    // Generar código aleatorio
    const code = this.generateVerificationCode();
    
    // Calcular fecha de expiración (15 minutos)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
    
    // Crear o actualizar documento de verificación
    const verificationData = {
      email: email,
      code: code,
      attempts: 0,
      isVerified: false,
      createdAt: now,
      expiresAt: expiresAt
    };
    
    // Guardar en Firestore
    return from(this.afs.collection('verification_codes').doc(email).set(verificationData))
      .pipe(
        map(() => {
          // Enviar correo con el código
          this.notificationService.sendVerificationCode(email, code);
          return true;
        }),
        catchError(error => {
          console.error('Error al generar código de verificación:', error);
          return throwError(() => new Error('Error al generar el código de verificación'));
        })
      );
  }

  /**
   * Verifica el código ingresado por el usuario
   */
  verifyCode(email: string, code: string): Observable<boolean> {
    return this.afs.collection('verification_codes').doc(email).get().pipe(
      map(doc => {
        if (!doc.exists) {
          throw new Error('No se encontró ningún código de verificación para este correo');
        }
        
        const data = doc.data() as any;
        
        // Verificar si ya expiró
        if (new Date() > data.expiresAt.toDate()) {
          throw new Error('El código de verificación ha expirado');
        }
        
        // Verificar si ya se verificó
        if (data.isVerified) {
          return true;
        }
        
        // Incrementar intentos
        const attempts = data.attempts + 1;
        this.afs.collection('verification_codes').doc(email).update({ attempts });
        
        // Verificar máximo de intentos
        if (attempts > 3) {
          throw new Error('Ha excedido el número máximo de intentos');
        }
        
        // Verificar código
        if (data.code !== code) {
          throw new Error('El código de verificación es incorrecto');
        }
        
        // Marcar como verificado
        this.afs.collection('verification_codes').doc(email).update({ isVerified: true });
        return true;
      }),
      catchError(error => {
        console.error('Error al verificar código:', error);
        return throwError(() => new Error(error.message || 'Error al verificar el código'));
      })
    );
  }

  /**
   * Verifica si un correo ya ha sido verificado
   */
  isEmailVerified(email: string): Observable<boolean> {
    return this.afs.collection('verification_codes').doc(email).get().pipe(
      map(doc => {
        if (!doc.exists) {
          return false;
        }
        return (doc.data() as any).isVerified === true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Genera un código alfanumérico aleatorio de 6 caracteres
   */
  private generateVerificationCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluimos caracteres confusos como I, O, 0, 1
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Valida que el correo sea institucional
   */
  private validateInstitutionalEmail(email: string): boolean {
    return email && email.endsWith('@alumnos.santotomas.cl');
  }
}
```

### Componente de Verificación

```typescript
// src/app/modules/auth/components/verification/verification.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificationService } from '../../../../core/services/verification.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {
  verificationForm: FormGroup;
  email: string = '';
  loading = false;
  error: string | null = null;
  success = false;
  countdown = 0;
  countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private verificationService: VerificationService
  ) {
    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    // Obtener email de los parámetros de la ruta
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      
      if (!this.email) {
        this.router.navigate(['/auth/register']);
      }
    });
    
    // Iniciar contador para reenvío
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  onSubmit(): void {
    if (this.verificationForm.invalid) return;
    
    const code = this.verificationForm.get('code')?.value;
    
    this.loading = true;
    this.error = null;
    
    this.verificationService.verifyCode(this.email, code)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (err) => {
          this.error = err.message;
        }
      });
  }

  resendCode(): void {
    if (this.countdown > 0) return;
    
    this.loading = true;
    this.error = null;
    
    this.verificationService.generateAndSendVerificationCode(this.email)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.startCountdown();
        },
        error: (err) => {
          this.error = err.message;
        }
      });
  }

  private startCountdown(): void {
    this.countdown = 120; // 2 minutos
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }
}
```

### Integración con el Servicio de Notificaciones

```typescript
// Añadir al NotificationService existente
sendVerificationCode(recipientEmail: string, code: string) {
  const emailData = {
    to: recipientEmail,
    subject: `Código de Verificación - Competencia de Minijuegos`,
    templateId: 'verification-code',
    templateData: {
      code: code,
      email: recipientEmail,
      expirationMinutes: 15,
      platformName: 'Competencia de Minijuegos con Temáticas Chilenas',
      platformUrl: window.location.origin
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

1. **Expiración de Códigos**:
   - Los códigos deben expirar después de un tiempo razonable (15 minutos)
   - Se debe limitar el número de intentos de verificación (máximo 3)

2. **Prevención de Ataques**:
   - Implementar rate limiting para prevenir ataques de fuerza bruta
   - Limitar el número de códigos que se pueden solicitar por correo en un período de tiempo

3. **Protección de Datos**:
   - No almacenar información sensible junto con los códigos de verificación
   - Limpiar periódicamente los códigos expirados o utilizados

## Reglas de Seguridad de Firestore

```
match /verification_codes/{email} {
  allow read: if request.auth != null && request.auth.token.email == email;
  allow create: if true; // Permitir creación para usuarios no autenticados durante registro
  allow update: if request.auth != null && request.auth.token.email == email;
  allow delete: if false; // No permitir eliminación directa
}
```

## Casos de Prueba

1. **Registro y Verificación Exitosos**:
   - Verificar que se envíe el código al correo correcto
   - Comprobar que se pueda completar el registro con el código correcto

2. **Manejo de Errores**:
   - Probar con códigos incorrectos
   - Verificar el comportamiento cuando se excede el número de intentos
   - Comprobar qué sucede cuando el código expira

3. **Reenvío de Códigos**:
   - Verificar que se pueda solicitar un nuevo código
   - Comprobar que el código anterior quede invalidado
