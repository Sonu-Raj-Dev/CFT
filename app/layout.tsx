import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ComplaintProvider } from "@/lib/complaint-context"
import { MasterDataProvider } from "@/lib/master-data-context"
import { AuthPermissionsProvider } from "@/lib/auth-permissions-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "CFT Service - Complaint Management",
  description: "Manage customer complaints efficiently",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <MasterDataProvider>
          <AuthPermissionsProvider>
            <ComplaintProvider>{children}</ComplaintProvider>
          </AuthPermissionsProvider>
        </MasterDataProvider>
      </body>
    </html>
  )
}
