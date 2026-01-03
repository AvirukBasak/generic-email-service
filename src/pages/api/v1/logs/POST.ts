import { NextApiRequest, NextApiResponse } from "next";
import { respond } from "@/utils/respond";
import { getLoggedInUser } from "@/middlewares/auth";
import { WithMiddleware } from "@/middlewares/WithMiddleware";
import { CustomApiError } from "@/types/errors/CustomApiError";
import { RateLimits } from "@/middlewares/ratelimit";
import { RequestValidationParser } from "@/parsers/RequestValidationParser";
import { LogsRepo } from "@/repo/LogsRepo";
import { LogPostReqBodyDTO } from "@/types/dtoOthers/logs/LogPostReqBodyDTO";
import { HttpMethodTypes } from "@/types";

export default WithMiddleware(
  /**
   * ### POST `/api/v1/logs`
   *
   * ### Request:
   *
   * ```
   * { type: "info" | "error" | "warn", message: string }
   * ```
   *
   * #### Response (`200`):
   *
   * ```
   * { message: `Log type ${type} added on ${timestamp}` }
   * ```
   *
   * #### Error codes (w/ sample messages):
   *
   * - 400 `{ message: "Bad request" }`
   * - 405 `{ message: "Method not allowed" }`
   * - 429 `{ message: "Too many requests. Try again after some time" }`
   * - 500 `{ message: "Internal server error" }`
   */
  async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (!(await RateLimits.Logs.POST(req, res))) return;

    RequestValidationParser.parse({ req, method: HttpMethodTypes.POST });

    const bodyResult = LogPostReqBodyDTO.fromJson(req.body);
    if (bodyResult.isErr) {
      throw CustomApiError.create(400, "Bad Request", bodyResult.error);
    }
    const { type, message } = bodyResult.value;

    // Auth middleware to get user
    const authResult = await getLoggedInUser(req);
    const userId = authResult.isSuccess() ? authResult.unwrapUidOrThrow() : "[UnknownUser]";

    const timestamp = await LogsRepo.post(userId, { message, type });
    return respond(res, { status: 200, message: `Log type ${type} added on ${timestamp}` });
  }
);
