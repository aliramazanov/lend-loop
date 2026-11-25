import { vi } from "vitest";

type Responder = (request: Request) => Response;

const OK: Responder = () => new Response("{}", { status: 200 });

export function stubFetch(respond: Responder = OK): Request[] {
  const requests: Request[] = [];

  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>(async (input, init) => {
      const request = new Request(input, init);

      requests.push(request);

      return respond(request);
    }),
  );

  return requests;
}
