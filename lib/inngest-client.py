import logging
from fastapi import FastAPI
import inngest
import inngest.fast_api

inngest_client = inngest.Inngest(
    app_id="fast_api_example",
    logger=logging.getLogger("uvicorn"),
    signing_key="signkey-prod-c160eff8eec8b1b136cdea3eb22de957be13408fb2ddcb44faf7b5dd8ee4a23a"
)


@inngest_client.create_function(
    fn_id="my_function",

    trigger=inngest.TriggerEvent(event="app/my_function"),
)
async def my_function(ctx: inngest.Context) -> str:
    ctx.logger.info(ctx.event)
    return "done"

app = FastAPI()

inngest.fast_api.serve(app, inngest_client, [my_function])
