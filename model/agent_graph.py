import operator
import os
from typing import Annotated, Sequence, TypedDict

import dotenv
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.language_models.llms import LLM
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_core.vectorstores.base import VectorStore
from langchain_huggingface import HuggingFaceEndpoint
from langgraph.graph import END, StateGraph

from db.document import get_vectorstore

dotenv.load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY")
if not HF_API_KEY:
    raise ValueError("Hugging face key is not set")

llm = HuggingFaceEndpoint(
    repo_id="microsoft/Phi-3-mini-128k-instruct",
    huggingfacehub_api_token=HF_API_KEY,
    task="text-generation",
    max_new_tokens=512,
)


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    context: str


def retrieve_node(state: AgentState):
    vectorstore = get_vectorstore()
    last_message = state["messages"][-1]
    query = (
        last_message.content if hasattr(last_message, "content") else str(last_message)
    )
    docs = vectorstore.similarity_search(query, k=2)
    return {"context": "\n".join([d.page_content for d in docs])}


def web_search_node(state: AgentState):
    if len(state.get("context", "")) < 50:
        search = DuckDuckGoSearchRun()
        web_results = search.run(state["messages"][-1].content)
        return {"context": f"Internet data: {web_results}"}
    return {"context": state["context"]}


def generate_node(state: AgentState):
    last_message = state["messages"][-1]
    query = (
        last_message.content if hasattr(last_message, "content") else str(last_message)
    )
    prompt = f"Context: {state['context']}\n\nQuestion: {query}"
    response = llm.invoke(prompt)
    return {"messages": [HumanMessage(content=response)]}


workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve_node)
workflow.add_node("web_search", web_search_node)
workflow.add_node("generate", generate_node)

workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "web_search")
workflow.add_edge("web_search", "generate")
workflow.add_edge("generate", END)

rag_app = workflow.compile()
