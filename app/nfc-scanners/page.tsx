"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, Edit, Trash2, Scan, RefreshCw, AlertCircle } from "lucide-react"
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

interface NfcScanner {
  _id: string
  deviceId: string
  model?: string
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'PENDING_ACTIVATION'
  isActive: boolean
  owner?: {
    _id: string
    businessName: string
    ownerName: string
  }
  lastConnected?: string
  registeredAt: string
  firmwareVersion?: string
}

interface Merchant {
  _id: string
  businessName: string
  ownerName: string
}

export default function NfcScannersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [scanners, setScanners] = useState<NfcScanner[]>([])
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

  const fetchScanners = async (page = 1) => {
    try {
      setError(null)
      if (page === 1) setIsLoading(true)
      
      const response = await fetch(`/api/admin/nfc-scanners?page=${page}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch NFC scanners')
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setScanners(data.data.scanners || [])
        setPagination({
          page: data.data.pagination?.page || 1,
          total: data.data.pagination?.total || 0,
          pages: data.data.pagination?.pages || 0,
          limit: data.data.pagination?.limit || 20
        })
      } else {
        throw new Error(data.message || 'Failed to fetch NFC scanners')
      }
    } catch (err) {
      console.error('NFC scanners fetch error:', err)
      setError('Failed to load NFC scanners. Please try again.')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const fetchMerchants = async () => {
    try {
      const response = await fetch('/api/admin/merchants?limit=100')
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'success') {
          setMerchants(data.data.merchants || [])
        }
      }
    } catch (err) {
      console.error('Merchants fetch error:', err)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchScanners(pagination.page), fetchMerchants()])
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'default'
      case 'OFFLINE':
        return 'secondary'
      case 'MAINTENANCE':
        return 'destructive'
      case 'PENDING_ACTIVATION':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const filteredScanners = scanners.filter(
    (scanner) =>
      scanner.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scanner.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scanner.owner?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchScanners()
    fetchMerchants()
  }, [])

  if (error && scanners.length === 0) {
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
              <Scan className="h-6 w-6 text-primary" />
            </div>
            NFC Scanners
          </h2>
          <p className="text-muted-foreground">Manage NFC scanners and merchant assignments</p>
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
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add NFC Scanner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New NFC Scanner</DialogTitle>
                <DialogDescription>Register a new NFC scanner and assign to merchant.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="device-id">Device ID</Label>
                  <Input id="device-id" placeholder="NFC-2024-XXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TapyzeReader Pro">TapyzeReader Pro</SelectItem>
                      <SelectItem value="TapyzeReader Lite">TapyzeReader Lite</SelectItem>
                      <SelectItem value="TapyzeReader Mini">TapyzeReader Mini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assign-merchant">Assign to Merchant (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select merchant or leave unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Leave Unassigned</SelectItem>
                      {merchants.map((merchant) => (
                        <SelectItem key={merchant._id} value={merchant._id}>
                          {merchant.businessName} - {merchant.ownerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firmware-version">Firmware Version</Label>
                  <Input id="firmware-version" placeholder="e.g., v1.2.3" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90">Add Scanner</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">NFC Scanner List</CardTitle>
              <CardDescription className="mt-1">
                {isLoading ? "Loading scanners..." : `${pagination.total} NFC scanners in total`}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scanners..."
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
                  <TableHead className="font-semibold">Device ID</TableHead>
                  <TableHead className="font-semibold">Model</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Assigned To</TableHead>
                  <TableHead className="font-semibold">Firmware</TableHead>
                  <TableHead className="font-semibold">Last Connected</TableHead>
                  <TableHead className="font-semibold">Registered</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredScanners.length > 0 ? (
                  filteredScanners.map((scanner) => (
                    <TableRow key={scanner._id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium font-mono">{scanner.deviceId}</TableCell>
                      <TableCell>{scanner.model || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(scanner.status)}
                          className="font-medium"
                        >
                          {scanner.status.replace('_', ' ').toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {scanner.owner ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <div className="font-medium">{scanner.owner.businessName}</div>
                              <div className="text-xs text-muted-foreground">{scanner.owner.ownerName}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {scanner.firmwareVersion || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {scanner.lastConnected ? formatDate(scanner.lastConnected) : 
                         <span className="text-muted-foreground">Never</span>}
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(scanner.registeredAt)}</TableCell>
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
                                <DialogTitle>Edit NFC Scanner</DialogTitle>
                                <DialogDescription>Update NFC scanner information.</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-device-id">Device ID</Label>
                                  <Input id="edit-device-id" defaultValue={scanner.deviceId} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-model">Model</Label>
                                  <Select defaultValue={scanner.model || ""}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="TapyzeReader Pro">TapyzeReader Pro</SelectItem>
                                      <SelectItem value="TapyzeReader Lite">TapyzeReader Lite</SelectItem>
                                      <SelectItem value="TapyzeReader Mini">TapyzeReader Mini</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-firmware">Firmware Version</Label>
                                  <Input id="edit-firmware" defaultValue={scanner.firmwareVersion || ""} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-scanner-status">Status</Label>
                                  <Select defaultValue={scanner.status}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ONLINE">Online</SelectItem>
                                      <SelectItem value="OFFLINE">Offline</SelectItem>
                                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                      <SelectItem value="PENDING_ACTIVATION">Pending Activation</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-assign-merchant">Assigned Merchant</Label>
                                  <Select defaultValue={scanner.owner?._id || "unassigned"}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unassigned">Unassigned</SelectItem>
                                      {merchants.map((merchant) => (
                                        <SelectItem key={merchant._id} value={merchant._id}>
                                          {merchant.businessName} - {merchant.ownerName}
                                        </SelectItem>
                                      ))}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No NFC scanners found matching your search." : "No NFC scanners found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}