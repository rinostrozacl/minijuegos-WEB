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
} from "firebase/firestore";
import type { DocumentData, QueryConstraint } from "firebase/firestore";
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
    constraints: QueryConstraint[] = [],
    orderByField?: { field: string; direction?: "asc" | "desc" }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const queryConstraints: QueryConstraint[] = [...constraints];

      // Agregar ordenamiento si se especifica
      if (orderByField) {
        queryConstraints.push(
          orderBy(orderByField.field, orderByField.direction || "asc")
        );
      }

      const q = query(
        collection(firestore, collectionName),
        ...queryConstraints
      );
      const querySnapshot = await getDocs(q);

      const result: T[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        result.push({
          id: doc.id,
          ...data,
        } as unknown as T);
      });

      items.value = result;
      return result;
    } catch (err) {
      console.error(`Error al obtener documentos de ${collectionName}:`, err);
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
