const COOKIE_NAME = "admin_session";

async function token() {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.ADMIN_PASSWORD!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("undangan-admin"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isValidPassword(password: string) {
  return password === process.env.ADMIN_PASSWORD;
}

export async function isValidSessionCookie(cookieValue: string | undefined) {
  return !!cookieValue && cookieValue === (await token());
}

export { COOKIE_NAME };
export function sessionToken() {
  return token();
}
