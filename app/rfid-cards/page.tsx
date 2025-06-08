"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, Edit, Trash2, CreditCard, RefreshCw, AlertCircle } from "lucide-react"
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

interface RfidCard {
  _id: string
  cardUid: string
  status: 'ACTIVE' | 'INACTIVE' | 'LOST' | 'EXPIRED' | 'PENDING_ACTIVATION' | 'PIN_LOCKED'
  isActive: boolean
  owner?: {
    _id: string
    fullName: string
    email: string
  }
  issuedAt: string
  expiryDate: string
  lastUsed?: string
}

interface Customer {
  _id: string
  fullName: string
  email: string
  rfidCards?: Array<{
    _id: string
    cardUid: string
    status: string
    isActive: boolean
  }>
}

export default function RfidCardsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [cards, setCards] = useState<RfidCard[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customersWithoutCards, setCustomersWithoutCards] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    limit: 20
  })

  // Create card form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    cardUid: "",
    pin: "",
    expiryDate: "",
    customerId: "unassigned"
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")

  const fetchCards = async (page = 1) => {
    try {
      setError(null)
      if (page === 1) setIsLoading(true)
      
      const response = await fetch(`/api/admin/rfid-cards?page=${page}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch RFID cards')
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setCards(data.data.cards || [])
        setPagination({
          page: data.data.pagination?.page || 1,
          total: data.data.pagination?.total || 0,
          pages: data.data.pagination?.pages || 0,
          limit: data.data.pagination?.limit || 20
        })
      } else {
        throw new Error(data.message || 'Failed to fetch RFID cards')
      }
    } catch (err) {
      console.error('RFID cards fetch error:', err)
      setError('Failed to load RFID cards. Please try again.')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers?limit=100')
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'success') {
          const allCustomers = data.data.customers || []
          setCustomers(allCustomers)
          
          // Filter customers who don't have any active RFID cards
          const customersWithoutActiveCards = allCustomers.filter((customer: Customer) => {
            return !customer.rfidCards || 
                   customer.rfidCards.length === 0 || 
                   !customer.rfidCards.some((card: any) => card.isActive && card.status === 'ACTIVE')
          })
          setCustomersWithoutCards(customersWithoutActiveCards)
        }
      }
    } catch (err) {
      console.error('Customers fetch error:', err)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchCards(pagination.page), fetchCustomers()])
  }

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    
    if (!createFormData.cardUid) {
      setCreateError("Card UID is required")
      return
    }
    
    if (!createFormData.pin || !/^\d{4,6}$/.test(createFormData.pin)) {
      setCreateError("PIN must be 4-6 digits")
      return
    }
    
    if (!createFormData.expiryDate) {
      setCreateError("Expiry date is required")
      return
    }
    
    setCreateLoading(true)
    
    try {
      const payload: any = {
        cardUid: createFormData.cardUid,
        pin: createFormData.pin,
        expiryDate: createFormData.expiryDate
      }
      
      // If a customer is selected, include it in the payload
      if (createFormData.customerId !== "unassigned") {
        payload.customerId = createFormData.customerId
      }
      
      const response = await fetch('/api/admin/rfid-cards/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsCreateDialogOpen(false)
        setCreateFormData({
          cardUid: "",
          pin: "",
          expiryDate: "",
          customerId: "unassigned"
        })
        await Promise.all([fetchCards(1), fetchCustomers()]) // Refresh both lists
      } else {
        setCreateError(data.message || 'Failed to create RFID card')
      }
    } catch (error) {
      setCreateError('An error occurred while creating the RFID card')
    } finally {
      setCreateLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'INACTIVE':
      case 'PENDING_ACTIVATION':
        return 'secondary'
      case 'LOST':
      case 'EXPIRED':
      case 'PIN_LOCKED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const isCardExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const filteredCards = cards.filter(
    (card) =>
      card.cardUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.owner?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchCards()
    fetchCustomers()
  }, [])

  if (error && cards.length === 0) {
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
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            RFID Cards
          </h2>
          <p className="text-muted-foreground">Manage RFID cards and customer assignments</p>
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add RFID Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New RFID Card</DialogTitle>
                <DialogDescription>Register a new RFID card and assign to customer.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCard}>
                <div className="grid gap-4 py-4">
                  {createError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{createError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="card-uid">Card UID</Label>
                    <Input 
                      id="card-uid" 
                      placeholder="04:XX:XX:XX:XX:XX:XX"
                      value={createFormData.cardUid}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, cardUid: e.target.value }))}
                      required
                      disabled={createLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN (4-6 digits)</Label>
                    <Input 
                      id="pin" 
                      type="password" 
                      placeholder="Enter 4-6 digit PIN" 
                      maxLength={6}
                      value={createFormData.pin}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                      required
                      disabled={createLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input 
                      id="expiry-date" 
                      type="date"
                      value={createFormData.expiryDate}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      required
                      disabled={createLoading}
                      min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assign-customer">Assign to Customer</Label>
                    <Select 
                      value={createFormData.customerId} 
                      onValueChange={(value) => setCreateFormData(prev => ({ ...prev, customerId: value }))}
                      disabled={createLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer without active card" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Leave Unassigned</SelectItem>
                        {customersWithoutCards.length > 0 ? (
                          customersWithoutCards.map((customer) => (
                            <SelectItem key={customer._id} value={customer._id}>
                              {customer.fullName} - {customer.email}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-customers" disabled>
                            All customers already have active cards
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {customersWithoutCards.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        All customers currently have active RFID cards assigned.
                      </p>
                    )}
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
                    {createLoading ? "Creating..." : "Create Card"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">RFID Card List</CardTitle>
              <CardDescription className="mt-1">
                {isLoading ? "Loading cards..." : `${pagination.total} RFID cards in total`}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cards..."
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
                  <TableHead className="font-semibold">Card UID</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Assigned To</TableHead>
                  <TableHead className="font-semibold">Issue Date</TableHead>
                  <TableHead className="font-semibold">Expiry Date</TableHead>
                  <TableHead className="font-semibold">Last Used</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredCards.length > 0 ? (
                  filteredCards.map((card) => {
                    const expired = isCardExpired(card.expiryDate)
                    
                    return (
                      <TableRow key={card._id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium font-mono">{card.cardUid}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getStatusBadgeVariant(card.status)}
                              className="font-medium"
                            >
                              {card.status.replace('_', ' ').toLowerCase()}
                            </Badge>
                            {expired && card.status === 'ACTIVE' && (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {card.owner ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <div className="font-medium">{card.owner.fullName}</div>
                                <div className="text-xs text-muted-foreground">{card.owner.email}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(card.issuedAt)}</TableCell>
                        <TableCell className="text-sm">
                          <span className={expired ? "text-red-600 font-medium" : ""}>
                            {formatDate(card.expiryDate)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {card.lastUsed ? formatDate(card.lastUsed) : 
                           <span className="text-muted-foreground">Never</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit RFID Card</DialogTitle>
                                  <DialogDescription>Update RFID card information.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-card-uid">Card UID</Label>
                                    <Input id="edit-card-uid" defaultValue={card.cardUid} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-expiry-date">Expiry Date</Label>
                                    <Input 
                                      id="edit-expiry-date" 
                                      type="date" 
                                      defaultValue={card.expiryDate.split('T')[0]} 
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-card-status">Status</Label>
                                    <Select defaultValue={card.status}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        <SelectItem value="LOST">Lost</SelectItem>
                                        <SelectItem value="EXPIRED">Expired</SelectItem>
                                        <SelectItem value="PENDING_ACTIVATION">Pending Activation</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-assign-customer">Assigned Customer</Label>
                                    <Select defaultValue={card.owner?._id || "unassigned"}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {customers.map((customer) => (
                                          <SelectItem key={customer._id} value={customer._id}>
                                            {customer.fullName} - {customer.email}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {card.status === 'PIN_LOCKED' && (
                                    <div className="space-y-2">
                                      <Label>PIN Management</Label>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                          Reset PIN
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1">
                                          Unlock Card
                                        </Button>
                                      </div>
                                    </div>
                                  )}
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No RFID cards found matching your search." : "No RFID cards found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {cards.filter(card => card.status === 'ACTIVE').length}
            </div>
            <p className="text-sm text-muted-foreground">Active Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {cards.filter(card => !card.owner).length}
            </div>
            <p className="text-sm text-muted-foreground">Unassigned Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {customersWithoutCards.length}
            </div>
            <p className="text-sm text-muted-foreground">Customers Without Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {cards.filter(card => isCardExpired(card.expiryDate)).length}
            </div>
            <p className="text-sm text-muted-foreground">Expired Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {cards.filter(card => card.status === 'PIN_LOCKED').length}
            </div>
            <p className="text-sm text-muted-foreground">PIN Locked</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}