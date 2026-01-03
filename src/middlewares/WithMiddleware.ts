import { NextApiRequest, NextApiResponse } from "next";
import { cors } from "@/middlewares/cors";
import { catchAll } from "@/middlewares/errhandler";
import { errOnTimeout } from "@/middlewares/timeout";

export type ApiHandlerFunction = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export function WithMiddleware(handler: ApiHandlerFunction): ApiHandlerFunction {

  // wrap API handler in timeout & catchAll
  return catchAll(
    errOnTimeout(
      // ---
      async (req: NextApiRequest, res: NextApiResponse) => {
        if (!(await cors(req, res))) return;
        return handler(req, res);
      }
    )
  );
}
