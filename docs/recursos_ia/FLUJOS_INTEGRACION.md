# Flujos de Integración

Este documento detalla los flujos de integración con servicios externos para la plataforma de competencia de minijuegos con temáticas chilenas.

## Índice

1. [Integración con Firebase Authentication](#integración-con-firebase-authentication)
2. [Integración con Firestore](#integración-con-firestore)
3. [Integración con Firebase Storage](#integración-con-firebase-storage)
4. [Integración con Resend](#integración-con-resend)
5. [Integración con Firebase Analytics](#integración-con-firebase-analytics)
6. [Integración con Google Analytics](#integración-con-google-analytics)

## Integración con Firebase Authentication

### Configuración Inicial

```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    // Otros módulos
  ],
  // ...
})
export class AppModule { }
```

### Flujo de Registro

1. **Validación de correo institucional**:
   ```typescript
   // Verificar que el correo sea del dominio institucional
   const isInstitutionalEmail = (email: string): boolean => {
     return email.endsWith('@alumnos.santotomas.cl');
   };
   ```

2. **Registro de usuario**:
   ```typescript
   // src/app/core/services/auth.service.ts
   async register(email: string, password: string, displayName: string): Promise<string> {
     if (!isInstitutionalEmail(email)) {
       throw new Error('Debe utilizar un correo institucional (@alumnos.santotomas.cl)');
     }
     
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
           role: 'participant',
           createdAt: new Date()
         });
         
         // Generar y enviar código de verificación
         await this.verificationService.generateAndSendVerificationCode(email);
         
         return credential.user.uid;
       } else {
         throw new Error('No se pudo crear el usuario');
       }
     } catch (error) {
       console.error('Error en registro:', error);
       throw error;
     }
   }
   ```

3. **Verificación de correo**:
   ```typescript
   // src/app/core/services/verification.service.ts
   async verifyEmail(email: string, code: string): Promise<boolean> {
     const verificationRef = this.afs.collection('verificationCodes').ref
       .where('email', '==', email)
       .where('isVerified', '==', false)
       .where('expiresAt', '>', new Date());
     
     const snapshot = await verificationRef.get();
     
     if (snapshot.empty) {
       throw new Error('Código de verificación no encontrado o expirado');
     }
     
     const doc = snapshot.docs[0];
     const verificationData = doc.data();
     
     if (verificationData.attempts >= 3) {
       throw new Error('Demasiados intentos fallidos. Solicite un nuevo código');
     }
     
     if (verificationData.code !== code) {
       // Incrementar intentos fallidos
       await doc.ref.update({
         attempts: verificationData.attempts + 1
       });
       throw new Error('Código de verificación incorrecto');
     }
     
     // Marcar como verificado
     await doc.ref.update({
       isVerified: true
     });
     
     // Actualizar usuario
     await this.afs.collection('users').doc(verificationData.userId).update({
       emailVerified: true
     });
     
     return true;
   }
   ```

### Flujo de Autenticación para Evaluadores

1. **Envío de código de verificación**:
   ```typescript
   // src/app/core/services/evaluation-auth.service.ts
   async sendEvaluationCode(email: string, gameId: string): Promise<boolean> {
     // Verificar que el usuario existe
     const userSnapshot = await this.afs.collection('users').ref
       .where('email', '==', email)
       .limit(1)
       .get();
     
     if (userSnapshot.empty) {
       throw new Error('Usuario no encontrado');
     }
     
     const userId = userSnapshot.docs[0].id;
     
     // Verificar que no ha evaluado este juego antes
     const evaluationSnapshot = await this.afs.collection(`games/${gameId}/evaluations`).ref
       .where('evaluatorId', '==', userId)
       .limit(1)
       .get();
     
     if (!evaluationSnapshot.empty) {
       throw new Error('Ya has evaluado este juego anteriormente');
     }
     
     // Generar código de 4 dígitos
     const code = Math.floor(1000 + Math.random() * 9000).toString();
     
     // Guardar código en Firestore
     await this.afs.collection('evaluationCodes').add({
       userId,
       gameId,
       code,
       email,
       createdAt: new Date(),
       expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
       used: false
     });
     
     // Enviar código por correo
     await this.notificationService.sendEvaluationCode(email, code, gameId);
     
     return true;
   }
   ```

2. **Verificación de código para evaluación**:
   ```typescript
   // src/app/core/services/evaluation-auth.service.ts
   async verifyEvaluationCode(email: string, gameId: string, code: string): Promise<boolean> {
     const codeRef = this.afs.collection('evaluationCodes').ref
       .where('email', '==', email)
       .where('gameId', '==', gameId)
       .where('code', '==', code)
       .where('used', '==', false)
       .where('expiresAt', '>', new Date());
     
     const snapshot = await codeRef.get();
     
     if (snapshot.empty) {
       throw new Error('Código inválido o expirado');
     }
     
     // Marcar código como usado
     await snapshot.docs[0].ref.update({
       used: true,
       usedAt: new Date()
     });
     
     return true;
   }
   ```

## Integración con Firestore

### Configuración Inicial

```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    // Otros módulos
  ],
  // ...
})
export class AppModule { }
```

### Estructura de Datos

```typescript
// src/app/core/services/firestore.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private afs: AngularFirestore) {}

  // Método para crear un batch de operaciones
  createBatch() {
    return this.afs.firestore.batch();
  }

  // Método para ejecutar una transacción
  runTransaction<T>(updateFunction: (transaction: firebase.firestore.Transaction) => Promise<T>): Promise<T> {
    return this.afs.firestore.runTransaction(updateFunction);
  }

  // Método para obtener una referencia a una colección
  collection(path: string) {
    return this.afs.collection(path);
  }

  // Método para obtener una referencia a un documento
  doc(path: string) {
    return this.afs.doc(path);
  }
}
```

### Flujo de Gestión de Juegos

1. **Creación de juego**:
   ```typescript
   // src/app/core/services/game.service.ts
   async createGame(gameData: any, files: File[]): Promise<string> {
     // Crear documento de juego
     const gameId = this.afs.createId();
     const gameRef = this.afs.collection('games').doc(gameId);
     
     // Subir archivos al Storage
     const uploadTasks = files.map(file => this.storageService.uploadGameFile(gameId, file));
     await Promise.all(uploadTasks);
     
     // Obtener URL del juego principal
     const gameUrl = await this.storageService.getGameFileUrl(gameId, 'index.html');
     
     // Guardar datos del juego
     await gameRef.set({
       ...gameData,
       id: gameId,
       gameUrl,
       status: 'pending',
       createdAt: new Date(),
       updatedAt: new Date()
     });
     
     // Notificar a administradores
     await this.notificationService.notifyAdmins('Nuevo juego pendiente', 
       `El juego "${gameData.title}" está pendiente de aprobación.`);
     
     return gameId;
   }
   ```

2. **Actualización de calificación**:
   ```typescript
   // src/app/core/services/evaluation.service.ts
   async submitEvaluation(gameId: string, evaluationData: any): Promise<string> {
     const userId = this.authService.currentUserId;
     const evaluationId = this.afs.createId();
     
     // Calcular promedio
     const averageRating = (
       evaluationData.graphicsRating + 
       evaluationData.gameplayRating + 
       evaluationData.originalityRating + 
       evaluationData.themeRating
     ) / 4;
     
     // Ejecutar como transacción para actualizar juego y crear evaluación
     await this.afs.firestore.runTransaction(async transaction => {
       // Referencia al juego
       const gameRef = this.afs.collection('games').doc(gameId).ref;
       const gameDoc = await transaction.get(gameRef);
       
       if (!gameDoc.exists) {
         throw new Error('Juego no encontrado');
       }
       
       const gameData = gameDoc.data();
       const currentRatingCount = gameData.ratingCount || 0;
       const currentAverageRating = gameData.averageRating || 0;
       
       // Calcular nueva calificación promedio
       const newRatingCount = currentRatingCount + 1;
       const newAverageRating = (
         (currentAverageRating * currentRatingCount) + averageRating
       ) / newRatingCount;
       
       // Calcular puntuación ponderada (considerando cantidad de votos)
       // Fórmula: (v / (v + m)) * R + (m / (v + m)) * C
       // Donde v = número de votos, m = votos mínimos (5), R = promedio, C = promedio global (3)
       const m = 5; // Votos mínimos para considerar
       const C = 3; // Promedio global por defecto
       const weightedScore = (
         (newRatingCount / (newRatingCount + m)) * newAverageRating + 
         (m / (newRatingCount + m)) * C
       );
       
       // Actualizar juego
       transaction.update(gameRef, {
         averageRating: newAverageRating,
         ratingCount: newRatingCount,
         weightedScore: weightedScore,
         updatedAt: new Date()
       });
       
       // Crear evaluación
       const evaluationRef = this.afs.collection(`games/${gameId}/evaluations`).doc(evaluationId).ref;
       transaction.set(evaluationRef, {
         ...evaluationData,
         id: evaluationId,
         evaluatorId: userId,
         averageRating: averageRating,
         createdAt: new Date()
       });
     });
     
     // Notificar al creador del juego
     const gameDoc = await this.afs.collection('games').doc(gameId).get().toPromise();
     const gameData = gameDoc.data();
     
     await this.notificationService.createNotification(
       gameData.userId,
       'Nueva evaluación',
       `Tu juego "${gameData.title}" ha recibido una nueva evaluación.`,
       'evaluation',
       gameId
     );
     
     return evaluationId;
   }
   ```

## Integración con Firebase Storage

### Configuración Inicial

```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    // Otros módulos
  ],
  // ...
})
export class AppModule { }
```

### Flujo de Subida de Archivos

1. **Subida de archivos de juego**:
   ```typescript
   // src/app/core/services/storage.service.ts
   async uploadGameFile(gameId: string, file: File, path: string = ''): Promise<string> {
     const filePath = `games/${gameId}/${path}${file.name}`;
     const fileRef = this.storage.ref(filePath);
     
     // Crear tarea de subida
     const task = this.storage.upload(filePath, file);
     
     // Esperar a que se complete
     await task.snapshotChanges().toPromise();
     
     // Obtener URL de descarga
     const downloadUrl = await fileRef.getDownloadURL().toPromise();
     
     return downloadUrl;
   }
   ```

2. **Subida de múltiples archivos**:
   ```typescript
   // src/app/core/services/storage.service.ts
   async uploadGameFiles(gameId: string, files: File[]): Promise<string[]> {
     const uploadPromises = files.map(file => this.uploadGameFile(gameId, file));
     return Promise.all(uploadPromises);
   }
   ```

3. **Obtención de URL de juego**:
   ```typescript
   // src/app/core/services/storage.service.ts
   async getGameFileUrl(gameId: string, fileName: string): Promise<string> {
     const filePath = `games/${gameId}/${fileName}`;
     const fileRef = this.storage.ref(filePath);
     return fileRef.getDownloadURL().toPromise();
   }
   ```

## Integración con Resend

### Configuración Inicial

```typescript
// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private resendApiKey = environment.resendApiKey;

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore
  ) {}
  
  // Métodos de notificación...
}
```

### Flujo de Envío de Correos

1. **Envío de correo básico**:
   ```typescript
   // src/app/core/services/notification.service.ts
   async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
     const emailData = {
       from: 'Competencia Minijuegos <noreply@minijuegos-chile.com>',
       to: to,
       subject: subject,
       html: htmlContent
     };
     
     try {
       const response = await this.http.post(
         'https://api.resend.com/emails',
         emailData,
         {
           headers: {
             'Authorization': `Bearer ${this.resendApiKey}`,
             'Content-Type': 'application/json'
           }
         }
       ).toPromise();
       
       return true;
     } catch (error) {
       console.error('Error al enviar correo:', error);
       return false;
     }
   }
   ```

2. **Envío de código de verificación**:
   ```typescript
   // src/app/core/services/notification.service.ts
   async sendVerificationCode(email: string, code: string): Promise<boolean> {
     const htmlContent = `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
         <h2>Verificación de Correo Electrónico</h2>
         <p>Hola,</p>
         <p>Gracias por registrarte en la Plataforma de Competencia de Minijuegos con Temáticas Chilenas.</p>
         <p>Tu código de verificación es:</p>
         <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
           ${code}
         </div>
         <p>Este código expirará en 15 minutos.</p>
         <p>Si no solicitaste este código, puedes ignorar este correo.</p>
         <p>Saludos,<br>Equipo de Competencia de Minijuegos</p>
       </div>
     `;
     
     return this.sendEmail(
       email,
       'Código de Verificación - Competencia de Minijuegos',
       htmlContent
     );
   }
   ```

3. **Envío de código para evaluación**:
   ```typescript
   // src/app/core/services/notification.service.ts
   async sendEvaluationCode(email: string, code: string, gameId: string): Promise<boolean> {
     // Obtener información del juego
     const gameDoc = await this.afs.collection('games').doc(gameId).get().toPromise();
     const gameData = gameDoc.data();
     
     const htmlContent = `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
         <h2>Código para Evaluación de Juego</h2>
         <p>Hola,</p>
         <p>Has solicitado evaluar el juego "${gameData.title}" en la Plataforma de Competencia de Minijuegos.</p>
         <p>Tu código de verificación para evaluar es:</p>
         <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
           ${code}
         </div>
         <p>Este código expirará en 30 minutos y solo puede ser utilizado una vez.</p>
         <p>Si no solicitaste este código, puedes ignorar este correo.</p>
         <p>Saludos,<br>Equipo de Competencia de Minijuegos</p>
       </div>
     `;
     
     return this.sendEmail(
       email,
       `Código para Evaluar: ${gameData.title}`,
       htmlContent
     );
   }
   ```

## Integración con Firebase Analytics

### Configuración Inicial

```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/compat/analytics';
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    // Otros módulos
  ],
  providers: [
    ScreenTrackingService,
    UserTrackingService
  ],
  // ...
})
export class AppModule { }
```

### Flujo de Seguimiento de Eventos

1. **Servicio de Analytics**:
   ```typescript
   // src/app/core/services/analytics.service.ts
   import { Injectable } from '@angular/core';
   import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
   import { AuthService } from './auth.service';

   @Injectable({
     providedIn: 'root'
   })
   export class AnalyticsService {
     constructor(
       private analytics: AngularFireAnalytics,
       private authService: AuthService
     ) {
       // Establecer ID de usuario cuando inicie sesión
       this.authService.user$.subscribe(user => {
         if (user) {
           this.analytics.setUserId(user.uid);
         }
       });
     }
     
     // Rastrear evento de registro
     trackRegistration(method: string): Promise<void> {
       return this.analytics.logEvent('sign_up', {
         method: method
       });
     }
     
     // Rastrear evento de inicio de sesión
     trackLogin(method: string): Promise<void> {
       return this.analytics.logEvent('login', {
         method: method
       });
     }
     
     // Rastrear subida de juego
     trackGameUpload(gameId: string, gameTitle: string, themeId: string): Promise<void> {
       return this.analytics.logEvent('game_upload', {
         game_id: gameId,
         game_title: gameTitle,
         theme_id: themeId
       });
     }
     
     // Rastrear evaluación de juego
     trackGameEvaluation(gameId: string, rating: number): Promise<void> {
       return this.analytics.logEvent('game_evaluation', {
         game_id: gameId,
         rating: rating
       });
     }
     
     // Rastrear tiempo de juego
     trackGamePlay(gameId: string, timeInSeconds: number): Promise<void> {
       return this.analytics.logEvent('game_play', {
         game_id: gameId,
         time: timeInSeconds
       });
     }
   }
   ```

2. **Uso en componentes**:
   ```typescript
   // src/app/modules/games/pages/game-detail/game-detail.component.ts
   import { Component, OnInit, OnDestroy } from '@angular/core';
   import { ActivatedRoute } from '@angular/router';
   import { GameService } from '../../../../core/services/game.service';
   import { AnalyticsService } from '../../../../core/services/analytics.service';

   @Component({
     selector: 'app-game-detail',
     templateUrl: './game-detail.component.html',
     styleUrls: ['./game-detail.component.scss']
   })
   export class GameDetailComponent implements OnInit, OnDestroy {
     gameId: string;
     game: any;
     startTime: number;
     
     constructor(
       private route: ActivatedRoute,
       private gameService: GameService,
       private analyticsService: AnalyticsService
     ) {}
     
     ngOnInit(): void {
       this.gameId = this.route.snapshot.paramMap.get('id');
       this.loadGame();
       this.startTime = Date.now();
     }
     
     ngOnDestroy(): void {
       // Rastrear tiempo de juego al salir
       const timeInSeconds = Math.floor((Date.now() - this.startTime) / 1000);
       if (timeInSeconds > 10) { // Solo rastrear si jugó más de 10 segundos
         this.analyticsService.trackGamePlay(this.gameId, timeInSeconds);
       }
     }
     
     async loadGame(): Promise<void> {
       this.game = await this.gameService.getGame(this.gameId);
     }
     
     async submitEvaluation(evaluationData: any): Promise<void> {
       await this.gameService.evaluateGame(this.gameId, evaluationData);
       this.analyticsService.trackGameEvaluation(this.gameId, evaluationData.averageRating);
     }
   }
   ```

## Integración con Google Analytics

### Configuración Inicial

```typescript
// src/index.html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Competencia de Minijuegos</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

### Flujo de Seguimiento de Eventos

1. **Servicio de Google Analytics**:
   ```typescript
   // src/app/core/services/google-analytics.service.ts
   import { Injectable } from '@angular/core';

   declare const gtag: Function;

   @Injectable({
     providedIn: 'root'
   })
   export class GoogleAnalyticsService {
     constructor() {}
     
     // Rastrear evento personalizado
     trackEvent(eventName: string, params: any = {}): void {
       gtag('event', eventName, params);
     }
     
     // Rastrear página vista
     trackPageView(path: string, title: string): void {
       gtag('config', 'G-XXXXXXXXXX', {
         'page_path': path,
         'page_title': title
       });
     }
     
     // Establecer usuario
     setUser(userId: string): void {
       gtag('set', { 'user_id': userId });
     }
     
     // Rastrear excepción
     trackException(description: string, fatal: boolean = false): void {
       gtag('event', 'exception', {
         'description': description,
         'fatal': fatal
       });
     }
   }
   ```

2. **Integración con Router**:
   ```typescript
   // src/app/app.component.ts
   import { Component, OnInit } from '@angular/core';
   import { Router, NavigationEnd } from '@angular/router';
   import { filter } from 'rxjs/operators';
   import { GoogleAnalyticsService } from './core/services/google-analytics.service';
   import { AuthService } from './core/services/auth.service';

   @Component({
     selector: 'app-root',
     templateUrl: './app.component.html',
     styleUrls: ['./app.component.scss']
   })
   export class AppComponent implements OnInit {
     constructor(
       private router: Router,
       private gaService: GoogleAnalyticsService,
       private authService: AuthService
     ) {}
     
     ngOnInit(): void {
       // Rastrear cambios de página
       this.router.events.pipe(
         filter(event => event instanceof NavigationEnd)
       ).subscribe((event: NavigationEnd) => {
         this.gaService.trackPageView(event.urlAfterRedirects, document.title);
       });
       
       // Establecer ID de usuario cuando inicie sesión
       this.authService.user$.subscribe(user => {
         if (user) {
           this.gaService.setUser(user.uid);
         }
       });
     }
   }
   ```
