import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "";

declare global {
  // eslint-disable-next-line no-var
  var __snapdevMongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global.__snapdevMongoose ?? { conn: null, promise: null };
global.__snapdevMongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local");
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
