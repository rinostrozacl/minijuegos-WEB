# Estructura y Configuración del Proyecto

Este documento detalla la estructura del proyecto, configuraciones específicas y consideraciones adicionales para la implementación de la plataforma de competencia de minijuegos.

## Índice

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Integración con Firebase](#integración-con-firebase)
3. [Carga de Juegos WebGL](#carga-de-juegos-webgl)
4. [Configuración Regional](#configuración-regional)
5. [Proceso de Evaluación](#proceso-de-evaluación)
6. [Reportes y Estadísticas](#reportes-y-estadísticas)
7. [Configuración de la Competencia](#configuración-de-la-competencia)

## Estructura del Proyecto

La estructura del proyecto Nuxt 3 se organizará siguiendo las convenciones y directorios estándar de Nuxt, lo que facilita la modularización y el mantenimiento del código.

```
app/
├── .nuxt/                     # Compilación automática de Nuxt
├── assets/                    # Recursos estáticos (procesados por Webpack)
├── components/                # Componentes Vue reutilizables
│   ├── auth/                  # Componentes de autenticación
│   ├── games/                 # Componentes relacionados con juegos
│   ├── evaluation/            # Componentes de evaluación
│   └── ui/                    # Componentes de interfaz genéricos
│
├── composables/               # Composables Vue (Composition API)
│   ├── useAuth.ts             # Lógica de autenticación
│   ├── useFirestore.ts        # Operaciones con Firestore
│   └── useStorage.ts          # Operaciones con Storage
│
├── content/                   # Contenido en Markdown/JSON (opcional)
│
├── layouts/                   # Layouts reutilizables
│   ├── default.vue
│   ├── admin.vue
│   └── game.vue
│
├── middleware/                # Middleware de navegación
│   ├── auth.ts                # Middleware de autenticación
│   └── admin.ts               # Middleware para rutas admin
│
├── pages/                     # Páginas (generan rutas automáticamente)
│   ├── index.vue              # Página principal
│   ├── login.vue              # Página de inicio de sesión
│   ├── register.vue           # Página de registro
│   ├── games/                 # Páginas relacionadas con juegos
│   ├── evaluation/            # Páginas de evaluación
│   └── admin/                 # Páginas de administración
│
├── plugins/                   # Plugins de Nuxt
│   ├── firebase.ts            # Configuración de Firebase
│   └── i18n.ts                # Internacionalización (opcional)
│
├── public/                    # Archivos estáticos públicos
│
├── server/                    # API y middleware del servidor (opcional)
│   ├── api/                   # Endpoints de API
│   └── middleware/            # Middleware del servidor
│
├── stores/                    # Almacenes Pinia para gestión de estado
│   ├── auth.ts                # Estado de autenticación
│   ├── games.ts               # Estado de juegos
│   └── evaluation.ts          # Estado de evaluaciones
│
├── types/                     # Definiciones de tipos TypeScript
│
├── utils/                     # Utilidades y funciones auxiliares
│
├── .env                       # Variables de entorno
├── app.vue                    # Entrada principal de la aplicación
├── nuxt.config.ts             # Configuración de Nuxt
└── tsconfig.json              # Configuración de TypeScript
```

### Configuración de Módulos Nuxt

El proyecto utiliza varios módulos oficiales de Nuxt para mejorar la experiencia de desarrollo y la funcionalidad:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Módulos oficiales de Nuxt
  modules: [
    "@nuxt/ui", // Framework UI basado en Tailwind CSS
    "@nuxt/image", // Sistema de optimización y manejo de imágenes
    "@nuxt/icon", // Gestión de iconos
    "@nuxt/fonts", // Optimización de fuentes
    "@nuxt/eslint", // Integración con ESLint
  ],

  // Configuración de UI
  ui: {
    // Configuración de temas y componentes
    primary: "blue",
    icons: ["heroicons", "simple-icons"],
  },

  // Configuración de imágenes
  image: {
    provider: "ipx",
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  // Configuración de ESLint
  eslint: {
    lintOnStart: false,
  },

  // Configuración de fuentes
  fonts: {
    families: [
      {
        name: "Roboto",
        weights: [400, 500, 700],
      },
    ],
  },

  // Variables de entorno públicas
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
  },
});
```

## Integración con Firebase

Se utilizará la integración oficial de Firebase para Vue/Nuxt, aprovechando la Composition API de Vue 3 para una implementación más limpia y mantenible.

### Configuración de Firebase

```typescript
// plugins/firebase.ts
import { defineNuxtPlugin } from "#app";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

export default defineNuxtPlugin((nuxtApp) => {
  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };

  const app = initializeApp(config);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  const analytics = process.client ? getAnalytics(app) : null;

  nuxtApp.provide("firebase", { app, auth, firestore, storage, analytics });
});
```

### Composables para Firebase

```typescript
// composables/useFirestore.ts
import { ref, computed } from "vue";
import { useNuxtApp } from "#app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export function useFirestore<T>(collectionName: string) {
  const { $firebase } = useNuxtApp();
  const firestore = $firebase.firestore;

  const items = ref<T[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const collectionRef = collection(firestore, collectionName);

  // Obtener todos los documentos
  async function getAll() {
    loading.value = true;
    error.value = null;

    try {
      const snapshot = await getDocs(collectionRef);
      items.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (err) {
      error.value = err as Error;
      console.error(`Error al obtener documentos de ${collectionName}:`, err);
    } finally {
      loading.value = false;
    }

    return items.value;
  }

  // Obtener un documento por ID
  async function getById(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const docRef = doc(firestore, collectionName, id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data(),
        } as T;
      } else {
        return null;
      }
    } catch (err) {
      error.value = err as Error;
      console.error(`Error al obtener el documento ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Crear un nuevo documento
  async function create(data: Omit<T, "id">) {
    loading.value = true;
    error.value = null;

    try {
      const docRef = await addDoc(collectionRef, data);
      return docRef.id;
    } catch (err) {
      error.value = err as Error;
      console.error(`Error al crear documento en ${collectionName}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Actualizar un documento
  async function update(id: string, data: Partial<T>) {
    loading.value = true;
    error.value = null;

    try {
      const docRef = doc(firestore, collectionName, id);
      await updateDoc(docRef, data as any);
      return true;
    } catch (err) {
      error.value = err as Error;
      console.error(`Error al actualizar el documento ${id}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Eliminar un documento
  async function remove(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const docRef = doc(firestore, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      error.value = err as Error;
      console.error(`Error al eliminar el documento ${id}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Realizar consulta con filtros
  async function query(
    filters: Array<{ field: string; operator: string; value: any }>,
    sortBy?: string,
    sortDirection?: "asc" | "desc",
    limitTo?: number
  ) {
    loading.value = true;
    error.value = null;

    try {
      let q = query(collectionRef);

      // Aplicar filtros
      filters.forEach((filter) => {
        q = query(q, where(filter.field, filter.operator as any, filter.value));
      });

      // Aplicar ordenamiento
      if (sortBy) {
        q = query(q, orderBy(sortBy, sortDirection || "asc"));
      }

      // Aplicar límite
      if (limitTo) {
        q = query(q, limit(limitTo));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (err) {
      error.value = err as Error;
      console.error(`Error al consultar ${collectionName}:`, err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  return {
    items,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    remove,
    query,
  };
}
```

## Carga de Juegos WebGL

### Límites y Restricciones

- **Tamaño máximo**: 100 MB por juego
- **Formatos permitidos**: Archivos HTML, JS, CSS y assets (imágenes, sonidos, etc.)
- **Estructura requerida**: Debe incluir un archivo `index.html` como punto de entrada

### Implementación del Servicio de Carga

```typescript
// composables/useGameUpload.ts
import { ref } from "vue";
import { useNuxtApp } from "#app";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export function useGameUpload() {
  const { $firebase } = useNuxtApp();
  const storage = $firebase.storage;

  const progress = ref(0);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const uploadedUrl = ref<string | null>(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

  // Validar archivos antes de subir
  function validateFiles(files: File[]) {
    // Verificar tamaño total
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `El tamaño total del juego excede el límite de 100 MB (${(
          totalSize /
          (1024 * 1024)
        ).toFixed(2)} MB)`,
      };
    }

    // Verificar archivo index.html
    const hasIndexHtml = files.some(
      (file) => file.name.toLowerCase() === "index.html"
    );
    if (!hasIndexHtml) {
      return {
        valid: false,
        message:
          "El juego debe incluir un archivo index.html como punto de entrada",
      };
    }

    return { valid: true };
  }

  // Subir juego (múltiples archivos)
  async function uploadGame(gameId: string, files: File[]) {
    loading.value = true;
    error.value = null;
    progress.value = 0;
    uploadedUrl.value = null;

    try {
      const validation = validateFiles(files);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Crear estructura de carpetas en Storage
      const basePath = `games/${gameId}`;

      // Subir archivos uno por uno
      const totalFiles = files.length;
      let completedFiles = 0;

      const uploadPromises = files.map(async (file) => {
        const filePath = `${basePath}/${file.name}`;
        const fileRef = storageRef(storage, filePath);

        await uploadBytes(fileRef, file);
        completedFiles++;
        progress.value = Math.round((completedFiles / totalFiles) * 100);

        // Si es el index.html, guardamos su URL
        if (file.name.toLowerCase() === "index.html") {
          uploadedUrl.value = await getDownloadURL(fileRef);
        }

        return filePath;
      });

      await Promise.all(uploadPromises);
      return uploadedUrl.value;
    } catch (err) {
      error.value = err as Error;
      console.error("Error al subir el juego:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    progress,
    loading,
    error,
    uploadedUrl,
    validateFiles,
    uploadGame,
  };
}
```

## Configuración Regional

La plataforma utilizará la configuración regional de Chile para formatos de fecha, números y moneda.

### Configuración de Internacionalización

```typescript
// plugins/i18n.ts
import { defineNuxtPlugin } from "#app";
import { createI18n } from "vue-i18n";

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: "es-CL",
    fallbackLocale: "es-CL",
    messages: {
      "es-CL": {
        // Mensajes de traducción
      },
    },
    datetimeFormats: {
      "es-CL": {
        short: {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
        long: {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
          hour: "numeric",
          minute: "numeric",
        },
      },
    },
    numberFormats: {
      "es-CL": {
        currency: {
          style: "currency",
          currency: "CLP",
          notation: "standard",
        },
        decimal: {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
        percent: {
          style: "percent",
          useGrouping: true,
        },
      },
    },
  });

  vueApp.use(i18n);
});
```

## Proceso de Evaluación

El proceso de evaluación está diseñado para que cada juego sea evaluado una sola vez por cada evaluador, sin posibilidad de modificar la evaluación después de enviarla.

### Modelo de Datos

```typescript
// features/evaluation/models/evaluation.model.ts
export interface Evaluation {
  id?: string;
  gameId: string;
  evaluatorEmail: string;
  evaluatorName?: string;
  graphicsRating: number; // 1-5
  entertainmentRating: number; // 1-5
  gameplayRating: number; // 1-5
  comments?: string;
  createdAt: Date;
  ipAddress?: string;
  browserInfo?: string;
}
```

### Servicio de Evaluación

```typescript
// features/evaluation/services/evaluation.service.ts
@Injectable({
  providedIn: "root",
})
export class EvaluationService {
  constructor(
    private firestore: AngularFirestore,
    private authService: EvaluationAuthService
  ) {}

  // Verificar si un evaluador ya ha evaluado un juego
  async hasEvaluated(gameId: string, evaluatorEmail: string): Promise<boolean> {
    const snapshot = await this.firestore
      .collection("evaluations", (ref) =>
        ref
          .where("gameId", "==", gameId)
          .where("evaluatorEmail", "==", evaluatorEmail)
          .limit(1)
      )
      .get()
      .toPromise();

    return !snapshot.empty;
  }

  // Enviar evaluación
  async submitEvaluation(evaluation: Evaluation): Promise<void> {
    // Verificar si ya ha evaluado este juego
    const hasEvaluated = await this.hasEvaluated(
      evaluation.gameId,
      evaluation.evaluatorEmail
    );
    if (hasEvaluated) {
      throw new Error("Ya has evaluado este juego anteriormente");
    }

    // Agregar metadatos
    const enhancedEvaluation: Evaluation = {
      ...evaluation,
      createdAt: new Date(),
      ipAddress: await this.getIpAddress(),
      browserInfo: navigator.userAgent,
    };

    // Guardar en Firestore
    await this.firestore.collection("evaluations").add(enhancedEvaluation);

    // Actualizar contadores en el documento del juego
    await this.firestore
      .collection("games")
      .doc(evaluation.gameId)
      .update({
        evaluationCount: firebase.firestore.FieldValue.increment(1),
        totalGraphicsRating: firebase.firestore.FieldValue.increment(
          evaluation.graphicsRating
        ),
        totalEntertainmentRating: firebase.firestore.FieldValue.increment(
          evaluation.entertainmentRating
        ),
        totalGameplayRating: firebase.firestore.FieldValue.increment(
          evaluation.gameplayRating
        ),
      });
  }

  // Obtener IP del usuario (usando un servicio externo)
  private async getIpAddress(): Promise<string> {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error al obtener IP:", error);
      return "unknown";
    }
  }
}
```

## Reportes y Estadísticas

La plataforma proporcionará reportes y estadísticas para los administradores, centrándose en los juegos más populares y la distribución de calificaciones.

### Servicio de Reportes

```typescript
// features/admin/services/reports.service.ts
@Injectable({
  providedIn: "root",
})
export class ReportsService {
  constructor(private firestore: AngularFirestore) {}

  // Obtener juegos más populares (por número de evaluaciones)
  getMostPopularGames(limit: number = 10): Observable<any[]> {
    return this.firestore
      .collection("games", (ref) =>
        ref.orderBy("evaluationCount", "desc").limit(limit)
      )
      .valueChanges({ idField: "id" });
  }

  // Obtener distribución de calificaciones
  getRatingsDistribution(): Observable<any> {
    return this.firestore
      .collection("evaluations")
      .valueChanges()
      .pipe(
        map((evaluations) => {
          const distribution = {
            graphics: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            entertainment: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            gameplay: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          };

          evaluations.forEach((eval: Evaluation) => {
            distribution.graphics[eval.graphicsRating]++;
            distribution.entertainment[eval.entertainmentRating]++;
            distribution.gameplay[eval.gameplayRating]++;
          });

          return distribution;
        })
      );
  }

  // Obtener estadísticas generales
  getGeneralStats(): Observable<any> {
    return combineLatest([
      this.firestore.collection("games").valueChanges(),
      this.firestore.collection("evaluations").valueChanges(),
      this.firestore
        .collection("users", (ref) => ref.where("role", "==", "student"))
        .valueChanges(),
    ]).pipe(
      map(([games, evaluations, students]) => {
        return {
          totalGames: games.length,
          totalEvaluations: evaluations.length,
          totalStudents: students.length,
          averageEvaluationsPerGame:
            games.length > 0 ? evaluations.length / games.length : 0,
        };
      })
    );
  }

  // Exportar datos a CSV (para uso interno)
  async exportToCSV(collectionName: string): Promise<string> {
    const snapshot = await this.firestore
      .collection(collectionName)
      .get()
      .toPromise();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Convertir a CSV
    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map((item) =>
      Object.values(item)
        .map((value) =>
          typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
        )
        .join(",")
    );

    return [headers, ...rows].join("\n");
  }
}
```

### Componente de Visualización de Reportes

```typescript
// features/admin/components/reports-dashboard.component.ts
@Component({
  selector: "app-reports-dashboard",
  template: `
    <div class="reports-container">
      <h2>Panel de Estadísticas</h2>

      <!-- Estadísticas generales -->
      <mat-card *ngIf="generalStats$ | async as stats" class="stats-card">
        <mat-card-content>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalGames }}</div>
              <div class="stat-label">Juegos</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalEvaluations }}</div>
              <div class="stat-label">Evaluaciones</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalStudents }}</div>
              <div class="stat-label">Estudiantes</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                {{ stats.averageEvaluationsPerGame | number : "1.1-1" }}
              </div>
              <div class="stat-label">Prom. Evaluaciones</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Juegos más populares -->
      <mat-card class="popular-games-card">
        <mat-card-header>
          <mat-card-title>Juegos Más Populares</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="chart-container">
            <canvas
              baseChart
              [datasets]="popularGamesChartData"
              [labels]="popularGamesChartLabels"
              [options]="barChartOptions"
              [type]="'bar'"
            >
            </canvas>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Distribución de calificaciones -->
      <mat-card class="ratings-card">
        <mat-card-header>
          <mat-card-title>Distribución de Calificaciones</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-tab-group>
            <mat-tab label="Gráficos y Estética">
              <div class="chart-container">
                <canvas
                  baseChart
                  [datasets]="graphicsRatingChartData"
                  [labels]="ratingLabels"
                  [options]="pieChartOptions"
                  [type]="'pie'"
                >
                </canvas>
              </div>
            </mat-tab>
            <mat-tab label="Entretenimiento">
              <div class="chart-container">
                <canvas
                  baseChart
                  [datasets]="entertainmentRatingChartData"
                  [labels]="ratingLabels"
                  [options]="pieChartOptions"
                  [type]="'pie'"
                >
                </canvas>
              </div>
            </mat-tab>
            <mat-tab label="Jugabilidad">
              <div class="chart-container">
                <canvas
                  baseChart
                  [datasets]="gameplayRatingChartData"
                  [labels]="ratingLabels"
                  [options]="pieChartOptions"
                  [type]="'pie'"
                >
                </canvas>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ReportsDashboardComponent implements OnInit {
  // Implementación...
}
```

## Configuración de la Competencia

La plataforma permitirá configurar fechas de inicio y fin de la competencia, lo que afectará a la disponibilidad de ciertas funcionalidades.

### Modelo de Datos

```typescript
// core/models/competition-config.model.ts
export interface CompetitionConfig {
  id?: string;
  startDate: Date;
  endDate: Date;
  registrationStartDate: Date;
  registrationEndDate: Date;
  evaluationStartDate: Date;
  evaluationEndDate: Date;
  isActive: boolean;
  name: string;
  description?: string;
  rules?: string;
  updatedAt: Date;
  updatedBy: string;
}
```

### Servicio de Configuración

```typescript
// core/services/competition-config.service.ts
@Injectable({
  providedIn: "root",
})
export class CompetitionConfigService {
  private configDoc = this.firestore
    .collection("system")
    .doc("competition-config");

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  // Obtener configuración actual
  getConfig(): Observable<CompetitionConfig> {
    return this.configDoc.valueChanges() as Observable<CompetitionConfig>;
  }

  // Actualizar configuración
  async updateConfig(config: Partial<CompetitionConfig>): Promise<void> {
    const updatedConfig = {
      ...config,
      updatedAt: new Date(),
      updatedBy: this.authService.currentUserId,
    };

    await this.configDoc.update(updatedConfig);
  }

  // Verificar si la competencia está activa
  isCompetitionActive(): Observable<boolean> {
    return this.getConfig().pipe(
      map((config) => {
        const now = new Date();
        return (
          config.isActive &&
          now >= config.startDate.toDate() &&
          now <= config.endDate.toDate()
        );
      })
    );
  }

  // Verificar si el registro está abierto
  isRegistrationOpen(): Observable<boolean> {
    return this.getConfig().pipe(
      map((config) => {
        const now = new Date();
        return (
          config.isActive &&
          now >= config.registrationStartDate.toDate() &&
          now <= config.registrationEndDate.toDate()
        );
      })
    );
  }

  // Verificar si la evaluación está abierta
  isEvaluationOpen(): Observable<boolean> {
    return this.getConfig().pipe(
      map((config) => {
        const now = new Date();
        return (
          config.isActive &&
          now >= config.evaluationStartDate.toDate() &&
          now <= config.evaluationEndDate.toDate()
        );
      })
    );
  }
}
```

### Componente de Configuración

```typescript
// features/admin/components/competition-config.component.ts
@Component({
  selector: "app-competition-config",
  template: `
    <div class="config-container">
      <h2>Configuración de la Competencia</h2>

      <form [formGroup]="configForm" (ngSubmit)="onSubmit()">
        <mat-card>
          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre de la Competencia</mat-label>
                <input matInput formControlName="name" required />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea
                  matInput
                  formControlName="description"
                  rows="3"
                ></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-slide-toggle formControlName="isActive" color="primary">
                Competencia Activa
              </mat-slide-toggle>
            </div>

            <h3>Fechas de la Competencia</h3>

            <div class="form-row date-row">
              <mat-form-field appearance="outline">
                <mat-label>Fecha de Inicio</mat-label>
                <input
                  matInput
                  [matDatepicker]="startPicker"
                  formControlName="startDate"
                  required
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="startPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fecha de Fin</mat-label>
                <input
                  matInput
                  [matDatepicker]="endPicker"
                  formControlName="endDate"
                  required
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="endPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <h3>Período de Registro</h3>

            <div class="form-row date-row">
              <mat-form-field appearance="outline">
                <mat-label>Inicio de Registro</mat-label>
                <input
                  matInput
                  [matDatepicker]="regStartPicker"
                  formControlName="registrationStartDate"
                  required
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="regStartPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #regStartPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fin de Registro</mat-label>
                <input
                  matInput
                  [matDatepicker]="regEndPicker"
                  formControlName="registrationEndDate"
                  required
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="regEndPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #regEndPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <h3>Período de Evaluación</h3>

            <div class="form-row date-row">
              <mat-form-field appearance="outline">
                <mat-label>Inicio de Evaluación</mat-label>
                <input
                  matInput
                  [matDatepicker]="evalStartPicker"
                  formControlName="evaluationStartDate"
                  required
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="evalStartPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #evalStartPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fin de Evaluación</mat-label>
                <input
                  matInput
                  [matDatepicker]="evalEndPicker"
                  formControlName="evaluationEndDate"
                  required
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="evalEndPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #evalEndPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Reglas de la Competencia</mat-label>
                <textarea matInput formControlName="rules" rows="6"></textarea>
              </mat-form-field>
            </div>
          </mat-card-content>

          <mat-card-actions align="end">
            <button type="button" mat-button (click)="resetForm()">
              Cancelar
            </button>
            <button
              type="submit"
              mat-raised-button
              color="primary"
              [disabled]="configForm.invalid || loading"
            >
              <mat-spinner
                *ngIf="loading"
                diameter="20"
                class="spinner-button"
              ></mat-spinner>
              Guardar Configuración
            </button>
          </mat-card-actions>
        </mat-card>
      </form>
    </div>
  `,
})
export class CompetitionConfigComponent implements OnInit {
  // Implementación...
}
```
