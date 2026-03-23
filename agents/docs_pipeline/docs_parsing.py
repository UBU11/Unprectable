from llama_parse import LlamaParse
from state import CourseState
from dotenv import load_dotenv,find_dotenv
from pathlib import Path
load_dotenv(find_dotenv())



async def extract_pdf_text(state:CourseState):
  print("Extracting PDF")
  current_dir = Path(__file__).parent
  resolved_path = current_dir / state["pdf_path"]

  if not resolved_path.is_file():
    raise FileNotFoundError(f"Could not Found a pdf at :{resolved_path}")

  pasrser = LlamaParse(result_type="markdown", verbose=True)

  docs = await pasrser.aload_data(str(resolved_path))
  text = "\n\n" .join([doc.text for doc in docs])

  return {"extracted_text": text}


