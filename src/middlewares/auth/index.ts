import * as config from "@/config/env";
import type { NextApiRequest } from "next";
import { FirebaseAuth } from "@/firebase/init";
import { CustomApiError } from "@/types/errors";
import { AuthResult } from "@/middlewares/auth/AuthResult";
import { HeaderTypes, UNKNOWN_STR } from "@/types";

export async function getLoggedInUser(req: NextApiRequest): Promise<AuthResult> {
  // get the token from header
  const tokenFromHeader = req.headers[HeaderTypes.X_FIREBASE_TOKEN];
  if (tokenFromHeader == null || tokenFromHeader.length === 0) {
    return AuthResult.create("MISSING_CREDS");
  }

  /* If ALLOW_DEVMODE_DEFAULT_USER then allow login with a default user ID.
   * NOTE: Default user allows login without firebase and with default credentials.
   * It however does not allow access to protected content of other users in the app. */
  if (config.ALLOW_DEVMODE_DEFAULT_USER) {
    return AuthResult.create("USER_FOUND", config.DEVMODE_DEFAULT_USER_ID);
  }

  const token: string = tokenFromHeader instanceof Array ? (tokenFromHeader[0] as string) : tokenFromHeader;

  try {
    const decodedToken = await FirebaseAuth.verifyIdToken(token);
    req.query["auth.uid"] = decodedToken.uid;
    return AuthResult.create("USER_FOUND", decodedToken.uid);
  } catch (e) {
    console.trace(e);
    return AuthResult.create("USER_NOT_FOUND");
  }
}

/**
 * Middleware to authenticate Firebase token and get UID.
 * Throws error if not logged in.
 * @returns {Promise<string>} UID of authenticated user
 * @throws {CustomApiError} If not authenticated
 */
export async function authenticate(req: NextApiRequest, expectedUid: string = UNKNOWN_STR): Promise<string> {
  const authResult = await getLoggedInUser(req);
  const loggedInUid = authResult.unwrapUidOrThrow();

  if (typeof expectedUid === "string") {
    if (expectedUid === loggedInUid) {
      return loggedInUid;
    } else {
      throw CustomApiError.create(401, "Invalid auth credentials");
    }
  } else {
    throw CustomApiError.create(401, "Missing auth credentials");
  }
}
