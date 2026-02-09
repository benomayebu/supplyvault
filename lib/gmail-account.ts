import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Encryption helpers using AES-256-GCM
// Requires ENCRYPTION_KEY env var (32 bytes base64 or hex). Prefer KMS in production.
const ENC_KEY = process.env.ENCRYPTION_KEY || ""; // must be 32 bytes

function getKeyBuffer() {
  if (!ENC_KEY) throw new Error("ENCRYPTION_KEY not set");
  // allow hex or base64
  if (/^[0-9a-fA-F]+$/.test(ENC_KEY) && ENC_KEY.length === 64) {
    return Buffer.from(ENC_KEY, "hex");
  }
  return Buffer.from(ENC_KEY, "base64");
}

function encrypt(plain: string) {
  const iv = crypto.randomBytes(12);
  const key = getKeyBuffer();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

function decrypt(payload: string) {
  const data = Buffer.from(payload, "base64");
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const enc = data.slice(28);
  const key = getKeyBuffer();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(enc), decipher.final()]);
  return out.toString("utf8");
}

export async function saveGmailAccount(opts: {
  brandId: string;
  email: string;
  accessToken: string;
  refreshToken?: string | null;
  scope?: string | null;
  tokenType?: string | null;
  expiresAt?: Date | null;
}) {
  const encryptedAccess = encrypt(opts.accessToken);
  const encryptedRefresh = opts.refreshToken
    ? encrypt(opts.refreshToken)
    : null;

  const account = await prisma.gmailAccount.create({
    data: {
      brand_id: opts.brandId,
      email: opts.email,
      access_token: encryptedAccess,
      refresh_token: encryptedRefresh,
      scope: opts.scope || null,
      token_type: opts.tokenType || null,
      expires_at: opts.expiresAt || null,
    },
  });

  return account;
}

export async function updateGmailTokens(
  accountId: string,
  tokens: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
  }
) {
  const data: any = {};
  if (tokens.access_token) data.access_token = encrypt(tokens.access_token);
  if (tokens.refresh_token) data.refresh_token = encrypt(tokens.refresh_token);
  if (tokens.token_type) data.token_type = tokens.token_type;
  if (tokens.expires_in)
    data.expires_at = new Date(Date.now() + tokens.expires_in * 1000);

  const updated = await prisma.gmailAccount.update({
    where: { id: accountId },
    data,
  });
  return updated;
}

export async function listAccountsToPoll() {
  // Return accounts that likely need polling. Implement filtering in production.
  const accounts = await prisma.gmailAccount.findMany();
  return accounts.map((a) => ({
    id: a.id,
    brand_id: a.brand_id,
    email: a.email,
    access_token: a.access_token ? decrypt(a.access_token) : null,
    refresh_token: a.refresh_token ? decrypt(a.refresh_token as string) : null,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

export async function getAccountById(id: string) {
  const a = await prisma.gmailAccount.findUnique({ where: { id } });
  if (!a) return null;
  return {
    id: a.id,
    brand_id: a.brand_id,
    email: a.email,
    access_token: a.access_token ? decrypt(a.access_token) : null,
    refresh_token: a.refresh_token ? decrypt(a.refresh_token as string) : null,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    expires_at: a.expires_at,
  };
}

export async function persistRefreshedTokens(accountId: string, tokens: any) {
  // tokens: { access_token, refresh_token?, expires_in }
  const data: any = {};
  if (tokens.access_token) data.access_token = encrypt(tokens.access_token);
  if (tokens.refresh_token)
    data.refresh_token = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : undefined;
  if (tokens.expires_in)
    data.expires_at = new Date(Date.now() + tokens.expires_in * 1000);

  const updated = await prisma.gmailAccount.update({
    where: { id: accountId },
    data,
  });
  return updated;
}

export async function markLastPolled(accountId: string) {
  return prisma.gmailAccount.update({
    where: { id: accountId },
    data: { last_polled_at: new Date() },
  });
}

export default prisma;
