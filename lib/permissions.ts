import { SessionPayload } from "@/lib/auth";
import { canAccess, Resource, Action } from "@/lib/rbac";
import { ErrorCodes } from "@/lib/api-error";

export function checkPermission(
  session: SessionPayload,
  resource: Resource,
  action: Action
): void {
  if (!canAccess(session.role as any, resource, action)) {
    throw ErrorCodes.FORBIDDEN(
      `You don't have permission to ${action.toLowerCase()} ${resource.toLowerCase()}`
    );
  }
}

export function hasPermission(
  session: SessionPayload,
  resource: Resource,
  action: Action
): boolean {
  return canAccess(session.role as any, resource, action);
}

export function checkCompanyAccess(
  session: SessionPayload,
  companyId: string
): void {
  // If user has a specific company assigned, check if they're accessing their own company
  if (session.companyId && session.companyId !== companyId) {
    throw ErrorCodes.FORBIDDEN("You don't have access to this company");
  }
}

export function checkGroupAccess(
  session: SessionPayload,
  groupId: string
): void {
  // Admin can access any group
  if (session.role === "ADMIN") {
    return;
  }

  // Other roles need to be verified against their assigned group
  // This would typically be checked against the user's company's group
  throw ErrorCodes.FORBIDDEN("You don't have access to this group");
}

