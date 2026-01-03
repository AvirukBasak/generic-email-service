import formidable from "formidable";
import { WithMiddleware } from "@/middlewares/WithMiddleware";
import { RequestValidationParser } from "@/parsers/RequestValidationParser";
import { HttpMethodTypes } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { respond } from "@/utils/respond";
import { FormParseResult } from "@/types/util";
import { CustomApiError } from "@/types/errors";
import { EmailService } from "@/services/EmailService";

export const config = { api: { bodyParser: false } };

export default WithMiddleware(async function POST(req: NextApiRequest, res: NextApiResponse) {
  RequestValidationParser.parse({ req, method: HttpMethodTypes.POST });

  const form = formidable({ multiples: true, keepExtensions: true, allowEmptyFiles: true, minFileSize: 0 });

  const parsedForm = await new Promise<FormParseResult>((resolve, reject) =>
    form.parse(req, (err, valueFields, fileFields) => {
      if (err == null) return resolve({ valueFields, fileFields });
      if (err instanceof Error) {
        return reject(CustomApiError.create(400, `Bad Request: ${err.message}`, err));
      } else {
        return reject(CustomApiError.create(400, `Bad Request`, err));
      }
    })
  );

  const [serverCreds, emailData] = EmailService.parseForm(parsedForm);
  const messageId = await EmailService.sendEmail(serverCreds, emailData);

  return respond(res, { status: 200, json: { message: "Email sent successfully", messageId } });
});
