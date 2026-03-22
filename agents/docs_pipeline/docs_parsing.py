from llama_cloud import AsyncLlamaCloud
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

pdf_path = BASE_DIR.parent.parent / "public" / "ArtikelAries.pdf"

async def main():
  client = AsyncLlamaCloud(api_key=os.getenv("LLAMA_API_KEY"))

  file = await client.files.create(file=pdf_path,purpose="parse")
  result = await client.parsing.parse(
    file_id=file.id,
    tier="agentic",
    version="latest",
    expand=["markdown"],
  )

  print(result.markdown.pages[0].markdown)

asyncio.run(main())
