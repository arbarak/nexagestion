import { PrismaClient } from "@prisma/client";

declare module "@prisma/client" {
  interface PrismaClient {
    [key: string]: any;
  }
}
