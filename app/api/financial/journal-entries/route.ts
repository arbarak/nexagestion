import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createJournalEntrySchema = z.object({
  groupId: z.string(),
  companyId: z.string(),
  entryDate: z.string(),
  description: z.string(),
  reference: z.string(),
  entries: z.array(
    z.object({
      accountId: z.string(),
      debit: z.number(),
      credit: z.number(),
    })
  ),
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

    const entries = await prisma.journalEntry.findMany({
      where: { companyId },
      include: { items: true },
      orderBy: { entryDate: "desc" },
    });

    return NextResponse.json({ data: entries });
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
    const data = createJournalEntrySchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Validate debit/credit balance
    const totalDebit = data.entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = data.entries.reduce((sum, e) => sum + e.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw ErrorCodes.VALIDATION_ERROR("Debit and credit must balance");
    }

    const entry = await prisma.journalEntry.create({
      data: {
        groupId: data.groupId,
        companyId: data.companyId,
        entryDate: new Date(data.entryDate),
        description: data.description,
        reference: data.reference,
        items: {
          create: data.entries,
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

