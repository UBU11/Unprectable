from supermemory import Supermemory
import os
import dotenv
dotenv.load_dotenv()

client = Supermemory(api_key=os.getenv("SUPERMEMORY_API_KEY"))

USER_ID = "papu"

conversation = [
    {"role": "assistant", "content": "Hello, how are you doing?"},
    {"role": "user", "content": "Hello! I am papu. I am 20 years old. I love to code!"},
    {"role": "user", "content": "Can I go to the club?"},
]

profile = client.profile(container_tag=USER_ID, q=conversation[-1]["content"])
static = "\n".join(profile.profile.static)
dynamic = "\n".join(profile.profile.dynamic)
memories = "\n".join(r.get("memory", "") for r in profile.search_results.results)

context = f"""Static profile:
{static}

Dynamic profile:
{dynamic}

Relevant memories:
{memories}"""

messages = [{"role": "system", "content": f"User context:\n{context}"}, *conversation]


client.add(
    content="\n".join(f"{m['role']}: {m['content']}" for m in conversation),
    container_tag=USER_ID,
)
