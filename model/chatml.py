import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    raise ValueError("OPENROUTER_API_KEY is not set in environment")

model = ChatOpenAI(
    model="z-ai/glm-4.5-air:free",
    api_key=api_key,
    base_url="https://openrouter.ai/api/v1",
)

response = model.invoke("Hello, how are you")
print(response.content)
