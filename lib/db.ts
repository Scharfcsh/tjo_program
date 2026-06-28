import mongoose from "mongoose"

/**
 * Cached Mongoose connection.
 *
 * In development Next.js clears the module cache on every request which would
 * otherwise create a new connection (and exhaust the connection pool) on each
 * hot reload. We cache the connection promise on the global object to reuse it.
 *
 * The connection is only attempted when `connectToDatabase()` is called (at
 * request time), never at import time, so the app still builds without a
 * `MONGODB_URI` configured.
 */

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var _mongooseCache: MongooseCache | undefined
}

const cache: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
}

if (!global._mongooseCache) {
  global._mongooseCache = cache
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local (see .env.example)."
    )
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false })
  }

  try {
    cache.conn = await cache.promise
  } catch (err) {
    cache.promise = null
    throw err
  }

  return cache.conn
}
