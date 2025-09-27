// MongoDB initialization script for development environment
// This script runs when the MongoDB container starts for the first time

// Initialize replica set for MongoDB (required for transactions)
try {
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "mongodb:27017" }
    ]
  });
  
  print("MongoDB replica set initialized successfully");
} catch (error) {
  print("Replica set initialization failed or already exists:", error.message);
}

// Switch to the struktura-dev database
db = db.getSiblingDB('struktura-dev');

// Create initial collections (optional - MongoDB creates them automatically)
db.createCollection('users');
db.createCollection('content');

print("Initial collections created for struktura-dev database");

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.content.createIndex({ "createdAt": 1 });
db.content.createIndex({ "updatedAt": 1 });

print("Initial indexes created successfully");

// Log completion
print("MongoDB initialization script completed successfully");