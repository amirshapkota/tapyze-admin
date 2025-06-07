"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Store, CreditCard, Scan, TrendingUp, DollarSign, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  totalCustomers: number
  activeMerchants: number
  rfidCards: number
  nfcScanners: number
  customerGrowth?: string
  merchantGrowth?: string
  cardGrowth?: string
  scannerGrowth?: string
}

interface Transaction {
  _id: string
  amount: number
  type: 'CREDIT' | 'DEBIT' | 'TRANSFER'
  description: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  metadata?: {
    customer?: { id: string }
    merchant?: { id: string }
    paymentType?: string
  }
}

interface TransactionVolume {
  totalVolume: number
  dailyTransactions: number[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [transactionVolume, setTransactionVolume] = useState<TransactionVolume | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setError(null)
      
      // Fetch all data in parallel
      const [
        customersResponse,
        merchantsResponse,
        rfidCardsResponse,
        nfcScannersResponse,
        transactionsResponse
      ] = await Promise.all([
        fetch('/api/admin/customers'),
        fetch('/api/admin/merchants'),
        fetch('/api/admin/rfid-cards?isActive=true'),
        fetch('/api/admin/nfc-scanners?isActive=true'),
        fetch('/api/admin/transactions?limit=10&page=1')
      ])

      // Check if all requests were successful
      if (!customersResponse.ok || !merchantsResponse.ok || !rfidCardsResponse.ok || 
          !nfcScannersResponse.ok || !transactionsResponse.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [
        customersData, 
        merchantsData, 
        rfidCardsData, 
        nfcScannersData, 
        transactionsData
      ] = await Promise.all([
        customersResponse.json(),
        merchantsResponse.json(),
        rfidCardsResponse.json(),
        nfcScannersResponse.json(),
        transactionsResponse.json()
      ])

      // Process stats
      const dashboardStats: DashboardStats = {
        totalCustomers: customersData.results || 0,
        activeMerchants: merchantsData.results || 0,
        rfidCards: rfidCardsData.results || 0,
        nfcScanners: nfcScannersData.results || 0,
        customerGrowth: "+12%", // Calculate from historical data
        merchantGrowth: "+8%",  // Calculate from historical data
        cardGrowth: "+15%",     // Calculate from historical data
        scannerGrowth: "+5%"    // Calculate from historical data
      }

      // Calculate transaction volume
      const transactions = transactionsData.data?.transactions || []
      const totalVolume = transactions.reduce((sum: number, txn: Transaction) => {
        return sum + Math.abs(txn.amount)
      }, 0)

      // Generate mock daily data for the chart (replace with real aggregated data)
      const dailyData = Array.from({ length: 30 }, () => Math.random() * 50000 + 10000)

      setStats(dashboardStats)
      setRecentTransactions(transactions.slice(0, 5))
      setTransactionVolume({
        totalVolume,
        dailyTransactions: dailyData
      })

    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatTransactionAmount = (transaction: Transaction) => {
    const amount = Math.abs(transaction.amount)
    return formatCurrency(amount)
  }

  const getTransactionStatus = (status: string) => {
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

  const getCustomerName = (transaction: Transaction) => {
    // Extract customer info from transaction description or metadata
    if (transaction.metadata?.paymentType === 'RFID_TAP' && transaction.metadata?.customer?.id) {
      return `Customer ${transaction.metadata.customer.id.slice(-4)}`
    }
    
    // For wallet transactions, use the transaction description
    if (transaction.description.includes('transfer') || transaction.description.includes('Transfer')) {
      return transaction.type === 'CREDIT' ? 'Incoming Transfer' : 'Outgoing Transfer'
    }
    
    if (transaction.description.includes('top-up') || transaction.description.includes('Top-up')) {
      return 'Wallet Top-up'
    }
    
    // Default to transaction description
    return transaction.description
  }

  const getMerchantName = (transaction: Transaction) => {
    // Extract merchant info from transaction metadata
    if (transaction.metadata?.paymentType === 'RFID_TAP' && transaction.metadata?.merchant?.id) {
      return `Merchant ${transaction.metadata.merchant.id.slice(-4)}`
    }
    
    // For transfer transactions
    if (transaction.metadata?.transferType) {
      return transaction.metadata.transferType === 'INCOMING' ? 'From Transfer' : 'To Transfer'
    }
    
    // Default to transaction type and description
    return `${transaction.type} Transaction`
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (error) {
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
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          [
            {
              title: "Total Customers",
              value: stats?.totalCustomers.toLocaleString() || "0",
              change: stats?.customerGrowth || "+0%",
              icon: Users,
              color: "text-blue-600",
            },
            {
              title: "Active Merchants",
              value: stats?.activeMerchants.toLocaleString() || "0",
              change: stats?.merchantGrowth || "+0%",
              icon: Store,
              color: "text-green-600",
            },
            {
              title: "RFID Cards",
              value: stats?.rfidCards.toLocaleString() || "0",
              change: stats?.cardGrowth || "+0%",
              icon: CreditCard,
              color: "text-purple-600",
            },
            {
              title: "NFC Scanners",
              value: stats?.nfcScanners.toLocaleString() || "0",
              change: stats?.scannerGrowth || "+0%",
              icon: Scan,
              color: "text-orange-600",
            },
          ].map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Transaction Volume Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Transaction Volume
            </CardTitle>
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(transactionVolume?.totalVolume || 0)}
              </div>
            )}
            <CardDescription>
              {isLoading ? (
                <Skeleton className="h-4 w-64" />
              ) : (
                `Total volume this month: ${formatCurrency(transactionVolume?.totalVolume || 0)} | Daily breakdown for the last 30 days`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="h-[200px] flex items-end justify-between gap-2">
                {transactionVolume?.dailyTransactions.map((amount, i) => (
                  <div
                    key={i}
                    className="bg-primary/20 hover:bg-primary/40 transition-colors rounded-t cursor-pointer"
                    style={{
                      height: `${(amount / Math.max(...(transactionVolume?.dailyTransactions || []))) * 160 + 40}px`,
                      width: "100%",
                    }}
                    title={formatCurrency(amount)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest transactions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getCustomerName(transaction)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getMerchantName(transaction)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">
                        {formatTransactionAmount(transaction)}
                      </p>
                      <Badge
                        variant={getTransactionStatus(transaction.status) as any}
                        className="text-xs"
                      >
                        {transaction.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent transactions found
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Cards</span>
                  <span className="text-sm font-medium">{stats?.rfidCards || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Online Scanners</span>
                  <span className="text-sm font-medium">{stats?.nfcScanners || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Status</span>
                  <Badge variant="default" className="text-xs">Operational</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">New customer registered</p>
                <p className="text-muted-foreground">RFID card issued</p>
                <p className="text-muted-foreground">Scanner went online</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}