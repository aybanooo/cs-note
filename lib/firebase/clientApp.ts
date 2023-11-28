import { Note, NoteContent } from "@/types/note";
import {initializeApp} from "firebase/app";
import { getAuth, connectAuthEmulator, indexedDBLocalPersistence, setPersistence } from "firebase/auth";
import { 
  getFirestore, 
  connectFirestoreEmulator,
  doc,
  getDocs,
  getDoc,
  collection,
  setDoc
 } from 'firebase/firestore'
import { GoogleAuthProvider } from "firebase/auth";
import { storageKeys } from "../data";
import { EscalationTemplate } from "@/types/escalationTemplate";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
setPersistence(auth, indexedDBLocalPersistence)
connectAuthEmulator(auth, "http://127.0.0.1:9099");

export const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 9098);

export function IsLoggedIn() {
  return auth.currentUser ? true : false
}

async function SaveData(key:string, data:any) {
  if(!IsLoggedIn()) return;
  const docRef = doc(db, "notes", auth.currentUser!.uid);
  let d:any = {};
  d[key] = data;
  let resp = await setDoc(docRef, d, { merge: true });
}

export async function SaveNotes(notes:Note[]):Promise<void> {
  if(!IsLoggedIn()) return;
  await SaveData(unprefix(storageKeys.notes), notes);
}

export async function SavePendings(notes:Note[]):Promise<void> {
  if(!IsLoggedIn()) return;
  await SaveData(unprefix(storageKeys.pending), notes);
}

export async function SaveTemplates(templates:EscalationTemplate[]):Promise<void> {
  if(!IsLoggedIn()) return;
  await SaveData(unprefix(storageKeys.templates), templates);
}
export async function SaveSetups(setups:NoteContent[]):Promise<void> {
  if(!IsLoggedIn()) return;
  await SaveData(unprefix(storageKeys.setup), setups);
}

async function GetData<T>(key:string):Promise<T[]> {
  let data = localStorage.getItem(key) as any;
  try {
    const docRef = doc(db, "notes", auth.currentUser!.uid);
    const docSnap:any = await getDoc(docRef);
    const data = docSnap.data()[key] as T[];
    return data ?? [];
  } catch {
      return []
  }
}

const unprefix = (value:string) => value.replaceAll("csnote-", "")

export async function GetNotes():Promise<Note[]> {
  const data = await GetData<Note>(unprefix(storageKeys.notes));
  return data ?? [];
}

export async function GetPendings():Promise<Note[]> {
  const data = await GetData<Note>(unprefix(storageKeys.pending));
  return data ?? [];
}

export async function GetTemplates():Promise<EscalationTemplate[]> {
  const data = await GetData<EscalationTemplate>(unprefix(storageKeys.templates));
  return data ?? [];
}

export async function GetSetups():Promise<NoteContent[]> {
  const data = await GetData<NoteContent>(unprefix(storageKeys.setup));
  return data ?? [];
}

export default app;

