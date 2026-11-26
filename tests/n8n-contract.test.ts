// @vitest-environment node
import * as nodeCrypto from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { canonicalRequest, verifyHmacSha256 } from "../convex/lib/hmac";
import { HTTP_ROUTES } from "../convex/lib/httpRoutes";
import { signedEventRequest } from "../convex/model/loanEventDelivery";

const CALLBACK_SECRET = "callback-secret-at-least-32-characters";
const WEBHOOK_SECRET = "webhook-secret-at-least-32-characters";

function field(value: unknown, ...keys: string[]): unknown {
  let current = value;

  for (const key of keys) {
    if (typeof current !== "object" || current === null) return undefined;

    current = Reflect.get(current, key);
  }

  return current;
}

function codeNode(workflowFile: string, nodeName: string): string {
  const workflowUrl = new URL(
    `../n8n/workflows/${workflowFile}`,
    import.meta.url,
  );
  const workflow: unknown = JSON.parse(readFileSync(workflowUrl, "utf8"));
  const nodes = field(workflow, "nodes");

  if (!Array.isArray(nodes)) throw new Error(`${workflowFile} has no nodes`);

  const node: unknown = nodes.find((item) => field(item, "name") === nodeName);
  const code = field(node, "parameters", "jsCode");

  if (typeof code !== "string") throw new Error(`${nodeName} has no code`);

  return code;
}

function firstItem(output: unknown): unknown {
  return Array.isArray(output) ? output[0] : undefined;
}

function runCodeNode(code: string, globals: object): unknown {
  const sandbox = {
    ...globals,
    Buffer,
    require: (name: string) => (name === "crypto" ? nodeCrypto : undefined),
  };

  return runInNewContext(`(() => {\n${code}\n})()`, sandbox);
}

function signInN8n(method: string, path: string, body: string) {
  const items = [{ json: { method, path, body } }];

  const signed = firstItem(
    runCodeNode(codeNode("signed-convex-call.json", "Sign Request"), {
      $env: {
        N8N_CALLBACK_SECRET: CALLBACK_SECRET,
        CONVEX_SITE_URL: "http://convex.test",
      },
      $input: { all: () => items },
    }),
  );

  return {
    timestamp: String(field(signed, "json", "timestamp")),
    signature: String(field(signed, "json", "signature")),
  };
}

async function convexAccepts(
  signed: { timestamp: string; signature: string },
  method: string,
  path: string,
  body: string,
) {
  const result = await verifyHmacSha256({
    secret: CALLBACK_SECRET,
    timestamp: signed.timestamp,
    signature: signed.signature,
    body: canonicalRequest(method, path, body),
  });

  return result.ok;
}

describe("n8n and Convex agree on signatures", () => {
  it("accepts what the n8n signing node produces, for GET and POST", async () => {
    const body = JSON.stringify({ loanId: "loan-1" });
    const route = HTTP_ROUTES.overdueReminderSent;
    const post = signInN8n("POST", route, body);
    const get = signInN8n("GET", HTTP_ROUTES.overdueLoans, "");

    expect(await convexAccepts(post, "POST", route, body)).toBe(true);
    expect(await convexAccepts(get, "GET", HTTP_ROUTES.overdueLoans, "")).toBe(
      true,
    );
  });

  it("rejects an n8n signature moved to another route or body", async () => {
    const body = JSON.stringify({ loanId: "loan-1" });
    const signed = signInN8n("POST", HTTP_ROUTES.overdueReminderSent, body);
    const otherRoute = HTTP_ROUTES.dueSoonReminderSent;
    const otherBody = JSON.stringify({ loanId: "loan-2" });

    expect(await convexAccepts(signed, "POST", otherRoute, body)).toBe(false);

    expect(
      await convexAccepts(
        signed,
        "POST",
        HTTP_ROUTES.overdueReminderSent,
        otherBody,
      ),
    ).toBe(false);
  });

  it("lets the n8n webhook verify events that Convex signs, and refuse forged ones", async () => {
    const payload = JSON.stringify({ eventId: "evt-1", status: "pending" });
    const request = await signedEventRequest(WEBHOOK_SECRET, payload);

    const headers = Object.fromEntries(
      Object.entries(request.headers).map(([name, value]) => [
        name.toLowerCase(),
        value,
      ]),
    );

    const verify = (secret: string) =>
      runCodeNode(
        codeNode("request-notification.json", "Verify HMAC Signature"),
        {
          $env: { N8N_WEBHOOK_SECRET: secret },
          $input: {
            first: () => ({
              json: { headers, body: JSON.parse(request.body) },
            }),
          },
          $getWorkflowStaticData: () => ({}),
        },
      );

    expect(field(firstItem(verify(WEBHOOK_SECRET)), "json", "valid")).toBe(
      true,
    );

    expect(
      field(
        firstItem(verify("a-different-secret-of-32-characters")),
        "json",
        "valid",
      ),
    ).toBe(false);
  });

  it("keeps template literals out of n8n expressions, which n8n cannot parse", () => {
    const folder = new URL("../n8n/workflows/", import.meta.url);

    const offending = readdirSync(folder).flatMap((file) => {
      const text = readFileSync(new URL(file, folder), "utf8");
      const expressions = text.match(/"=\{\{[^"]*"/g) ?? [];

      return expressions
        .filter((expression) => expression.includes("`"))
        .map((expression) => `${file}: ${expression}`);
    });

    expect(offending).toEqual([]);
  });
});
