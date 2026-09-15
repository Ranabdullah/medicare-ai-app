# MediCare local preview

First run `npm install`. Then run `node --env-file-if-exists=.env.local server.cjs` with Node 22 or later, then open http://127.0.0.1:4177.

Topic summaries work automatically without an AI account. Live AI questions require the app owner to configure GEMINI_API_KEY in .env.local (see .env.example), then restart the server. Never put the key in browser code. Questions and selected topic names are sent to Google only when asking for a live answer. This local server binds to the loopback interface; public deployment needs authentication and rate limiting before exposing the paid AI endpoint.

Recognised medicine guidance covers metformin, oral ibuprofen, paracetamol, co-amoxiclav, clarithromycin and atorvastatin. Other medicines explicitly show that guidance is unavailable. Screening is a small set of named rules, not a complete interaction database or clinical decision system. It checks all saved medicines and health topics, independent of display filters. Source excerpts load only from allowlisted NHS, HSE and NLM/MedlinePlus sites, with validated redirects and a one-hour memory cache.
