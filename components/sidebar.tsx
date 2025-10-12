"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, LayoutDashboard, FilePlus, User, Users, ShieldCheck, Shield, Wrench } from "lucide-react"
import { useAuthPermissions } from "@/lib/auth-permissions-context"

interface SidebarProps {
  isMobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { allowedRoutes } = useAuthPermissions()

  const allItems = useMemo(
    () => [
      { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { key: "complaints", icon: FileText, label: "View Complaints", path: "/dashboard" },
      { key: "register-complaint", icon: FilePlus, label: "Register Complaint", path: "/register-complaint" },
      { key: "customers", icon: User, label: "Customer Master", path: "/masters/customers" },
      { key: "engineers", icon: Wrench, label: "Engineer Master", path: "/masters/engineers" },
      { key: "users", icon: Users, label: "User Master", path: "/masters/users" },
      { key: "role-mapping", icon: Shield, label: "User Role Mapping", path: "/masters/role-mapping" },
      {
        key: "permission-mapping",
        icon: ShieldCheck,
        label: "Role Permission Mapping",
        path: "/masters/permission-mapping",
      },
      { key: "profile", icon: User, label: "Profile", path: "/profile" },
    ],
    [],
  )

  const menuItems = useMemo(
    () => allItems.filter((it) => allowedRoutes.includes(it.key as any)),
    [allowedRoutes, allItems],
  )

  useEffect(() => {
    if (isMobileOpen && onClose) {
      onClose()
    }
  }, [pathname])

  const DesktopSidebar = () => (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: isHovered ? 220 : 60 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hidden lg:block fixed left-0 top-[60px] bottom-0 bg-[#0d3b66] text-white overflow-hidden z-40"
    >
      <nav className="flex-1 p-3 pt-6">
        {menuItems.map((item) => (
          <motion.button
           key={`${item.key}-${item.path}`}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.2)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors mb-2 ${
              pathname === item.path ? "bg-white/20" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="font-medium whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          </motion.button>
        ))}
      </nav>
    </motion.aside>
  )

  const MobileSidebar = () => (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-black/50 z-40 top-[60px]"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-[60px] bottom-0 w-64 bg-[#0d3b66] text-white z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-semibold text-lg">Menu</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <motion.svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </motion.svg>
              </button>
            </div>

            <nav className="p-4">
              {menuItems.map((item) => (
                <motion.button
                 key={item.key}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-2 ${
                    pathname === item.path ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  )
}
