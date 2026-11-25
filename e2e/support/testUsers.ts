import path from "node:path";

interface TestUser {
  email: string;
  firstName: string;
  lastName: string;
}

export const TEST_USERS = {
  lender: {
    email: "lender+clerk_test@example.com",
    firstName: "Lena",
    lastName: "Lender",
  },

  borrower: {
    email: "borrower+clerk_test@example.com",
    firstName: "Ben",
    lastName: "Borrower",
  },

  admin: {
    email: "admin+clerk_test@example.com",
    firstName: "Ada",
    lastName: "Admin",
  },

  spare: {
    email: "spare+clerk_test@example.com",
    firstName: "Sam",
    lastName: "Spare",
  },
} as const satisfies Record<string, TestUser>;

export type TestRole = keyof typeof TEST_USERS;

export const TEST_ROLES: TestRole[] = ["lender", "borrower", "admin", "spare"];

export function fullName(role: TestRole): string {
  const { firstName, lastName } = TEST_USERS[role];

  return `${firstName} ${lastName}`;
}

export function authFile(role: TestRole): string {
  return path.join("playwright", ".clerk", `${role}.json`);
}
