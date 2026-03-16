from typing import List

from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings


embeddings = OllamaEmbeddings(model="qwen3-embedding:0.6b")




def get_vectorstore() -> Chroma:
    return Chroma(
        persist_directory="./chroma_db",
        embedding_function=embeddings,
        collection_name="web_rag_collection_ollama",
    )


def add_documents(texts: List[str]) -> None:
    db = get_vectorstore()
    db.add_texts(texts=texts)

