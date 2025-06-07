"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Download, Receipt, Eye, RefreshCw, AlertCircle, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transaction {
  _id: string
  amount: number
  type: 'CREDIT' | 'DEBIT' | 'TRANSFER'
  description: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  reference?: string
  wallet?: {
    _id: string
    owner: string
    ownerType: 'Customer' | 'Merchant'
  }
  metadata?: {
    customer?: { id: string; type: string }
    merchant?: { id: string; type: string }
    paymentType?: string
    transferType?: 'INCOMING' | 'OUTGOING'
    method?: string
    cardUid?: string
    cardId?: string
    [key: string]: any
  }
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    limit: 20
  })
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  })

  const fetchTransactions = async (page = 1) => {
    try {
      setError(null)
      if (page === 1) setIsLoading(true)
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      })
      
      if (dateFilter.startDate) queryParams.append('startDate', dateFilter.startDate)
      if (dateFilter.endDate) queryParams.append('endDate', dateFilter.endDate)
      
      const response = await fetch(`/api/admin/transactions?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setTransactions(data.data.transactions || [])
        setPagination({
          page: data.data.pagination?.page || 1,
          total: data.data.pagination?.total || 0,
          pages: data.data.pagination?.pages || 0,
          limit: data.data.pagination?.limit || 20
        })
      } else {
        throw new Error(data.message || 'Failed to fetch transactions')
      }
    } catch (err) {
      console.error('Transactions fetch error:', err)
      setError('Failed to load transactions. Please try again.')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTransactions(pagination.page)
  }

  const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateFilter(prev => ({ ...prev, [field]: value }))
  }

  const applyDateFilter = () => {
    fetchTransactions(1)
  }

  const clearDateFilter = () => {
    setDateFilter({ startDate: "", endDate: "" })
    setTimeout(() => fetchTransactions(1), 100)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(Math.abs(amount))
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTransactionDisplayType = (transaction: Transaction) => {
    if (transaction.metadata?.paymentType === 'RFID_TAP') return 'RFID Payment'
    if (transaction.metadata?.transferType) return 'Transfer'
    if (transaction.description.toLowerCase().includes('top-up')) return 'Top Up'
    if (transaction.description.toLowerCase().includes('refund')) return 'Refund'
    return transaction.type
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'PENDING':
        return 'secondary'
      case 'FAILED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    if (type.includes('RFID')) return 'default'
    if (type.includes('Transfer')) return 'secondary'
    if (type.includes('Top Up')) return 'outline'
    return 'outline'
  }

  const getCustomerInfo = (transaction: Transaction) => {
    if (transaction.metadata?.customer?.id) {
      return `Customer ${transaction.metadata.customer.id.slice(-4)}`
    }
    if (transaction.wallet?.ownerType === 'Customer') {
      return `Customer ${transaction.wallet.owner.slice(-4)}`
    }
    return 'System'
  }

  const getMerchantInfo = (transaction: Transaction) => {
    if (transaction.metadata?.merchant?.id) {
      return `Merchant ${transaction.metadata.merchant.id.slice(-4)}`
    }
    if (transaction.wallet?.ownerType === 'Merchant') {
      return `Merchant ${transaction.wallet.owner.slice(-4)}`
    }
    if (transaction.metadata?.transferType) {
      return transaction.metadata.transferType === 'INCOMING' ? 'From Transfer' : 'To Transfer'
    }
    return 'System'
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionType = getTransactionDisplayType(transaction).toLowerCase()
    const customerInfo = getCustomerInfo(transaction).toLowerCase()
    const merchantInfo = getMerchantInfo(transaction).toLowerCase()
    
    const matchesSearch =
      transaction._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerInfo.includes(searchTerm.toLowerCase()) ||
      merchantInfo.includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status.toLowerCase() === statusFilter
    const matchesType = typeFilter === "all" || transactionType.includes(typeFilter.toLowerCase())

    return matchesSearch && matchesStatus && matchesType
  })

  const exportTransactions = () => {
    // Prepare CSV data
    const csvHeaders = ['Transaction ID', 'Timestamp', 'Customer', 'Merchant', 'Amount', 'Type', 'Status', 'Description']
    const csvData = filteredTransactions.map(transaction => [
      transaction._id,
      formatDateTime(transaction.createdAt),
      getCustomerInfo(transaction),
      getMerchantInfo(transaction),
      formatCurrency(transaction.amount),
      getTransactionDisplayType(transaction),
      transaction.status,
      transaction.description
    ])
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  if (error && transactions.length === 0) {
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
            <Receipt className="h-8 w-8 text-primary" />
            Transactions
          </h2>
          <p className="text-muted-foreground">View and manage all system transactions</p>
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
          <Button className="bg-primary hover:bg-primary/90" onClick={exportTransactions}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {isLoading ? "Loading transactions..." : `${pagination.total} transactions in total`}
          </CardDescription>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                disabled={isLoading}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
                <SelectItem value="top up">Top Ups</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                className="w-[140px]"
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                className="w-[140px]"
                placeholder="End Date"
              />
              <Button variant="outline" size="sm" onClick={applyDateFilter}>
                Apply
              </Button>
              {(dateFilter.startDate || dateFilter.endDate) && (
                <Button variant="outline" size="sm" onClick={clearDateFilter}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Customer/From</TableHead>
                <TableHead>Merchant/To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => {
                  const displayType = getTransactionDisplayType(transaction)
                  
                  return (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-medium font-mono text-sm">
                        {transaction.reference || transaction._id.slice(-8)}
                      </TableCell>
                      <TableCell className="text-sm">{formatDateTime(transaction.createdAt)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{getCustomerInfo(transaction)}</p>
                          {transaction.metadata?.cardUid && (
                            <p className="text-xs text-muted-foreground font-mono">
                              Card: {transaction.metadata.cardUid}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{getMerchantInfo(transaction)}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.wallet?.ownerType || 'System'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <span className={transaction.amount < 0 ? "text-red-600" : "text-green-600"}>
                          {transaction.amount < 0 ? "-" : "+"}{formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(displayType)}>
                          {displayType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(transaction.status)}>
                          {transaction.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No transactions found matching your search." : "No transactions found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Detailed information about the selected transaction.</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Transaction ID</Label>
                  <p className="text-sm text-muted-foreground font-mono">{selectedTransaction._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reference</Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedTransaction.reference || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <p className="text-sm text-muted-foreground">{formatDateTime(selectedTransaction.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className={`text-sm font-medium ${selectedTransaction.amount < 0 ? "text-red-600" : "text-green-600"}`}>
                    {selectedTransaction.amount < 0 ? "-" : "+"}{formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge variant={getTypeBadgeVariant(getTransactionDisplayType(selectedTransaction))}>
                    {getTransactionDisplayType(selectedTransaction)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>
                    {selectedTransaction.status.toLowerCase()}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.description}</p>
                </div>
                {selectedTransaction.metadata?.cardUid && (
                  <div>
                    <Label className="text-sm font-medium">RFID Card</Label>
                    <p className="text-sm text-muted-foreground font-mono">{selectedTransaction.metadata.cardUid}</p>
                  </div>
                )}
                {selectedTransaction.metadata?.paymentType && (
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <p className="text-sm text-muted-foreground">{selectedTransaction.metadata.paymentType}</p>
                  </div>
                )}
                {selectedTransaction.wallet && (
                  <div>
                    <Label className="text-sm font-medium">Wallet Owner</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTransaction.wallet.ownerType} {selectedTransaction.wallet.owner.slice(-8)}
                    </p>
                  </div>
                )}
                {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Additional Details</Label>
                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded mt-1">
                      <pre>{JSON.stringify(selectedTransaction.metadata, null, 2)}</pre>
                    </div>
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