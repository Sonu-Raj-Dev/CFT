"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Complaint } from "@/lib/types"

interface ComplaintTableProps {
  complaints: Complaint[]
  onRowClick: (complaint: Complaint) => void
  onEdit: (complaint: Complaint) => void
  onDelete: (complaintId: string) => void
  onStatusChange?: (complaintId: string, newStatus: string) => void
}

export default function ComplaintTable({ 
  complaints, 
  onRowClick, 
  onEdit, 
  onDelete,
  onStatusChange 
}: ComplaintTableProps) {
  console.log("complaints",complaints);
  
  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'default'
      case 'assigned':
        return 'secondary'
      case 'completed':
        return 'destructive'
      default:
        return 'default'
    }
  }

 const isDefaultDate = (dateString: string | null | undefined): boolean => {
    if (!dateString) return true;
    
    // Check for common default date patterns
    const defaultPatterns = [
      /^0001-01-01/, // SQL Server minimum date
      /^1\/01\/01/, // Your specified format
      /^1970-01-01/, // Unix epoch
      /^0000-00-00/, // MySQL zero date
      /^1900-01-01/, // Another common default
    ];
    
    return defaultPatterns.some(pattern => pattern.test(dateString));
  }
  // Function to format with time (YYYY/MM/DD HH:MM)
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || isDefaultDate(dateString)) return '-';
    
    try {
      const date = new Date(dateString);
      // Additional check for invalid dates
      if (isNaN(date.getTime())) return '-';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  }



  // Function to get relative time (e.g., "2 days ago")
  // const getRelativeTime = (dateString: string | null | undefined) => {
  //   if (!dateString) return '-';
    
  //   try {
  //     const date = new Date(dateString);
  //     const now = new Date();
  //     const diffInMs = now.getTime() - date.getTime();
  //     const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
  //     if (diffInDays === 0) {
  //       const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  //       if (diffInHours === 0) {
  //         const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  //         return `${diffInMinutes} min ago`;
  //       }
  //       return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  //     } else if (diffInDays === 1) {
  //       return 'Yesterday';
  //     } else if (diffInDays < 7) {
  //       return `${diffInDays} days ago`;
  //     } else {
  //       return formatDate(dateString);
  //     }
  //   } catch (error) {
  //     return '-';
  //   }
  // }

  const handleDelete = (e: React.MouseEvent, complaintId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this complaint?')) {
      onDelete(complaintId)
    }
  }

  const handleEdit = (e: React.MouseEvent, complaint: Complaint) => {
    e.stopPropagation()
    onEdit(complaint)
  }

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
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Nature of Complaint</TableHead>
                    <TableHead className="font-semibold">Assigned Engineer</TableHead>
                    <TableHead className="font-semibold">Complaint Created At</TableHead>
                    <TableHead className="font-semibold">Engineer Assigned At</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints?.map((complaint, index) => (
                    <motion.tr
                      key={complaint.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => onRowClick(complaint)}
                      className="cursor-pointer hover:bg-blue-50 transition-all border-b"
                      whileHover={{ scale: 1.01, boxShadow: "0 4px 16px rgba(13, 59, 102, 0.15)" }}
                    >
                      <TableCell className="font-medium">{complaint?.customerName}</TableCell>
                      <TableCell className="max-w-xs truncate">{complaint.complaintdetails}</TableCell>
                      <TableCell>{complaint.mobileNumber}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(complaint.statusName)} className="capitalize">
                          {complaint.statusName || ' '}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {complaint.natureOfComplaint}
                        </span>
                      </TableCell>
                      <TableCell>{complaint.assignedEngineer || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{formatDate(complaint.createdDate)}</span>
                          {/* <span className="text-xs text-muted-foreground">
                            {formatDate(complaint.createdDate)}
                          </span> */}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{formatDate(complaint.assignmentDate)}</span>
                          {/* <span className="text-xs text-muted-foreground">
                            {formatDate(complaint.assignmentDate)}
                          </span> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => handleEdit(e, complaint)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => handleDelete(e, complaint.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {complaints?.map((complaint, index) => (
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
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusVariant(complaint.statusName)} className="capitalize">
                          {complaint.statusName || 'Open'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => handleEdit(e, complaint)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => handleDelete(e, complaint.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                        <span className="text-muted-foreground">Nature:</span>
                        <span className="ml-2 font-medium">{complaint.natureOfComplaint}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Engineer:</span>
                        <span className="ml-2 font-medium">{complaint.assignedEngineer || 'Not assigned'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2 font-medium">{formatDate(complaint.createdDate)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assigned At:</span>
                        <span className="ml-2 font-medium">{formatDate(complaint.assignmentDate) || 'Not assigned'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Details:</span>
                        <p className="mt-1 text-muted-foreground line-clamp-2">{complaint.complaintdetails}</p>
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