# StyleAI

StyleAI is an intelligent fashion styling platform that leverages Groq's LLaMA 3.3 70B model to provide personalized styling recommendations, skin tone analysis, outfit suggestions, and curated shopping links.

## Features
- Photo-based skin tone detection and analysis
- Gender-aware styling recommendations
- Outfit suggestions and curated shopping links
- Fast responses via Groq's optimized API

## Architecture (high-level)
- Frontend: minimal web UI for image upload and preference selection
- Backend: Flask API that accepts images, performs preprocessing, calls Groq LLM via HTTP, and returns structured recommendations
- Groq LLM: provides language-driven analysis and recommendation generation

## Files added
- [README.md](README.md)
- [backend/app.py](backend/app.py)
- [backend/groq_client.py](backend/groq_client.py)
- [backend/requirements.txt](backend/requirements.txt)
- [frontend/index.html](frontend/index.html)

## Environment variables
- `GROQ_API_KEY` — your Groq API key
- `GROQ_API_URL` — Groq endpoint for LLaMA (example: https://api.groq.com/v1/llm)

## Setup (Windows)
1. Create a Python virtual environment and activate it:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install backend dependencies:

```powershell
pip install -r backend/requirements.txt
```

3. Set environment variables (PowerShell):

```powershell
$env:GROQ_API_KEY = "your_key_here"
$env:GROQ_API_URL = "https://api.groq.com/v1/llm"
```

4. Run the backend:

```powershell
python backend/app.py
```

5. Open `frontend/index.html` in a browser and test uploading a photo.

## API Endpoints (backend)
- `GET /health` — service health check
- `POST /analyze` — multipart form: `image` file, `gender` string. Returns JSON with `skin_tone`, `recommendations`, and `shopping_links`.

## Next steps / suggestions
- Replace the placeholder Groq request in `backend/groq_client.py` with production integration and prompt engineering for LLaMA.
- Add secure upload handling and persistent storage for photos.
- Add authentication and rate limiting.

---

If you'd like, I can now: implement more detailed prompt templates for the LLM, add unit tests, or wire a production-ready Groq integration.
