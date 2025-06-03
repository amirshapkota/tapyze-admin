"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Eye, UserCog, Shield } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const admins = [
  {
    id: "ADM001",
    name: "Super Admin",
    email: "admin@tapyze.com",
    phone: "+1 234 567 0001",
    role: "super_admin",
    status: "active",
    lastLogin: "2024-03-15 20:30:00",
    createdDate: "2024-01-01",
    permissions: ["all"],
  },
  {
    id: "ADM002",
    name: "John Manager",
    email: "john.manager@tapyze.com",
    phone: "+1 234 567 0002",
    role: "manager",
    status: "active",
    lastLogin: "2024-03-15 18:45:00",
    createdDate: "2024-01-15",
    permissions: ["customers", "merchants", "transactions"],
  },
  {
    id: "ADM003",
    name: "Sarah Support",
    email: "sarah.support@tapyze.com",
    phone: "+1 234 567 0003",
    role: "support",
    status: "active",
    lastLogin: "2024-03-15 16:20:00",
    createdDate: "2024-02-01",
    permissions: ["customers", "rfid_cards"],
  },
  {
    id: "ADM004",
    name: "Mike Analyst",
    email: "mike.analyst@tapyze.com",
    phone: "+1 234 567 0004",
    role: "analyst",
    status: "inactive",
    lastLogin: "2024-03-10 14:15:00",
    createdDate: "2024-02-15",
    permissions: ["transactions", "reports"],
  },
  {
    id: "ADM005",
    name: "Lisa Tech",
    email: "lisa.tech@tapyze.com",
    phone: "+1 234 567 0005",
    role: "technical",
    status: "active",
    lastLogin: "2024-03-15 19:00:00",
    createdDate: "2024-03-01",
    permissions: ["nfc_scanners", "rfid_cards", "system"],
  },
]

export default function AdminsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAdmin, setSelectedAdmin] = useState<(typeof admins)[0] | null>(null)

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "support":
        return "bg-green-100 text-green-800"
      case "analyst":
        return "bg-purple-100 text-purple-800"
      case "technical":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserCog className="h-6 w-6 text-primary" />
            </div>
            Administrators
          </h2>
          <p className="text-muted-foreground">Manage admin accounts and permissions</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Administrator</DialogTitle>
              <DialogDescription>Create a new admin account with specific permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Full Name</Label>
                <Input id="admin-name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" placeholder="admin@tapyze.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input id="admin-password" type="password" placeholder="Enter password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                <Input id="admin-confirm-password" type="password" placeholder="Confirm password" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Create Admin</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Administrator List</CardTitle>
              <CardDescription className="mt-1">
                Manage all administrators with their roles and permissions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search administrators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">Admin ID</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Last Login</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium">{admin.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium">{admin.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{admin.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(admin.role)}>{admin.role.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.status === "active" ? "default" : "secondary"} className="font-medium">
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{admin.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedAdmin(admin)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {admin.role !== "super_admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Admin Details Dialog */}
      <Dialog open={!!selectedAdmin} onOpenChange={() => setSelectedAdmin(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Administrator Details</DialogTitle>
            <DialogDescription>Detailed information about the selected administrator.</DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Admin ID</Label>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <Badge className={getRoleColor(selectedAdmin.role)}>{selectedAdmin.role.replace("_", " ")}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedAdmin.status === "active" ? "default" : "secondary"}>
                    {selectedAdmin.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.createdDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Login</Label>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.lastLogin}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAdmin.permissions.map((permission) => (
                      <Badge key={permission} variant="outline">
                        {permission === "all" ? "All Permissions" : permission.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
