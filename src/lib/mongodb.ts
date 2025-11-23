

// MongoDB removed — this is a stub so imports don't break

export async function getGridFSBucket() {
  throw new Error("GridFS is disabled — MongoDB has been removed from this project.");
}

const clientPromise = Promise.resolve(null);
export default clientPromise;




// import { MongoClient, GridFSBucket, Db } from "mongodb";

// if (!process.env.MONGODB_URI) {
//   throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
// }

// const uri = process.env.MONGODB_URI;
// const options = {};

// let client: MongoClient;
// let clientPromise: Promise<MongoClient>;

// if (process.env.NODE_ENV === "development") {
//   const globalWithMongo = global as typeof globalThis & {
//     _mongoClientPromise?: Promise<MongoClient>;
//   };

//   if (!globalWithMongo._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     globalWithMongo._mongoClientPromise = client.connect();
//   }
//   clientPromise = globalWithMongo._mongoClientPromise;
// } else {
//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// export async function getGridFSBucket(): Promise<GridFSBucket> {
//   const client = await clientPromise;
//   const db: Db = client.db();
//   return new GridFSBucket(db, {
//     bucketName: "videos",
//   });
// }

// export default clientPromise;
