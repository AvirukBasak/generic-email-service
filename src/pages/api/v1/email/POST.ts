import fs from "fs";
import formidable from "formidable";
import nodemailer from "nodemailer";
import { WithMiddleware } from "@/middlewares/WithMiddleware";
import { RequestValidationParser } from "@/parsers/RequestValidationParser";
import { HttpMethodTypes, Nullable } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { respond } from "@/utils/respond";
import { FormParseResult } from "@/types/util";
import { CustomApiError } from "@/types/errors";

export const config = { api: { bodyParser: false } };

interface EmailFormData {
  to: string[];
  cc: string[];
  bcc: string[];
  from: string;
  subject: string;
  body: string;
  isHtml: boolean;
  emailHost: string;
  emailPort: string;
  emailUser: string;
  emailPassword: string;
  attachments: formidable.File[];
}

// Helper to extract field values from formidable
function getFieldValue(field: Nullable<string | string[]>): string {
  if (field == null) {
    throw CustomApiError.create(400, "Missing required field");
  }
  if (Array.isArray(field)) {
    return field[0] ?? "";
  }
  return field;
}

// Helper to extract array fields (for to, cc, bcc)
function getArrayField(field: Nullable<string | string[]>): string[] {
  if (field == null) return [];
  if (Array.isArray(field)) {
    return field;
  }
  return [field];
}

// Helper to extract files array
function getFilesArray(field: Nullable<formidable.File | formidable.File[]>): formidable.File[] {
  if (field == null) return [];
  if (Array.isArray(field)) {
    return field;
  }
  return [field];
}

// Parse form data into structured EmailFormData
function parseEmailFormData(parsedForm: FormParseResult): EmailFormData {
  const { valueFields, fileFields } = parsedForm;

  // Extract and validate required fields
  const from = valueFields["from"];
  if (from == null || (Array.isArray(from) ? from.length === 0 : !from)) {
    throw CustomApiError.create(400, "Missing 'from' field");
  }

  const subject = valueFields["subject"];
  if (subject == null || (Array.isArray(subject) ? subject.length === 0 : !subject)) {
    throw CustomApiError.create(400, "Missing 'subject' field");
  }

  const body = valueFields["body"];
  if (body == null || (Array.isArray(body) ? body.length === 0 : !body)) {
    throw CustomApiError.create(400, "Missing 'body' field");
  }

  const emailHost = valueFields["emailHost"];
  if (emailHost == null || (Array.isArray(emailHost) ? emailHost.length === 0 : !emailHost)) {
    throw CustomApiError.create(400, "Missing 'emailHost' field");
  }

  const emailUser = valueFields["emailUser"];
  if (emailUser != null || (Array.isArray(emailUser) ? emailUser.length === 0 : !emailUser)) {
    throw CustomApiError.create(400, "Missing 'emailUser' field");
  }

  const emailPassword = valueFields["emailPassword"];
  if (emailPassword == null || (Array.isArray(emailPassword) ? emailPassword.length === 0 : !emailPassword)) {
    throw CustomApiError.create(400, "Missing 'emailPassword' field");
  }

  // Extract recipient arrays
  const to = getArrayField(valueFields["to"]);
  if (to.length === 0) {
    throw CustomApiError.create(400, "At least one 'to' recipient is required");
  }

  const cc = getArrayField(valueFields["cc"]);
  const bcc = getArrayField(valueFields["bcc"]);

  // Extract optional fields with defaults
  const isHtmlField = valueFields["isHtml"]?.[0] ?? "false";
  const isHtml = isHtmlField === "true";

  const emailPortField = valueFields["emailPort"];
  const emailPort = (Array.isArray(emailPortField) ? emailPortField[0] : emailPortField) ?? "587";

  // Extract attachments
  const attachments = getFilesArray(fileFields["file"]);

  // Validate attachment file paths
  for (const attachment of attachments) {
    if (attachment.filepath.length === 0 || attachment.filepath.length === 0 || !fs.existsSync(attachment.filepath)) {
      throw CustomApiError.create(500, "Invalid filepath for uploaded attachment");
    }
  }

  return {
    to,
    cc,
    bcc,
    from: getFieldValue(from),
    subject: getFieldValue(subject),
    body: getFieldValue(body),
    isHtml,
    emailHost: getFieldValue(emailHost),
    emailPort,
    emailUser: getFieldValue(emailUser),
    emailPassword: getFieldValue(emailPassword),
    attachments,
  };
}

// Send email using nodemailer
async function sendEmail(data: EmailFormData): Promise<string> {
  try {
    // Create transporter with provided credentials
    const transporter = nodemailer.createTransport({
      host: data.emailHost,
      port: parseInt(data.emailPort),
      secure: data.emailPort === "465",
      auth: {
        user: data.emailUser,
        pass: data.emailPassword,
      },
    });

    // Prepare attachments for nodemailer
    const attachments = data.attachments.map((file) => ({
      filename: file.originalFilename ?? file.newFilename,
      path: file.filepath,
    }));

    // Prepare email options
    const mailOptions = {
      from: data.from,
      to: data.to.join(", "),
      cc: data.cc.length > 0 ? data.cc.join(", ") : undefined,
      bcc: data.bcc.length > 0 ? data.bcc.join(", ") : undefined,
      subject: data.subject,
      [data.isHtml ? "html" : "text"]: data.body,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return info.messageId;
  } catch (err) {
    throw CustomApiError.create(500, "Failed to send email", err);
  } finally {
    // Clean up files even on error
    data.attachments.forEach((file) => {
      fs.unlink(file.filepath, (err) => {
        if (err != null) console.error("Error deleting temp file:", err);
      });
    });
  }
}

export default WithMiddleware(async function POST(req: NextApiRequest, res: NextApiResponse) {
  RequestValidationParser.parse({ req, method: HttpMethodTypes.POST });

  // Parse multipart form data
  const form = formidable({ multiples: true, keepExtensions: true });

  const parsedForm = await new Promise<FormParseResult>((resolve, reject) =>
    form.parse(req, (err, valueFields, fileFields) => {
      if (err == null) return resolve({ valueFields, fileFields });
      return reject(CustomApiError.create(400, "Bad Request", err));
    })
  );

  // Parse and validate email form data
  const emailData = parseEmailFormData(parsedForm);

  // Send email
  const messageId = await sendEmail(emailData);

  return respond(res, {
    status: 200,
    json: {
      message: "Email sent successfully",
      messageId,
    },
  });
});
