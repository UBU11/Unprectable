import pymongo
import os
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv
load_dotenv()



class MongoDBClient:
    def __init__(self):
          self.mongodb_url = os.getenv("MONGO_URL")

          if not self.mongodb_url:
              raise ValueError("MONGO_URL environment variable is not set!")
          try:
              self.client = pymongo.MongoClient(self.mongodb_url, serverSelectionTimeoutMS=5000)
              self.db = self.client["Unpreactable"]

              self.client.admin.command('ping')
              print("Successfully connected to MongoDB.")

          except ConnectionFailure:
              raise ValueError("Failed to connect to MongoDB!")

    def get_collection(self, collection_name):
          return self.db[collection_name]
    def close_connection(self):
          self.client.close()


db_manager = MongoDBClient()

user_col = db_manager.get_collection("users")

new_user = { "name": "Alice", "age": 30, "email": "alice@example.com" }

result = user_col.insert_one(new_user)

print(f"Inserted user with id: {result.inserted_id}")


