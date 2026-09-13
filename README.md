# Gen Solution — Cloudflare Website AI Receptionist

Final architecture: Cloudflare Worker + MongoDB Atlas + Workers AI. Website crawling, public PDF extraction and knowledge storage do not call Gemini embeddings. Retrieval uses MongoDB text search plus lexical scoring; only the final grounded answer uses Workers AI.

## Environment variables
- `MONGODB_URI` — MongoDB Atlas connection string
- `ADMIN_KEY` — private admin key
- `PUBLIC_URL` — deployed Worker URL, e.g. `https://gen-solution.<subdomain>.workers.dev`

The Worker also uses the Cloudflare `AI` binding defined in `wrangler.jsonc`.

## Deploy
1. Upload this project to GitHub.
2. Cloudflare Dashboard → Workers & Pages → Create application → Create Worker / import repository.
3. Add the three environment variables as secrets/vars.
4. Deploy.
5. Open the Worker URL, enter the client website URL + Admin Key, and start the build.
6. Wait until `done:true` and copy the generated script.
7. Put that one script before `</body>` on the client website.

## Important
- This version intentionally does NOT use Gemini embeddings.
- It follows same-domain links and common sitemap/robots discovery.
- It extracts text from normal public PDFs. Scanned/image-only PDFs require OCR and are not guaranteed.
- It refuses private/local URLs and answers only from indexed website content.
- Cloudflare Workers Free currently allows 100,000 requests/day; Workers AI has a 10,000 Neuron/day free allocation. See current Cloudflare limits/pricing before production use.
