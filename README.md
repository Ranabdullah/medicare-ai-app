# MediCare local preview

Run `node --env-file-if-exists=.env.local server.cjs` with Node 22 or later, then open http://127.0.0.1:4177.

Topic summaries work automatically without an AI account. Live AI questions require the app owner to configure GEMINI_API_KEY in .env.local (see .env.example), then restart the server. Never put the key in browser code. Questions and selected topic names are sent to Google only when asking for a live answer. This local server binds to the loopback interface; public deployment needs authentication and rate limiting before exposing the paid AI endpoint.
