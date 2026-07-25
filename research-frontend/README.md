# Inquira — Research Pipeline Frontend

A small React (Vite) UI for `run_research_pipeline()`: enter a topic, watch
the search → read → write → critique stages, then read the report and the
critic's note.

## 1. Expose the pipeline over HTTP

`pipeline.py` currently only runs from the command line, so drop the included
`api.py` (one level up from this folder, next to `pipeline.py`, `agents.py`
and `tools.py`) and run:

```bash
pip install fastapi uvicorn
uvicorn api:app --reload --port 8000
```

## 2. Run the frontend

```bash
npm install
npm run dev
```

Open the printed local URL. If your API runs somewhere other than
`http://localhost:8000/api/research`, set `VITE_API_URL` in a `.env` file
in this folder.

## Notes

- The pipeline only returns once all four stages finish, so the on-screen
  rail advances on a timer while it waits rather than showing live
  per-agent updates. If you want real progress, the cleanest upgrade is
  turning `api.py`'s endpoint into a Server-Sent-Events stream and emitting
  an event after each stage in `run_research_pipeline`.
- "Show research trail" reveals the raw search results and scraped content
  for anyone who wants to see the sourcing behind the report.
