import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  QueryConstraint
} from "firebase/firestore";
import { db } from "./config";

// Funciones helpers para manejar documentos por usuario

export const getUserDocRef = (uid: string, documentPath: string) => {
  return doc(db, `users/${uid}/${documentPath}`);
};

export const getUserCollectionRef = (uid: string, collectionPath: string) => {
  return collection(db, `users/${uid}/${collectionPath}`);
};

// Obtener un documento específico
export const getDocument = async (uid: string, documentPath: string) => {
  const docRef = getUserDocRef(uid, documentPath);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// Crear o sobrescribir un documento
export const setDocument = async (uid: string, documentPath: string, data: any) => {
  const docRef = getUserDocRef(uid, documentPath);
  await setDoc(docRef, data, { merge: true });
};

// Actualizar un documento existente
export const updateDocument = async (uid: string, documentPath: string, data: any) => {
  const docRef = getUserDocRef(uid, documentPath);
  await updateDoc(docRef, data);
};

// Suscribirse a cambios en un documento (tiempo real)
export const subscribeToDocument = (
  uid: string,
  documentPath: string,
  callback: (data: any) => void
) => {
  const docRef = getUserDocRef(uid, documentPath);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
};
