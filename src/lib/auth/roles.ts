/**
 * VioX AI · DMA CRM — Role definitions and helpers.
 *
 * Roles live in Clerk's `publicMetadata.role` field on the user record. The
 * Clerk webhook (api/webhooks/clerk) syncs Clerk users into the `members`
 * table in Supabase and stamps a default role on first sign-in.
 */
import { auth, currentUser } from '@clerk/nextjs/server'

export type Role =
  | 'super_admin'        // Juan, board co-chairs — full access incl. agent config
  | 'board_member'       // Board of Directors — approvals, content, member data
  | 'institution_manager' // Operations staff — daily CRUD on members/events
  | 'physician_member'   // DMA member — manage own profile + dues
  | 'public'             // Default for any authed user not yet assigned

const ROLE_RANK: Record<Role, number> = {
  super_admin: 100,
  board_member: 80,
  institution_manager: 60,
  physician_member: 30,
  public: 0,
}

export function rankOf(role: Role | undefined | null): number {
  if (!role) return 0
  return ROLE_RANK[role] ?? 0
}

export function hasAtLeast(actual: Role | undefined | null, required: Role): boolean {
  return rankOf(actual) >= rankOf(required)
}

/** Pull the current user's role from Clerk publicMetadata. */
export async function getCurrentRole(): Promise<Role> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return 'public'
  // sessionClaims includes publicMetadata when configured in Clerk JWT template
  const claimRole = (sessionClaims?.publicMetadata as { role?: Role } | undefined)?.role
  if (claimRole) return claimRole
  // Fallback: fetch user
  const user = await currentUser()
  return ((user?.publicMetadata as { role?: Role } | undefined)?.role) ?? 'public'
}

/** Throw if current user lacks required role. Use in server actions / route handlers. */
export async function requireRole(required: Role): Promise<{ userId: string; role: Role }> {
  const { userId } = await auth()
  if (!userId) throw new Error('UNAUTHORIZED: not signed in')
  const role = await getCurrentRole()
  if (!hasAtLeast(role, required)) {
    throw new Error(`FORBIDDEN: role ${role} insufficient (requires ${required})`)
  }
  return { userId, role }
}

export const STAFF_ROLES: Role[] = ['super_admin', 'board_member', 'institution_manager']
