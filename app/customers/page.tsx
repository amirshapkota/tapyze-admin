"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Edit, Trash2, Eye, Users, RefreshCw, AlertCircle } from "lucide-react"
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

interface Customer {
  _id: string
  fullName: string
  email: string
  phone: string
  gender: 'Male' | 'Female' | 'Other'
  createdAt: string
  wallet?: {
    balance: number
    currency: string
  }
  rfidCards?: Array<{
    _id: string
    cardUid: string
    status: string
    isActive: boolean
  }>
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    limit: 20
  })

  const fetchCustomers = async (page = 1) => {
    try {
      setError(null)
      if (page === 1) setIsLoading(true)
      
      const response = await fetch(`/api/admin/customers?page=${page}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        // Process customers to ensure wallet data is properly handled
        const processedCustomers = (data.data.customers || []).map((customer: any) => ({
          ...customer,
          wallet: customer.wallet || { balance: 0, currency: 'NPR' },
          rfidCards: customer.rfidCards || []
        }))
        
        setCustomers(processedCustomers)
        setPagination({
          page: data.data.pagination?.page || 1,
          total: data.data.pagination?.total || 0,
          pages: data.data.pagination?.pages || 0,
          limit: data.data.pagination?.limit || 20
        })
      } else {
        throw new Error(data.message || 'Failed to fetch customers')
      }
    } catch (err) {
      console.error('Customers fetch error:', err)
      setError('Failed to load customers. Please try again.')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCustomers(pagination.page)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCustomerStatus = (customer: Customer) => {
    // Determine status based on wallet balance and RFID cards
    const hasActiveCard = customer.rfidCards?.some(card => card.isActive && card.status === 'ACTIVE')
    const hasBalance = customer.wallet && customer.wallet.balance > 0
    
    if (hasActiveCard && hasBalance) return 'active'
    if (hasActiveCard) return 'active'
    return 'inactive'
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  )

  useEffect(() => {
    fetchCustomers()
  }, [])

  if (error && customers.length === 0) {
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
              <Users className="h-6 w-6 text-primary" />
            </div>
            Customers
          </h2>
          <p className="text-muted-foreground">Manage customer accounts and information</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Customer List</CardTitle>
              <CardDescription className="mt-1">
                {isLoading ? "Loading customers..." : `${pagination.total} customers in total`}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
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
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold">Gender</TableHead>
                  <TableHead className="font-semibold">Balance</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Join Date</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => {
                    const status = getCustomerStatus(customer)
                    const activeCard = customer.rfidCards?.find(card => card.isActive && card.status === 'ACTIVE')
                    
                    return (
                      <TableRow key={customer._id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium">{customer.fullName}</TableCell>
                        <TableCell className="text-sm">{customer.email}</TableCell>
                        <TableCell className="text-sm">{customer.phone}</TableCell>
                        <TableCell className="text-sm">{customer.gender}</TableCell>
                        <TableCell className="font-medium">
                          {customer.wallet ? formatCurrency(customer.wallet.balance) : 'No Wallet'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status === "active" ? "default" : "secondary"}
                            className="font-medium"
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(customer.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit Customer</DialogTitle>
                                  <DialogDescription>Update customer information.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input id="edit-name" defaultValue={customer.fullName} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input id="edit-email" type="email" defaultValue={customer.email} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Phone</Label>
                                    <Input id="edit-phone" defaultValue={customer.phone} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-gender">Gender</Label>
                                    <Select defaultValue={customer.gender}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                  <Button variant="outline">Cancel</Button>
                                  <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No customers found matching your search." : "No customers found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>Detailed information about the selected customer.</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer ID</Label>
                  <p className="text-sm text-muted-foreground">{selectedCustomer._id.slice(-8)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gender</Label>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Balance</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.wallet ? formatCurrency(selectedCustomer.wallet.balance) : 'No Wallet'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={getCustomerStatus(selectedCustomer) === "active" ? "default" : "secondary"}
                  >
                    {getCustomerStatus(selectedCustomer)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Join Date</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedCustomer.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">RFID Cards</Label>
                  <div className="space-y-1">
                    {selectedCustomer.rfidCards && selectedCustomer.rfidCards.length > 0 ? (
                      selectedCustomer.rfidCards.map((card) => (
                        <div key={card._id} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground font-mono">{card.cardUid}</span>
                          <Badge 
                            variant={card.isActive && card.status === 'ACTIVE' ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {card.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No RFID cards assigned</p>
                    )}
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