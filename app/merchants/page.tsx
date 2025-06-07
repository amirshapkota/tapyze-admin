"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Edit, Trash2, Eye, Store, RefreshCw, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Merchant {
  _id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  businessAddress: string
  businessType: string
  createdAt: string
  wallet?: {
    balance: number
    currency: string
  }
  nfcScanners?: Array<{
    _id: string
    deviceId: string
    status: string
    isActive: boolean
    model?: string
  }>
}

export default function MerchantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    limit: 20
  })

  const fetchMerchants = async (page = 1) => {
    try {
      setError(null)
      if (page === 1) setIsLoading(true)
      
      const response = await fetch(`/api/admin/merchants?page=${page}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch merchants')
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        // Process merchants to ensure wallet data is properly handled
        const processedMerchants = (data.data.merchants || []).map((merchant: any) => ({
          ...merchant,
          wallet: merchant.wallet || { balance: 0, currency: 'NPR' },
          nfcScanners: merchant.nfcScanners || []
        }))
        
        setMerchants(processedMerchants)
        setPagination({
          page: data.data.pagination?.page || 1,
          total: data.data.pagination?.total || 0,
          pages: data.data.pagination?.pages || 0,
          limit: data.data.pagination?.limit || 20
        })
      } else {
        throw new Error(data.message || 'Failed to fetch merchants')
      }
    } catch (err) {
      console.error('Merchants fetch error:', err)
      setError('Failed to load merchants. Please try again.')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMerchants(pagination.page)
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

  const getMerchantStatus = (merchant: Merchant) => {
    // Determine status based on NFC scanners and activity
    const hasActiveScanner = merchant.nfcScanners?.some(scanner => 
      scanner.isActive && (scanner.status === 'ONLINE' || scanner.status === 'OFFLINE')
    )
    
    if (hasActiveScanner) return 'active'
    if (merchant.nfcScanners && merchant.nfcScanners.length > 0) return 'pending'
    return 'inactive'
  }

  const getActiveScanners = (merchant: Merchant) => {
    return merchant.nfcScanners?.filter(scanner => scanner.isActive) || []
  }

  const filteredMerchants = merchants.filter(
    (merchant) =>
      merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.businessType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchMerchants()
  }, [])

  if (error && merchants.length === 0) {
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            Merchants
          </h2>
          <p className="text-muted-foreground">Manage merchant accounts and partnerships</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Merchant List</CardTitle>
          <CardDescription>
            {isLoading ? "Loading merchants..." : `${pagination.total} merchants registered in your system.`}
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              disabled={isLoading}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Business Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>NFC Scanners</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => {
                  const status = getMerchantStatus(merchant)
                  const activeScanners = getActiveScanners(merchant)
                  
                  return (
                    <TableRow key={merchant._id}>
                      <TableCell className="font-medium">{merchant.businessName}</TableCell>
                      <TableCell>{merchant.ownerName}</TableCell>
                      <TableCell>{merchant.businessType}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{merchant.email}</p>
                          <p className="text-xs text-muted-foreground">{merchant.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {merchant.wallet ? formatCurrency(merchant.wallet.balance) : 'No Wallet'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "active"
                              ? "default"
                              : status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {activeScanners.length > 0 ? (
                          <div className="space-y-1">
                            {activeScanners.slice(0, 2).map((scanner) => (
                              <Badge 
                                key={scanner._id} 
                                variant="outline" 
                                className="text-xs font-mono block"
                              >
                                {scanner.deviceId}
                              </Badge>
                            ))}
                            {activeScanners.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{activeScanners.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedMerchant(merchant)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Merchant</DialogTitle>
                                <DialogDescription>Update merchant information.</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select defaultValue={status}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-address">Business Address</Label>
                                  <Textarea id="edit-address" defaultValue={merchant.businessAddress} />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancel</Button>
                                <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm">
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
                    {searchTerm ? "No merchants found matching your search." : "No merchants found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Merchant Details Dialog */}
      <Dialog open={!!selectedMerchant} onOpenChange={() => setSelectedMerchant(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Merchant Details</DialogTitle>
            <DialogDescription>Detailed information about the selected merchant.</DialogDescription>
          </DialogHeader>
          {selectedMerchant && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Merchant ID</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant._id.slice(-8)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Business Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.businessName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Owner Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.ownerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Business Type</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.businessType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={
                      getMerchantStatus(selectedMerchant) === "active"
                        ? "default"
                        : getMerchantStatus(selectedMerchant) === "pending"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {getMerchantStatus(selectedMerchant)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Wallet Balance</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedMerchant.wallet ? formatCurrency(selectedMerchant.wallet.balance) : 'No Wallet'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Business Address</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.businessAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Join Date</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedMerchant.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Scanners</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedMerchant.nfcScanners?.length || 0} devices
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">NFC Scanners</Label>
                  <div className="space-y-2 mt-1">
                    {selectedMerchant.nfcScanners && selectedMerchant.nfcScanners.length > 0 ? (
                      selectedMerchant.nfcScanners.map((scanner) => (
                        <div key={scanner._id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="text-sm font-mono">{scanner.deviceId}</span>
                            {scanner.model && (
                              <span className="text-xs text-muted-foreground ml-2">({scanner.model})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={scanner.status === 'ONLINE' ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {scanner.status}
                            </Badge>
                            <Badge 
                              variant={scanner.isActive ? "default" : "outline"}
                              className="text-xs"
                            >
                              {scanner.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No NFC scanners assigned</p>
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