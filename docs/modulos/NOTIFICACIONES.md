# Módulo de Notificaciones

Este documento detalla los requerimientos e implementación del módulo de notificaciones para la plataforma de competencia de minijuegos con temáticas chilenas.

## Requerimientos Funcionales

- RF23: El sistema debe enviar notificaciones por correo cuando un juego recibe una evaluación
- RF24: El sistema debe incluir en las notificaciones las calificaciones detalladas y comentarios
- RF25: El sistema debe mantener un registro de todas las notificaciones enviadas

## Descripción de la Funcionalidad

El módulo de notificaciones permite mantener informados a los usuarios sobre eventos importantes en la plataforma, principalmente a través de correos electrónicos. Las notificaciones son fundamentales para mantener el compromiso de los participantes y asegurar que estén al tanto de las evaluaciones recibidas y cambios de estado en sus juegos.

### Tipos de Notificaciones

1. **Notificaciones de Evaluación**: Se envían cuando un juego recibe una nueva evaluación
2. **Notificaciones de Estado**: Se envían cuando cambia el estado de un juego (aprobado, rechazado, etc.)
3. **Notificaciones de Sistema**: Anuncios generales sobre la competencia (inicio de fases, recordatorios, etc.)
4. **Notificaciones de Verificación**: Códigos de verificación para el registro de usuarios
5. **Notificaciones de Preregistro**: Información para usuarios preregistrados por administradores

### Canales de Notificación

1. **Correo Electrónico**: Principal canal de comunicación, utilizando el servicio Resend
2. **Notificaciones en Plataforma**: Visibles en el panel de usuario dentro de la aplicación

## Implementación Técnica

### Modelo de Datos

```typescript
// Colección 'notifications'
interface Notification {
  id: string;                 // ID único
  userId: string;             // ID del usuario destinatario
  title: string;              // Título de la notificación
  message: string;            // Mensaje detallado
  type: 'evaluation' | 'approval' | 'rejection' | 'correction' | 'system';  // Tipo
  relatedId?: string;         // ID relacionado (juego, evaluación)
  isRead: boolean;            // Si ha sido leída
  createdAt: Timestamp;       // Fecha de creación
  emailSent: boolean;         // Si se envió notificación por correo
}
```

### Servicio de Notificaciones

El servicio de notificaciones proporciona las siguientes funcionalidades:

1. **Envío de Correos**: Integración con el servicio Resend para envío de correos
2. **Gestión de Notificaciones**: Creación, actualización y consulta de notificaciones
3. **Plantillas de Correo**: Gestión de plantillas para diferentes tipos de notificaciones
4. **Registro de Envíos**: Seguimiento de notificaciones enviadas y su estado

```typescript
// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from '../../../environments/environment';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

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
   * Envía una notificación por correo y la registra en Firestore
   */
  sendNotification(userId: string, title: string, message: string, type: string, relatedId?: string): Observable<string> {
    // Crear documento de notificación
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
    
    // Guardar en Firestore
    const notificationRef = this.afs.collection('notifications').doc();
    
    return from(notificationRef.set(notificationData)).pipe(
      map(() => notificationRef.id)
    );
  }

  /**
   * Envía una notificación de evaluación
   */
  sendEvaluationNotification(recipientEmail: string, userId: string, gameTitle: string, evaluation: any): Observable<string> {
    const title = `Nueva evaluación para "${gameTitle}"`;
    const message = `Tu juego "${gameTitle}" ha recibido una nueva evaluación con calificaciones: 
      Gráficos: ${evaluation.graphicsRating}, 
      Entretenimiento: ${evaluation.entertainmentRating}, 
      Jugabilidad: ${evaluation.gameplayRating}, 
      Promedio: ${evaluation.averageRating.toFixed(1)}. 
      Comentarios: ${evaluation.comments || 'Sin comentarios'}`;
    
    // Registrar notificación
    return this.sendNotification(userId, title, message, 'evaluation', evaluation.gameId).pipe(
      map(notificationId => {
        // Enviar correo
        const emailData = {
          to: recipientEmail,
          subject: title,
          templateId: 'evaluation-notification',
          templateData: {
            gameTitle: gameTitle,
            graphicsRating: evaluation.graphicsRating,
            entertainmentRating: evaluation.entertainmentRating,
            gameplayRating: evaluation.gameplayRating,
            averageRating: evaluation.averageRating.toFixed(1),
            comments: evaluation.comments || 'Sin comentarios',
            platformUrl: window.location.origin,
            gameDetailUrl: `${window.location.origin}/games/${evaluation.gameId}`
          }
        };
        
        this.http.post(
          'https://api.resend.com/emails',
          emailData,
          {
            headers: {
              'Authorization': `Bearer ${this.resendApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        ).subscribe(() => {
          // Actualizar estado de envío
          this.afs.collection('notifications').doc(notificationId).update({
            emailSent: true
          });
        });
        
        return notificationId;
      })
    );
  }

  /**
   * Envía una notificación de cambio de estado de juego
   */
  sendGameStatusNotification(recipientEmail: string, userId: string, gameTitle: string, status: string, notes?: string): Observable<string> {
    let title = '';
    let message = '';
    
    switch (status) {
      case 'approved':
        title = `¡Tu juego "${gameTitle}" ha sido aprobado!`;
        message = `Felicidades! Tu juego "${gameTitle}" ha sido revisado y aprobado. Ya está disponible para ser evaluado por otros participantes.`;
        break;
      case 'rejected':
        title = `Tu juego "${gameTitle}" ha sido rechazado`;
        message = `Lo sentimos, tu juego "${gameTitle}" ha sido rechazado por los siguientes motivos: ${notes}`;
        break;
      case 'needs_corrections':
        title = `Tu juego "${gameTitle}" requiere correcciones`;
        message = `Tu juego "${gameTitle}" requiere las siguientes correcciones: ${notes}`;
        break;
    }
    
    // Registrar notificación
    return this.sendNotification(userId, title, message, status, userId).pipe(
      map(notificationId => {
        // Enviar correo
        const emailData = {
          to: recipientEmail,
          subject: title,
          templateId: 'game-status-notification',
          templateData: {
            gameTitle: gameTitle,
            status: status,
            notes: notes || '',
            platformUrl: window.location.origin,
            gameDetailUrl: `${window.location.origin}/participant/games/${userId}`
          }
        };
        
        this.http.post(
          'https://api.resend.com/emails',
          emailData,
          {
            headers: {
              'Authorization': `Bearer ${this.resendApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        ).subscribe(() => {
          // Actualizar estado de envío
          this.afs.collection('notifications').doc(notificationId).update({
            emailSent: true
          });
        });
        
        return notificationId;
      })
    );
  }

  /**
   * Envía un código de verificación
   */
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

  /**
   * Envía notificación de preregistro
   */
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

### Plantillas de Correo Electrónico

Se utilizarán plantillas HTML responsivas para los diferentes tipos de notificaciones:

1. **Plantilla de Verificación**: Para envío de códigos de verificación
2. **Plantilla de Evaluación**: Para notificar sobre nuevas evaluaciones
3. **Plantilla de Estado**: Para informar sobre cambios de estado en juegos
4. **Plantilla de Preregistro**: Para usuarios preregistrados por administradores
5. **Plantilla General**: Para anuncios y notificaciones del sistema

## Consideraciones Técnicas

1. **Servicio de Correo**:
   - Integración con Resend Email Service para el envío de correos
   - Configuración de remitente y firma institucional

2. **Plantillas Responsivas**:
   - Diseño adaptable a diferentes dispositivos
   - Estilo consistente con la identidad visual de la plataforma

3. **Registro y Seguimiento**:
   - Almacenamiento de todas las notificaciones en Firestore
   - Seguimiento del estado de envío y lectura

## Reglas de Seguridad

```
// Reglas de Firestore
match /notifications/{notificationId} {
  allow read: if request.auth != null && 
    resource.data.userId == request.auth.uid;
  allow create: if request.auth != null && 
    (request.auth.token.role == 'admin' || request.resource.data.userId == request.auth.uid);
  allow update: if request.auth != null && 
    resource.data.userId == request.auth.uid;
  allow delete: if request.auth != null && 
    request.auth.token.role == 'admin';
}
```

## Casos de Prueba

1. **Envío de Notificaciones**:
   - Verificar el envío correcto de correos electrónicos
   - Comprobar el registro en Firestore

2. **Visualización de Notificaciones**:
   - Verificar que las notificaciones se muestren correctamente en la plataforma
   - Comprobar la funcionalidad de marcar como leídas

3. **Plantillas de Correo**:
   - Verificar la correcta visualización en diferentes clientes de correo
   - Comprobar la adaptabilidad a diferentes dispositivos
