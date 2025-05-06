# Reglas de Seguridad

Este documento define las reglas de seguridad para Firestore y Storage que deben implementarse en la plataforma de competencia de minijuegos.

## Índice

1. [Reglas de Firestore](#reglas-de-firestore)
2. [Reglas de Storage](#reglas-de-storage)
3. [Validaciones Comunes](#validaciones-comunes)
4. [Ejemplos de Implementación](#ejemplos-de-implementación)

## Reglas de Firestore

### Estructura de Reglas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Funciones de validación comunes
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isEvaluator() {
      return isSignedIn() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'evaluator';
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function hasInstitutionalEmail() {
      return request.resource.data.email.matches('.*@alumnos.santotomas.cl');
    }
    
    function hasValidFields(requiredFields) {
      return request.resource.data.keys().hasAll(requiredFields);
    }
    
    // Reglas para colección de usuarios
    match /users/{userId} {
      allow read: if isSignedIn() && (isOwner(userId) || isAdmin());
      allow create: if isSignedIn() && isOwner(userId) && hasInstitutionalEmail() && 
                      hasValidFields(['email', 'displayName', 'role', 'createdAt']);
      allow update: if isSignedIn() && (isOwner(userId) || isAdmin());
      allow delete: if isAdmin();
      
      // Subcollección de notificaciones de usuario
      match /notifications/{notificationId} {
        allow read: if isSignedIn() && isOwner(userId);
        allow write: if isAdmin();
        allow update: if isSignedIn() && isOwner(userId) && 
                        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isRead']);
      }
    }
    
    // Reglas para colección de juegos
    match /games/{gameId} {
      allow read: if true; // Todos pueden ver los juegos
      allow create: if isSignedIn() && 
                      request.resource.data.userId == request.auth.uid &&
                      hasValidFields(['title', 'description', 'themeId', 'userId', 'status', 'createdAt']);
      allow update: if isSignedIn() && 
                      (resource.data.userId == request.auth.uid || isAdmin()) &&
                      (request.resource.data.userId == resource.data.userId); // No se puede cambiar el propietario
      allow delete: if isAdmin();
      
      // Subcollección de evaluaciones
      match /evaluations/{evaluationId} {
        allow read: if true; // Las evaluaciones son públicas
        allow create: if isSignedIn() && 
                        !exists(/databases/$(database)/documents/games/$(gameId)/evaluations/$(request.auth.uid)) &&
                        request.resource.data.evaluatorId == request.auth.uid &&
                        hasValidFields(['evaluatorId', 'graphicsRating', 'entertainmentRating', 'gameplayRating', 'averageRating', 'createdAt']);
        allow update, delete: if false; // Las evaluaciones no se pueden modificar ni eliminar
      }
    }
    
    // Reglas para colección de temáticas
    match /themes/{themeId} {
      allow read: if true; // Todos pueden ver las temáticas
      allow write: if isAdmin();
    }
    
    // Reglas para colección de códigos de verificación
    match /verificationCodes/{codeId} {
      allow read: if isSignedIn() && 
                    request.auth.token.email == resource.data.email;
      allow create: if isSignedIn() || isAdmin();
      allow update: if isSignedIn() && 
                      request.auth.token.email == resource.data.email &&
                      request.resource.data.diff(resource.data).affectedKeys().hasOnly(['attempts', 'isVerified']);
      allow delete: if isAdmin();
    }
    
    // Reglas para colección de preregistros
    match /preregistrations/{preregId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

## Reglas de Storage

### Estructura de Reglas

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Funciones de validación comunes
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isValidGameFile(fileName) {
      return fileName.matches('.*\\.(html|js|json|css|png|jpg|jpeg|gif|svg|wasm|data)$');
    }
    
    function isValidImageFile() {
      return request.resource.contentType.matches('image/.*') && 
             request.resource.size < 5 * 1024 * 1024; // 5MB máximo
    }
    
    // Reglas para archivos de juegos
    match /games/{gameId}/{fileName} {
      allow read: if true; // Todos pueden acceder a los archivos de juegos
      allow write: if isSignedIn() && 
                     (
                       firestore.get(/databases/(default)/documents/games/$(gameId)).data.userId == request.auth.uid || 
                       isAdmin()
                     ) && 
                     isValidGameFile(fileName);
      allow delete: if isSignedIn() && 
                      (
                        firestore.get(/databases/(default)/documents/games/$(gameId)).data.userId == request.auth.uid || 
                        isAdmin()
                      );
    }
    
    // Reglas para imágenes de perfil
    match /users/{userId}/profile.jpg {
      allow read: if true;
      allow write: if isSignedIn() && 
                     isOwner(userId) && 
                     isValidImageFile();
      allow delete: if isSignedIn() && 
                      (isOwner(userId) || isAdmin());
    }
    
    // Reglas para imágenes de temáticas
    match /themes/{themeId}.jpg {
      allow read: if true;
      allow write: if isAdmin() && isValidImageFile();
      allow delete: if isAdmin();
    }
    
    // Reglas para archivos temporales de preregistro
    match /preregistration/{fileName} {
      allow read: if isAdmin();
      allow write: if isAdmin() && fileName.matches('.*\\.csv$');
      allow delete: if isAdmin();
    }
  }
}
```

## Validaciones Comunes

### Validación de Correo Institucional

```javascript
// Validar que el correo pertenezca al dominio institucional
function hasInstitutionalEmail() {
  return request.resource.data.email.matches('.*@alumnos.santotomas.cl');
}
```

### Validación de Campos Requeridos

```javascript
// Validar que todos los campos requeridos estén presentes
function hasValidFields(requiredFields) {
  return request.resource.data.keys().hasAll(requiredFields);
}
```

### Validación de Límites de Evaluación

```javascript
// Validar que un usuario solo pueda evaluar una vez cada juego
function hasNotEvaluatedBefore(gameId, userId) {
  return !exists(/databases/$(database)/documents/games/$(gameId)/evaluations/$(userId));
}
```

### Validación de Tipo de Archivo

```javascript
// Validar que el archivo sea una imagen y no exceda el tamaño máximo
function isValidImageFile() {
  return request.resource.contentType.matches('image/.*') && 
         request.resource.size < 5 * 1024 * 1024; // 5MB máximo
}
```

## Ejemplos de Implementación

### Implementación de Reglas de Firestore

Para implementar las reglas de Firestore, sigue estos pasos:

1. Ve a la consola de Firebase: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en "Firestore Database"
4. Selecciona la pestaña "Reglas"
5. Copia y pega las reglas definidas en este documento
6. Haz clic en "Publicar"

### Implementación de Reglas de Storage

Para implementar las reglas de Storage, sigue estos pasos:

1. Ve a la consola de Firebase: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en "Storage"
4. Selecciona la pestaña "Reglas"
5. Copia y pega las reglas definidas en este documento
6. Haz clic en "Publicar"

### Prueba de Reglas

Es importante probar las reglas de seguridad antes de implementarlas en producción. Firebase proporciona un emulador local para probar las reglas de seguridad:

```bash
# Instalar Firebase CLI si aún no está instalado
npm install -g firebase-tools

# Iniciar sesión en Firebase
firebase login

# Iniciar el emulador de Firestore y Storage
firebase emulators:start --only firestore,storage

# Ejecutar pruebas de seguridad
firebase emulators:exec --only firestore,storage "npm run test:security"
```

Ejemplo de prueba de reglas con Jest:

```javascript
// tests/security/firestore.test.js
const firebase = require('@firebase/testing');

describe('Firestore Security Rules', () => {
  it('permite a los usuarios leer sus propios datos', async () => {
    const db = firebase.initializeTestApp({
      projectId: 'minijuegos-test',
      auth: { uid: 'user1', email: 'user1@alumnos.santotomas.cl' }
    }).firestore();
    
    const userDoc = db.collection('users').doc('user1');
    await firebase.assertSucceeds(userDoc.get());
  });
  
  it('no permite a los usuarios leer datos de otros usuarios', async () => {
    const db = firebase.initializeTestApp({
      projectId: 'minijuegos-test',
      auth: { uid: 'user1', email: 'user1@alumnos.santotomas.cl' }
    }).firestore();
    
    const otherUserDoc = db.collection('users').doc('user2');
    await firebase.assertFails(otherUserDoc.get());
  });
  
  // Más pruebas...
});
```
