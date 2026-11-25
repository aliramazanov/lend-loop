import type { api } from "@convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

type ItemOf<List> = List extends readonly (infer Item)[] ? Item : never;

export type CurrentUser = NonNullable<
  FunctionReturnType<typeof api.users.getCurrentUser>
>;

export type BoardTool = ItemOf<FunctionReturnType<typeof api.tools.listBoard>>;

export type OwnListing = ItemOf<
  FunctionReturnType<typeof api.tools.listMyListings>
>;

export type RemovedListing = ItemOf<
  FunctionReturnType<typeof api.tools.listMyRemovedListings>
>;

export type ToolDetailsView = NonNullable<
  FunctionReturnType<typeof api.tools.getDetails>
>;

export type LoanView = ItemOf<
  FunctionReturnType<typeof api.loans.listMyRequests>
>;

export type IncomingLoan = ItemOf<
  FunctionReturnType<typeof api.loans.listIncomingRequests>
>;

export type BorrowerHistory = NonNullable<IncomingLoan["borrowerHistory"]>;

export type ListedLoan = LoanView &
  Partial<Pick<IncomingLoan, "borrowerHistory">>;

export type AdminUser = ItemOf<
  FunctionReturnType<typeof api.users.listUsersForAdmin>
>;

export type AdminOverview = FunctionReturnType<typeof api.admin.overview>;
