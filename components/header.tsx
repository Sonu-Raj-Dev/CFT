"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, Menu } from "lucide-react"
import { motion } from "framer-motion"

interface HeaderProps {
  user: { name: string; email: string } | null
  onMenuClick?: () => void
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("cft_user")
    router.push("/login")
  }

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 h-[60px] bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg z-50"
    >
      <div className="flex items-center justify-between px-4 md:px-6 h-full">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-bold text-lg">CFT</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold hidden sm:block">CFT Complaint Management System</h2>
          <h2 className="text-lg font-bold sm:hidden">CFT System</h2>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
            <User className="h-5 w-5" />
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-white/80 text-xs">{user?.email}</p>
            </div>
          </div>

          <div className="md:hidden p-2 bg-white/10 backdrop-blur-sm rounded-lg">
            <User className="h-5 w-5" />
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2 border-white/30 text-white hover:bg-white/20 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
