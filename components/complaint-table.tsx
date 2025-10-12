"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Complaint } from "@/lib/types"

interface ComplaintTableProps {
  complaints: Complaint[]
  onRowClick: (complaint: Complaint) => void
}

export default function ComplaintTable({ complaints, onRowClick }: ComplaintTableProps) {
  return (
    <div className="p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-bold">Customer Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="hidden md:block rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Customer Name</TableHead>
                    <TableHead className="font-semibold">Complaint Details</TableHead>
                    <TableHead className="font-semibold">Mobile Number</TableHead>
                    <TableHead className="font-semibold">Address</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Nature of Complaint</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints?.data?.map((complaint, index) => (
                    <motion.tr
                      key={complaint.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => onRowClick(complaint)}
                      className="cursor-pointer hover:bg-blue-50 transition-all border-b"
                      whileHover={{ scale: 1.01, boxShadow: "0 4px 16px rgba(13, 59, 102, 0.15)" }}
                    >
                      <TableCell className="font-medium">{complaint.customerName}</TableCell>
                      <TableCell className="max-w-xs truncate">{complaint.complaintDetails}</TableCell>
                      <TableCell>{complaint.mobileNumber}</TableCell>
                      <TableCell className="max-w-xs truncate">{complaint.address}</TableCell>
                      <TableCell>{complaint.email}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {complaint.natureOfComplaint}
                        </span>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="md:hidden space-y-4">
              {complaints?.data?.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => onRowClick(complaint)}
                  className="bg-white rounded-lg border p-4 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{complaint.customerName}</h3>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {complaint.natureOfComplaint}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mobile:</span>
                        <span className="ml-2 font-medium">{complaint.mobileNumber}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2 font-medium">{complaint.email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Address:</span>
                        <span className="ml-2">{complaint.address}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Details:</span>
                        <p className="mt-1 text-muted-foreground line-clamp-2">{complaint.complaintDetails}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
