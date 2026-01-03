import fs from "fs";
import formidable from "formidable";
import nodemailer from "nodemailer";
import { Nullable } from "@/types";
import { FormParseResult } from "@/types/util";
import { CustomApiError } from "@/types/errors";

interface EmailData {
  to: string[];
  cc: string[];
  bcc: string[];
  from: string;
  subject: string;
  text?: Nullable<string>;
  html?: Nullable<string>;
  attachments: formidable.File[];
}

export interface EmailServerCreds {
  host: string;
  port: string;
  user: string;
  password: string;
}

export class EmailService {
  static parseForm(parsedForm: FormParseResult): [EmailServerCreds, EmailData] {
    const { valueFields, fileFields } = parsedForm;

    const emailHost = getValueField(valueFields["emailHost"]);
    if (emailHost == null) {
      throw CustomApiError.create(400, "Missing 'emailHost' field");
    }

    const emailUser = getValueField(valueFields["emailUser"]);
    if (emailUser == null) {
      throw CustomApiError.create(400, "Missing 'emailUser' field");
    }

    const emailPort = getValueField(valueFields["emailPort"]) ?? "587";

    const emailPassword = getValueField(valueFields["emailPassword"]);
    if (emailPassword == null) {
      throw CustomApiError.create(400, "Missing 'emailPassword' field");
    }

    const serverCreds: EmailServerCreds = {
      host: emailHost,
      port: emailPort,
      user: emailUser,
      password: emailPassword,
    };

    const from = getValueField(valueFields["from"]);
    if (from == null) {
      throw CustomApiError.create(400, "Missing 'from' field");
    }

    const subject = getValueField(valueFields["subject"]);
    if (subject == null) {
      throw CustomApiError.create(400, "Missing 'subject' field");
    }

    const isHtmlField = getValueField(valueFields["isHtml"]);
    const body = getValueField(valueFields["body"]);

    if (body != null && isHtmlField == null) {
      throw CustomApiError.create(400, "Field 'isHtml' is required if 'body' is provided");
    }

    const isHtml = isHtmlField === "true";

    const html = getValueField(valueFields["html"]) ?? (isHtml ? body : null);
    const text = getValueField(valueFields["text"]) ?? (isHtml ? null : body);

    console.log(isHtml, body, html, text);

    if (body == null && text == null && html == null) {
      throw CustomApiError.create(400, "Provide one of either 'body', 'text' or 'html' field");
    }

    // Extract recipient arrays
    const to = getArrayField<string>(valueFields["to"]);
    if (to.length === 0) {
      throw CustomApiError.create(400, "At least one 'to' recipient is required");
    }

    const cc = getArrayField<string>(valueFields["cc"]);
    const bcc = getArrayField<string>(valueFields["bcc"]);

    // Extract attachments
    const attachments = getArrayField<formidable.File>(fileFields["file"]);

    // Validate attachment file paths
    for (const attachment of attachments) {
      if (attachment.filepath.length === 0 || !fs.existsSync(attachment.filepath)) {
        throw CustomApiError.create(500, "Invalid filepath for uploaded attachment", attachment);
      }
    }

    const emailData: EmailData = {
      to,
      cc,
      bcc,
      from,
      subject,
      text,
      html,
      attachments,
    };

    return [serverCreds, emailData];
  }

  static async sendEmail(creds: EmailServerCreds, data: EmailData): Promise<string> {
    try {
      // Create transporter with provided credentials
      const transporter = nodemailer.createTransport({
        host: creds.host,
        port: parseInt(creds.port),
        secure: creds.port === "465",
        auth: {
          user: creds.user,
          pass: creds.password,
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
        cc: data.cc.length > 0 ? data.cc.join(", ") : void 0,
        bcc: data.bcc.length > 0 ? data.bcc.join(", ") : void 0,
        subject: data.subject,
        html: data.html ?? void 0,
        text: data.text ?? void 0,
        attachments: attachments.length > 0 ? attachments : void 0,
      };

      const { messageId } = await transporter.sendMail(mailOptions);
      return messageId;
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
}

// Helper to extract field values from formidable
function getValueField(field: Nullable<string | string[]>): Nullable<string> {
  if (Array.isArray(field)) {
    return field.length > 0 ? field[0] : null;
  }
  return field;
}

// Helper to extract array fields (for to, cc, bcc)
function getArrayField<T>(field: Nullable<T | T[]>): T[] {
  if (field == null) return [];
  if (Array.isArray(field)) {
    return field;
  }
  return [field];
}
