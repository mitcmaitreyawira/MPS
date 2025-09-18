import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheckIcon, ArrowRightOnRectangleIcon } from '../../assets/icons';
import { UserRole } from '../../types';
import NotificationBell from '../../features/shared/NotificationBell';

type RoleLike = string | null | undefined;

/**
 * Normalize a role value into a presentable label.
 * - Supports single `role` string or first item from `roles` array.
 * - Replaces underscores with spaces and uppercases for readability.
 */
function useRoleLabel(user: any): { label: string; isDanger: boolean } {
  return useMemo(() => {
    if (!user) return { label: 'GUEST', isDanger: false };

    // Prefer array-based roles if present and non-empty
    const roleFromArray: RoleLike =
      Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : null;

    const roleRaw: RoleLike = roleFromArray ?? (user.role as RoleLike) ?? 'guest';

    const roleStr = String(roleRaw);
    const isDanger = roleStr === UserRole.SUPER_SECRET_ADMIN;

    const label = roleStr.replace(/_/g, ' ').toUpperCase(); // e.g. SUPER_SECRET_ADMIN -> SUPER SECRET ADMIN
    return { label, isDanger };
  }, [user]);
}

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { label: roleLabel, isDanger } = useRoleLabel(user);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-3">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <img src="/asset/Main_Statics_Things_eyak/MW_LOGO.webp" alt="MW Logo" className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <span className="text-base sm:text-xl lg:text-2xl font-bold text-text-primary line-clamp-3 leading-tight max-w-[200px] sm:max-w-none">Maitreyawira Point System (MPS)</span>
          </div>

          {/* Right side */}
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right px-2">
                <p className="text-sm font-medium text-text-primary truncate max-w-32 sm:max-w-none">
                  {user.nisn ?? 'N/A'}
                </p>

                {/* Role line (hidden on very small screens) */}
                <p className="hidden sm:block text-xs text-text-secondary capitalize">
                  {isDanger ? (
                    <span className="text-danger font-bold">** {roleLabel} **</span>
                  ) : (
                    roleLabel
                  )}
                </p>
              </div>

              {/* Notifications (auth-only) */}
              <div className="flex-shrink-0">
                <NotificationBell />
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 rounded-full text-text-secondary hover:bg-blue-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary transition-colors duration-200 flex-shrink-0"
                aria-label="Logout"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          ) : (
            // Unauthenticated header actions
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline text-xs text-text-secondary font-medium">GUEST</span>
              <Link
                to="/login"
                className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
