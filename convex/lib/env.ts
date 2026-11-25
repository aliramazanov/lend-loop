import { SIGNATURE_POLICY } from "./config";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

function readSecret(name: string): string | undefined {
  const secret = readEnv(name);

  if (!secret || secret.length < SIGNATURE_POLICY.minSecretLength) {
    return undefined;
  }

  return secret;
}

export function adminEmails(): Set<string> {
  const emails = (readEnv("ADMIN_EMAILS") ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return new Set(emails);
}

export function n8nWebhookTarget(): { url: string; secret: string } | null {
  const url = readEnv("N8N_REQUEST_WEBHOOK_URL");
  const secret = readSecret("N8N_WEBHOOK_SECRET");

  return url && secret ? { url, secret } : null;
}

export function n8nCallbackSecret(): string | undefined {
  return readSecret("N8N_CALLBACK_SECRET");
}

export function clerkSecretKey(): string | undefined {
  return readEnv("CLERK_SECRET_KEY");
}

export function resendConfig(): { apiKey: string; from: string } | null {
  const apiKey = readEnv("RESEND_API_KEY");
  const from = readEnv("EMAIL_FROM");

  return apiKey && from ? { apiKey, from } : null;
}

export function clerkWebhookSecret(): string | undefined {
  return readEnv("CLERK_WEBHOOK_SECRET");
}
