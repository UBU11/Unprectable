import streamlit as st
from model.agent_graph import rag_app
from langchain_core.messages import HumanMessage

st.set_page_config(page_title="Document live RAG", layout="wide")

st.title("Document live RAG")

if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

with st.sidebar:
    st.header('Upload Document')
    new_doc = st.text_area("enter details about your document")
    if st.button("Index data"):
        from db.document import add_documents
        add_documents([new_doc])
        st.success("Data indexed")

for msg in st.session_state.chat_history:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

if prompt := st.chat_input("Ask me anything..."):
    st.session_state.chat_history.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    
    with st.spinner("Thinking..."):
        inputs = {"messages:" [HumanMessage(content=prompt)]}
        config = {"configurable": {"thread_id": "1"}}
        result = rag_app.invoke(inputs, config)
        
        answer = result["messages"][-1].content
        
    with st.chat_message("assistant"):
            st.markdown(answer)
    st.session_state.chat_history.append({"role": "assistant", "content": answer})
        