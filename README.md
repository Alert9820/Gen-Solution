# AI Website Chatbot — Final Version

Features: URL-to-chatbot crawling, sitemap discovery, same-domain links, public PDF extraction, Gemini embeddings/generation, MongoDB knowledge base, semantic retrieval, source links, English/Roman Hinglish, website-only answers, date-aware instructions, responsive iframe widget, admin key, background indexing and health endpoint.

Required env vars: GEMINI_API_KEY, MONGODB_URI, PUBLIC_URL, ADMIN_KEY.
Optional: GEMINI_CHAT_MODEL=gemini-3.8-flash, GEMINI_EMBED_MODEL=gemini-embedding-001, EMBEDDING_DIM=768, MAX_PAGES=400, MAX_PDFS=100, MAX_CHUNKS=12000, REQUEST_TIMEOUT=20.

Deploy app.py, requirements.txt and render.yaml to GitHub, create a Render Web Service, add the required environment variables, then deploy. Open the Render URL, enter the client URL and ADMIN_KEY, build, and copy the generated script into the client website.

MongoDB Atlas is required. The app creates database/collections automatically. Default retrieval uses cosine similarity in Python, so no manual Atlas Vector Search index is required.

Limitations: authentication-only pages, blocked pages, image-only scanned PDFs without OCR, and content hidden entirely behind browser interactions cannot be guaranteed. Normal public WordPress/content sites get broad coverage through sitemap + link crawling + PDF extraction.

Keep all API keys and ADMIN_KEY server-side.
