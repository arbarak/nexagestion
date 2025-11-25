import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: any;
  }

  interface User extends DefaultUser {
    [key: string]: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    [key: string]: any;
  }
}
