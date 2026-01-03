import { NextApiRequest, NextApiResponse } from "next";
import { respond } from "@/utils/respond";
import { cors } from "@/middlewares/cors";
import { WithMiddleware } from "@/middlewares/WithMiddleware";

/**
 * ```
 * request = "GET /api"
 *
 * response = {
 *   message: "Hello World!"
 * }
 * ```
 */
export default WithMiddleware(async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (!(await cors(req, res))) return;
  return respond(res, { status: 200, message: "Hello World!" });
});
