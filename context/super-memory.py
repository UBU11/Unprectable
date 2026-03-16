from langgraph.graph import END, StateGraph
from supermemory import Supermemory

memory = Supermemory()


def retrieve_context(state):
    result = memory.profile(
        container_tag=state["user_id"],
        q=state["query"],
    )
    state["context"] = result
    return state


def store_interaction(state):
    memory.add(
        content=f"User: {state['query']}\nAssistant: {state['response']}",
        container_tag=state["user_id"],
    )
    return state
