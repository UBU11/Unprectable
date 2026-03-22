import logging
import Inngest
import Inngest.fastapi

inngest = inngest.Inngest(
    app_id = "Unpreactable",
    logger=logging.getLogger("uvicorn"),
)



@inngest.client.create_function(
    fn_id="inngest_test",
    trigger=inggest.TriggerEvent(event="app/my_function")
)

async def ingest_test(ctx: inngest.Context) -> str:
    ctx.logger.info(ctx.event)
    return "done"

app = FastAPI()

inngest.fastapi_api.serve(app, inngest_client, [ingest_test])

