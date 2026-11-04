<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Site content (properties, agents, categories, settings) is read client-side via React Query from Lovable Cloud with public RLS reads; admin writes are gated by `has_role(auth.uid(),'admin')` RLS so admin edits reflect live.
- Uploaded images go to the private `media` bucket (public buckets are blocked) and are stored as long-lived signed URLs.
- The first account ever created is auto-granted admin by the signup trigger.

- Sitemap is router-derived (src/lib/sitemap.ts + src/routes/sitemap[.]xml.ts): every route must declare staticData.sitemap, so new pages make an explicit indexing decision.
