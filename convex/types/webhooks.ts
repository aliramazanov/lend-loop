export type SignedRequest =
  { ok: true; rawBody: string } | { ok: false; response: Response };
