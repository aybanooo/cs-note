import { Note, NoteContent } from "@/types/note";
import {FirebaseOptions, initializeApp} from "firebase/app";
import { getAuth, connectAuthEmulator, indexedDBLocalPersistence, setPersistence } from "firebase/auth";
import { 
  getFirestore, 
  connectFirestoreEmulator,
  doc,
  getDocs,
  collection,
  setDoc,
  getDocFromServer,
  updateDoc,
  getDoc,
 } from 'firebase/firestore'
import { GoogleAuthProvider } from "firebase/auth";
import { storageKeys } from "../data";
import { EscalationTemplate } from "@/types/escalationTemplate";

const firebaseConfig:FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
setPersistence(auth, indexedDBLocalPersistence)

export const db = getFirestore(app);

const env = process.env.NODE_ENV
console.warn("Environment", env);

if(env.toLocaleLowerCase() == "development") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 9098);
}  
export function IsLoggedIn() {
  return auth.currentUser ? true : false
}

function GetUserDocRef() {
  const docRef = doc(db, "cs-notes", auth.currentUser!.uid);
  return docRef;
}

async function SaveData(key:string, data:any) {
  if(!IsLoggedIn()) return;
  const docRef = doc(db, "cs-notes", auth.currentUser!.uid);
  let fetchedData = getDoc(docRef);

  if(!(await fetchedData).exists()) {
    let newDoc:any = {
      notes: [],
      pending: [],
      setup: [],
      templates: []
    };
    newDoc[key] = data;
    await setDoc(docRef, newDoc)
    return;
  } else {
    let d:any = {};
    d[key] = data;
    let resp = await updateDoc(docRef, d);
  }
}

export async function SaveNotes(notes:Note[]):Promise<void> {
  if(!IsLoggedIn()) return;
  await SaveData(unprefix(storageKeys.notes), notes);
}

export async function SaveNotesAndPendings(notes:Note[], pendings:Note[]):Promise<void> {
  if(!IsLoggedIn()) return;
  var docRef = GetUserDocRef();
  var docSnap = getDoc(docRef);
  if(!(await docSnap).exists()) {
    let newDoc:any = {
      notes: notes,
      pending: pendings,
      setup: [],
      templates: []
    };
    await setDoc(docRef, newDoc);
    return;
  } else {
    let d:any = {};
    d[unprefix(storageKeys.notes)] = notes || [];
    d[unprefix(storageKeys.pending)] = pendings || [];
    console.warn(d);
    updateDoc(docRef, d)
  }
}

export async function SavePendings(notes:Note[]):Promise<void> {
  if(!IsLoggedIn()) return;
  await SaveData(unprefix(storageKeys.pending), notes);
}

export async function SaveTemplates(templates:EscalationTemplate[]):Promise<void> {
  if(!IsLoggedIn()) return;
  console.warn("Saving Templates", templates);
  await SaveData(unprefix(storageKeys.templates), templates);
}
export async function SaveSetups(setups:NoteContent[]):Promise<void> {
  if(!IsLoggedIn()) return;
  await SaveData(unprefix(storageKeys.setup), setups);
}

async function GetData<T>(key:string):Promise<T[]> {
    const docRef = doc(db, "cs-notes", auth.currentUser!.uid);
    const docSnap = await getDocFromServer(docRef);
    if(!docSnap.exists()) return [];
    let snapData:any = docSnap.data();
    if(key.includes("templates")) {
      console.warn(auth.currentUser!.uid, snapData);
    }

    //if(!Object.hasOwn(snapData, key)) return [];

    const data = snapData[key] as T[];
    return data;
  
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

