"use client"

import { motion } from "framer-motion"

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-slate-100 border-t border-slate-200 py-4 px-6 text-center text-sm text-slate-600"
    >
      <p>© 2025 CFT Complaint Management System</p>
    </motion.footer>
  )
}
