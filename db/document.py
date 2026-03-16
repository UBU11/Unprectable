from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def get_vectorstore():
    return Chroma(
        persist_directory="./chroma_db",
        embedding_function=embeddings,
        collection_name="web_rag_collection",
    )


def add_documents(texts):
    db = get_vectorstore()
    db.add_texts(texts=texts)
