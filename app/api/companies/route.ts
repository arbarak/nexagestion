import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { ErrorCodes, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const prisma = new PrismaClient();

const createCompanySchema = z.object({
  groupId: z.string(),
  name: z.string().min(1),
  code: z.string().min(1),
  ice: z.string().optional(),
  if: z.string().optional(),
  rc: z.string().optional(),
  patente: z.string().optional(),
  cnss: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw ErrorCodes.UNAUTHORIZED();
    }

    const companies = await prisma.company.findMany({
      where: {
        users: {
          some: {
            id: session.userId,
          },
        },
      },
    });

    return NextResponse.json({ data: companies });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw ErrorCodes.UNAUTHORIZED();
    }

    if (session.role !== "ADMIN") {
      throw ErrorCodes.FORBIDDEN();
    }

    const body = await request.json();
    const data = createCompanySchema.parse(body);

    const company = await prisma.company.create({
      data,
    });

    return NextResponse.json({ data: company }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

