import { CustomApiError } from "@/types/errors";
import { LogsRepo } from "@/repo/LogsRepo";
import { LogType } from "@/types";

export async function logToDb(e: Error): Promise<Error> {
  if (e instanceof CustomApiError && 400 <= e.status && e.status <= 499) {
    return e;
  }
  await LogsRepo.post("[InternalServerError]", { message: String(e), type: LogType.ERROR }).catch((e) =>
    console.error("[E] [LogToDb]", e)
  );
  return e;
}
