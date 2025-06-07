"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, Edit, Trash2, Eye, UserCog, Shield, RefreshCw, AlertCircle } from "lucide-react"
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
import { useAuth } from "@/contexts/AuthContext"

interface Admin {
  _id: string
  fullName: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER'
  isActive: boolean
  createdAt: string
}

export default function AdminsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN" as 'ADMIN' | 'MANAGER'
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")

  const { admin: currentAdmin } = useAuth()

  const fetchAdmins = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await fetch('/api/admin/admins')
      
      if (!response.ok) {
        throw new Error('Failed to fetch administrators')
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setAdmins(data.data.admins || [])
      } else {
        throw new Error(data.message || 'Failed to fetch administrators')
      }
    } catch (err) {
      console.error('Admins fetch error:', err)
      setError('Failed to load administrators. Please try again.')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAdmins()
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    
    if (createFormData.password !== createFormData.confirmPassword) {
      setCreateError("Passwords do not match")
      return
    }
    
    if (createFormData.password.length < 8) {
      setCreateError("Password must be at least 8 characters")
      return
    }
    
    setCreateLoading(true)
    
    try {
      const response = await fetch('/api/auth/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: createFormData.fullName,
          email: createFormData.email,
          password: createFormData.password,
          confirmPassword: createFormData.confirmPassword,
          role: createFormData.role
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsCreateDialogOpen(false)
        setCreateFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "ADMIN"
        })
        await fetchAdmins() // Refresh the list
      } else {
        setCreateError(data.message || 'Failed to create admin')
      }
    } catch (error) {
      setCreateError('An error occurred while creating admin')
    } finally {
      setCreateLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800 border-red-200"
      case "ADMIN":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "MANAGER":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin"
      case "ADMIN":
        return "Admin"
      case "MANAGER":
        return "Manager"
      default:
        return role
    }
  }

  const canCreateAdmin = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'ADMIN'
  const canManageAdmins = currentAdmin?.role === 'SUPER_ADMIN'

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchAdmins()
  }, [])

  if (error && admins.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Retry"}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {canCreateAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                <form onSubmit={handleCreateAdmin}>
                  <div className="grid gap-4 py-4">
                    {createError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{createError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">Full Name</Label>
                      <Input 
                        id="admin-name" 
                        placeholder="Enter full name"
                        value={createFormData.fullName}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                        disabled={createLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <Input 
                        id="admin-email" 
                        type="email" 
                        placeholder="admin@tapyze.com"
                        value={createFormData.email}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={createLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-role">Role</Label>
                      <Select 
                        value={createFormData.role} 
                        onValueChange={(value: 'ADMIN' | 'MANAGER') => 
                          setCreateFormData(prev => ({ ...prev, role: value }))
                        }
                        disabled={createLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          {currentAdmin?.role === 'SUPER_ADMIN' && (
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input 
                        id="admin-password" 
                        type="password" 
                        placeholder="Enter password (min 8 characters)"
                        value={createFormData.password}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={8}
                        disabled={createLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                      <Input 
                        id="admin-confirm-password" 
                        type="password" 
                        placeholder="Confirm password"
                        value={createFormData.confirmPassword}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        disabled={createLoading}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={createLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90"
                      disabled={createLoading}
                    >
                      {createLoading ? "Creating..." : "Create Admin"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Administrator List</CardTitle>
              <CardDescription className="mt-1">
                {isLoading ? "Loading administrators..." : `${admins.length} administrators in total`}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search administrators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 w-64"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Created Date</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin._id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-medium">{admin.fullName}</span>
                          {admin._id === currentAdmin?._id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{admin.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(admin.role)}>
                          {getRoleDisplayName(admin.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={admin.isActive ? "default" : "secondary"} 
                          className="font-medium"
                        >
                          {admin.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(admin.createdAt)}</TableCell>
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
                          {canManageAdmins && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canManageAdmins && admin.role !== "SUPER_ADMIN" && admin._id !== currentAdmin?._id && (
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No administrators found matching your search." : "No administrators found."}
                    </TableCell>
                  </TableRow>
                )}
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
                  <p className="text-sm text-muted-foreground font-mono">{selectedAdmin._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <Badge className={getRoleColor(selectedAdmin.role)}>
                    {getRoleDisplayName(selectedAdmin.role)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedAdmin.isActive ? "default" : "secondary"}>
                    {selectedAdmin.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedAdmin.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Role Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAdmin.role === 'SUPER_ADMIN' && (
                      <Badge variant="outline">All System Permissions</Badge>
                    )}
                    {selectedAdmin.role === 'ADMIN' && (
                      <>
                        <Badge variant="outline">User Management</Badge>
                        <Badge variant="outline">Transaction Management</Badge>
                        <Badge variant="outline">Device Management</Badge>
                        <Badge variant="outline">Reports & Analytics</Badge>
                      </>
                    )}
                    {selectedAdmin.role === 'MANAGER' && (
                      <>
                        <Badge variant="outline">User Management</Badge>
                        <Badge variant="outline">Transaction Monitoring</Badge>
                        <Badge variant="outline">Basic Reports</Badge>
                      </>
                    )}
                  </div>
                </div>
                {selectedAdmin._id === currentAdmin?._id && (
                  <div className="col-span-2">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        This is your current admin account.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}