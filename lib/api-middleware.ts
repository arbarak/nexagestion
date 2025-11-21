import { NextRequest, NextResponse } from "next/server";
import { getSession, SessionPayload } from "@/lib/auth";
import { ErrorCodes } from "@/lib/api-error";

export type ApiHandler = (
  request: NextRequest,
  context: {
    session: SessionPayload;
    params?: Record<string, string>;
  }
) => Promise<NextResponse>;

export async function withAuth(handler: ApiHandler) {
  return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
    try {
      const session = await getSession();

      if (!session) {
        throw ErrorCodes.UNAUTHORIZED("Authentication required");
      }

      return await handler(request, {
        session,
        params: context?.params,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Authentication")) {
        return NextResponse.json(
          { error: { code: "UNAUTHORIZED", message: error.message } },
          { status: 401 }
        );
      }
      throw error;
    }
  };
}

export async function withRole(
  handler: ApiHandler,
  allowedRoles: string[]
) {
  return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
    try {
      const session = await getSession();

      if (!session) {
        throw ErrorCodes.UNAUTHORIZED("Authentication required");
      }

      if (!allowedRoles.includes(session.role)) {
        throw ErrorCodes.FORBIDDEN("Insufficient permissions");
      }

      return await handler(request, {
        session,
        params: context?.params,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Authentication")) {
          return NextResponse.json(
            { error: { code: "UNAUTHORIZED", message: error.message } },
            { status: 401 }
          );
        }
        if (error.message.includes("Insufficient")) {
          return NextResponse.json(
            { error: { code: "FORBIDDEN", message: error.message } },
            { status: 403 }
          );
        }
      }
      throw error;
    }
  };
}

