import { initializeApp, getApps } from 'firebase/app'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const storage = getStorage(app)
