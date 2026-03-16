import operator
import os
from typing import Annotated, Sequence, TypedDict

import dotenv
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, StateGraph

from db.document import get_vectorstore

dotenv.load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY")
if not HF_API_KEY:
    raise ValueError("Hugging face key is not set")

chat_model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
)



class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    context: str


def retrieve_node(state: AgentState):
    vectorstore = get_vectorstore()
    last_message = state["messages"][-1]
    query = last_message.content if hasattr(last_message, 'content') else str(last_message)
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
    query = last_message.content if hasattr(last_message, 'content') else str(last_message)

    prompt = f"Context: {state['context']}\n\nQuestion: {query}"
    response = chat_model.invoke([HumanMessage(content=prompt)])

    return {"messages": [response]}


workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve_node)
workflow.add_node("web_search", web_search_node)
workflow.add_node("generate", generate_node)

workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "web_search")
workflow.add_edge("web_search", "generate")
workflow.add_edge("generate", END)

rag_app = workflow.compile()
