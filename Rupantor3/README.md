


  # Rupantor Climate Action App

  This is a code bundle for Rupantor Climate Action App. The original project is available at https://www.figma.com/design/jsj0MSA75CNNjLWt4ZVvG4/Rupantor-Climate-Action-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
  ## Environment Variables
  
  Create a `.env` (or configure in your host) with:
  
  - `VITE_SUPABASE_PROJECT_ID` = your Supabase project ref (e.g. `abc123xyz`)
  - `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key
  
  A `.env.example` is included as a reference.
  
  ## Build
  
  - `npm run build` → outputs to `build/` (see `vite.config.ts`).
  
  ## Deploy (Vercel recommended)
  
  1. Push the repository to GitHub/GitLab/Bitbucket
  2. Import the repo in Vercel
  3. Framework: Vite
  4. Build Command: `vite build`
  5. Output Directory: `build`
  6. Add env vars in Vercel Project Settings:
     - `VITE_SUPABASE_PROJECT_ID`
     - `VITE_SUPABASE_ANON_KEY`
  7. Deploy
  
  The app uses hash-based routing (via URL fragments), so no special rewrites are needed.
  
  ## Supabase Edge Functions
  
  This app calls a Supabase Edge Function at `functions/v1/server` for events, profiles, volunteers, chat, etc.
  
  Deploy with Supabase CLI:
  
  - `npm i -g supabase`
  - `supabase login`
  - `supabase link --project-ref <YOUR_PROJECT_REF>`
  - `supabase functions deploy server`
  
  After deployment, confirm the endpoints respond (example):
  
  - `https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/server/events`
  
  In Supabase Auth → URL Configuration, set your production domain in Site URL and Redirect URLs.
  
  If you hit CORS issues, allow your production origin(s) within the function handler or use permissive CORS while testing.
  
