from supermemory import Supermemory
import os
import dotenv
dotenv.load_dotenv()

client = Supermemory(api_key=os.getenv("SUPERMEMORY_API_KEY"))

try:

    client.add(
    content="User prefers frictionless books that are easy to read and understand.",
    container_tag="user-123"
    )
except Exception as e:
    results = client.search.documents(
    q="frictionless book",
    container_tags="user-123"
    )
    print(f"Error adding content: {e}")
