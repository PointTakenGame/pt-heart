/// <reference types="vite/client" />

// The three build-time values corpus.ts reads. Declared rather than inherited
// from vite/client's index signature so a typo in a name is a compile error
// instead of a silently undefined key that turns capture off in production.
interface ImportMetaEnv {
  /** Heart's own Supabase project, https://<ref>.supabase.co */
  readonly VITE_SUPABASE_URL?: string;
  /** The publishable key. It ships in the bundle by design; the table's
   *  row-level security is what makes that safe, not secrecy. */
  readonly VITE_SUPABASE_KEY?: string;
  /** Short commit sha, stamped by vite.config.ts. 'dev' on a laptop. */
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
