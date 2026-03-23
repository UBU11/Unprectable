from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langchain_community.document_loaders import PyPDFLoader
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


BASE_DIR = Path(__file__).resolve().parent

pdf_path = BASE_DIR.parent.parent / "public" / "ArtikelAries.pdf"

class CourseState(TypedDict):
    pdf_path: str
    extracted_text: str
    course_outline: str

def extract_pdf_text(state: CourseState):
    print("--- EXTRACTING PDF TEXT ---")
    loader = PyPDFLoader(state["pdf_path"])
    docs = loader.load()

    text = "\n".join([doc.page_content for doc in docs])

    return {"extracted_text": text}

def generate_outline(state: CourseState):
    print("--- GENERATING OUTLINE ---")
    llm = ChatOllama(model="minimax-m2.5:cloud", temperature=0.2)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert curriculum designer. Your task is to analyze the provided text and generate a well-structured educational course outline. You MUST strictly organize the content into exactly 7 or 8 distinct modules."),
        ("human", "Here is the source material:\n\n{text}\n\nGenerate the 7 or 8 module outline now.")
    ])

    chain = prompt | llm
    response = chain.invoke({"text": state["extracted_text"]})
    return {"course_outline": response.content}

workflow = StateGraph(CourseState)

workflow.add_node("extract_text", extract_pdf_text)
workflow.add_node("generate_outline", generate_outline)

workflow.add_edge(START, "extract_text")
workflow.add_edge("extract_text", "generate_outline")
workflow.add_edge("generate_outline", END)

app = workflow.compile()

if __name__ == "__main__":

    inputs = {"pdf_path": str(pdf_path)}
    result = app.invoke(inputs)
    print("\n\n=== FINAL COURSE OUTLINE ===")
    print(result["course_outline"])
