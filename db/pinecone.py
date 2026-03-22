import os
import dotenv
from pinecone import Pinecone, ServerlessSpec

dotenv.load_dotenv()

pc = Pinecone(api_key=os.getenv("Pinecone_API_KEY"))

index_name = "my-pinecone-index"

if not pc.has_index(index_name):
  pc.create_index_for_model(
    name=index_name,
    cloud="aws",
    region="us-west-1",
    embed={
        "model":"llama-text-embed-v2",
        "field_map":{"text": "chunk_text"}
    }
  )
