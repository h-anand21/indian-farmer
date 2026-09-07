import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Shield,
  Briefcase,
  Calendar,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDropdown({ isOpen, onClose }: UserDropdownProps) {
  const { user, role, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleRoleChange = (newRole: "FARMER" | "OPERATOR" | "ADMIN") => {
    switchRole(newRole);
    onClose();
    if (newRole === "FARMER") navigate({ to: "/farmer/dashboard" });
    if (newRole === "OPERATOR") navigate({ to: "/operator/dashboard" });
    if (newRole === "ADMIN") navigate({ to: "/admin/dashboard" });
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate({ to: "/login" });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] pointer-events-auto bg-black/10 backdrop-blur-[1px] md:bg-transparent">
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute top-16 right-4 md:right-8 w-[320px] bg-[#163A2D] text-white border border-emerald-500/30 rounded-2xl shadow-2xl backdrop-blur-xl p-4 flex flex-col gap-3 z-[9999]"
        >
          {/* User Profile Card Header */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-black text-lg flex items-center justify-center shadow-lg shrink-0">
              {user?.name ? user.name.slice(0, 1).toUpperCase() : "K"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                {user?.name || "Kisan User"}
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </h4>
              <p className="text-[11px] text-stone-300 truncate font-mono">
                {user?.phone ? `+91 ${user.phone.slice(-10)}` : "Verified Portal User"}
              </p>
              <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                {role || "FARMER"} ACCOUNT
              </span>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center justify-between px-1">
              <span>Switch Active Portal Role</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                onClick={() => handleRoleChange("FARMER")}
                className={`px-2 py-2 rounded-xl font-semibold border flex flex-col items-center gap-1 transition-all ${
                  role === "FARMER" || !role
                    ? "bg-emerald-500 text-stone-950 border-emerald-400 font-bold shadow-md"
                    : "bg-white/5 text-stone-300 hover:bg-white/10 border-white/10"
                }`}
              >
                <User className="w-4 h-4" />
                Farmer
              </button>

              <button
                onClick={() => handleRoleChange("OPERATOR")}
                className={`px-2 py-2 rounded-xl font-semibold border flex flex-col items-center gap-1 transition-all ${
                  role === "OPERATOR"
                    ? "bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md"
                    : "bg-white/5 text-stone-300 hover:bg-white/10 border-white/10"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Operator
              </button>

              <button
                onClick={() => handleRoleChange("ADMIN")}
                className={`px-2 py-2 rounded-xl font-semibold border flex flex-col items-center gap-1 transition-all ${
                  role === "ADMIN"
                    ? "bg-teal-400 text-stone-950 border-teal-300 font-bold shadow-md"
                    : "bg-white/5 text-stone-300 hover:bg-white/10 border-white/10"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>

          {/* Nav Shortcuts */}
          <div className="space-y-1 text-xs border-t border-white/10 pt-2">
            <button
              onClick={() => {
                onClose();
                navigate({ to: "/farmer/bookings" });
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg text-stone-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4 text-emerald-400" />
                My Bookings & QR Pass
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                navigate({ to: "/farmer/payments" });
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg text-stone-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Payments & DBT Transfers
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                navigate({ to: "/farmer/support" });
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg text-stone-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                Support & Helpline
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full mt-1 py-2 px-3 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Portal
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
