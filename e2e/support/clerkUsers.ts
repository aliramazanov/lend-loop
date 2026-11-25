import { createClerkClient, type User } from "@clerk/backend";
import { TEST_USERS, type TestRole } from "./testUsers";

function clerkClient() {
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY must be set in .env.local");
  }

  return createClerkClient({ secretKey });
}

function profileOf(role: TestRole) {
  const { firstName, lastName } = TEST_USERS[role];
  const password = process.env.E2E_USER_PASSWORD;

  return {
    firstName,
    lastName,
    ...(password ? { password, skipPasswordChecks: true } : {}),
  };
}

async function findUser(role: TestRole): Promise<User | undefined> {
  const { data } = await clerkClient().users.getUserList({
    emailAddress: [TEST_USERS[role].email],
  });

  return data.at(0);
}

async function requireUser(role: TestRole): Promise<User> {
  const user = await findUser(role);

  if (!user) throw new Error(`No Clerk user for ${role}`);

  return user;
}

export async function ensureTestUser(role: TestRole) {
  const users = clerkClient().users;
  const existing = await findUser(role);

  if (!existing) {
    await users.createUser({
      emailAddress: [TEST_USERS[role].email],
      skipPasswordRequirement: true,
      ...profileOf(role),
    });

    return;
  }

  await users.updateUser(existing.id, profileOf(role));
  await users.unbanUser(existing.id);
}

export async function isBanned(role: TestRole): Promise<boolean> {
  const user = await requireUser(role);
  const latest = await clerkClient().users.getUser(user.id);

  return latest.banned;
}
