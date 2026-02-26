/**
 * Server-side admin check using ADMIN_EMAIL. Use this instead of the cookie
 * so admin status is correct even if the cookie was set before ADMIN_EMAIL was set.
 */
export function getAdminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  return email || null;
}

export function isAdminUser(userId: string | null | undefined): boolean {
  if (!userId) return false;
  const admin = getAdminEmail();
  if (!admin) return false;
  return userId.trim().toLowerCase() === admin.trim().toLowerCase();
}
