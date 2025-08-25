// lib/mongodb.js
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

// In development mode, use a global variable so the client is cached
// across module reloads caused by HMR (Hot Module Replacement).
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production, create a new client on every run
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToMongoDB() {
  try {
    const client = await clientPromise
    return client.db('ai-resume-saas')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}
