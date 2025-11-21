import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAccountSchema = z.object({
  groupId: z.string(),
  companyId: z.string(),
  accountCode: z.string(),
  accountName: z.string(),
  accountType: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  balance: z.number(),
  currency: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "FINANCIAL", "READ");

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      throw ErrorCodes.VALIDATION_ERROR("companyId is required");
    }

    const accounts = await prisma.account.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: accounts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "FINANCIAL", "CREATE");

    const body = await request.json();
    const data = createAccountSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check account code uniqueness
    const existingAccount = await prisma.account.findFirst({
      where: {
        companyId: data.companyId,
        accountCode: data.accountCode,
      },
    });

    if (existingAccount) {
      throw ErrorCodes.CONFLICT("Account code already exists");
    }

    const account = await prisma.account.create({
      data: {
        groupId: data.groupId,
        companyId: data.companyId,
        accountCode: data.accountCode,
        accountName: data.accountName,
        accountType: data.accountType,
        balance: data.balance,
        currency: data.currency,
        status: data.status,
      },
    });

    return NextResponse.json({ data: account }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

