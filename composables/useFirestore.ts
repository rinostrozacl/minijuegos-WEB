import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Firestore,
  orderBy,
  type QueryConstraint,
  type OrderByDirection,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { ref } from "vue";
import type { Ref } from "vue";

export function useFirestore<T extends DocumentData>(collectionName: string) {
  const { $firestore } = useNuxtApp();
  const firestore = $firestore as Firestore;

  const items = ref<T[]>([]) as Ref<T[]>;
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * Obtener todos los documentos de una colección con filtros opcionales
   */
  const getDocuments = async (
    filters = [] as QueryConstraint[],
    orderByOption?: { field: string; direction: OrderByDirection }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const collectionRef = collection(firestore, collectionName);

      // Construir la consulta con los filtros proporcionados
      let queryConstraints: QueryConstraint[] = [...filters];

      // Añadir ordenación si se proporcionó
      if (orderByOption) {
        queryConstraints.push(
          orderBy(orderByOption.field, orderByOption.direction)
        );
      }

      // Crear y ejecutar la consulta
      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      // Convertir los documentos a objetos
      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        } as T);
      });

      // Guardar los documentos en el estado
      items.value = documents;

      // Información de depuración
      console.log(
        `[useFirestore] Cargados ${documents.length} documentos de la colección ${collectionName}`,
        {
          primeros3Ids: documents
            .slice(0, 3)
            .map((d) => ({ id: d.id, tipo: typeof d.id })),
          filtros: filters.length > 0 ? "Con filtros aplicados" : "Sin filtros",
        }
      );

      return documents;
    } catch (err) {
      console.error(
        `Error al obtener documentos de la colección ${collectionName}:`,
        err
      );
      error.value = err as Error;
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtener un documento específico por su ID
   */
  const getDocumentById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const docRef = doc(firestore, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
        } as unknown as T;
      } else {
        return null;
      }
    } catch (err) {
      console.error(
        `Error al obtener documento ${id} de ${collectionName}:`,
        err
      );
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Actualizar un documento
   */
  const updateDocument = async (id: string, data: Partial<T>) => {
    loading.value = true;
    error.value = null;

    try {
      const docRef = doc(firestore, collectionName, id);
      await updateDoc(docRef, data as DocumentData);
      return true;
    } catch (err) {
      console.error(
        `Error al actualizar documento ${id} de ${collectionName}:`,
        err
      );
      error.value = err as Error;
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    loading,
    error,
    getDocuments,
    getDocumentById,
    updateDocument,
  };
}
