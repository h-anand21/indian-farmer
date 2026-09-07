import { Request, Response, NextFunction } from "express";

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to users with specific roles.
 *
 * Usage:
 *   router.get("/admin/dashboard", authMiddleware, roleGuard("ADMIN"), handler);
 *   router.get("/operator/queue", authMiddleware, roleGuard("OPERATOR", "ADMIN"), handler);
 */
export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole) {
      res.status(403).json({
        success: false,
        error: "Forbidden: No role assigned",
        message: "Your account does not have a role assigned. Contact support.",
      });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: "Forbidden: Insufficient permissions",
        message: `This resource requires one of the following roles: ${allowedRoles.join(", ")}. Your role: ${userRole}`,
      });
      return;
    }

    next();
  };
}
