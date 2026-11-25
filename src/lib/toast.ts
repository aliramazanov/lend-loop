import { toast } from "sonner";
import { errorMessage } from "./errors";

export async function withToast(
  action: Promise<unknown>,
  successMessage: string,
): Promise<boolean> {
  try {
    await action;
    toast.success(successMessage);

    return true;
  } catch (error) {
    toast.error(errorMessage(error));

    return false;
  }
}
