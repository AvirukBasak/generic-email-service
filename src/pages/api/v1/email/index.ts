import { NextApiRequest, NextApiResponse } from "next";
import { RequestValidationParser } from "@/parsers/RequestValidationParser";
import { CustomApiError } from "@/types/errors";
import { HttpMethodTypes } from "@/types";

import POST from "./POST";

/* While this affects other handlers, in this case
 * it doesn't matter coz GET has no body */
export { config } from "./POST";

export default function (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  RequestValidationParser.parse({ req, method: HttpMethodTypes.POST });
  if (req.method === HttpMethodTypes.POST) {
    return POST(req, res);
  }
  // this should never throw
  throw CustomApiError.create(500, "Internal Server Error", "invalid http method type");
}
