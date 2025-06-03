"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Receipt, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const transactions = [
  {
    id: "TXN001",
    timestamp: "2024-03-15 14:30:25",
    customer: "John Doe",
    customerId: "CUST001",
    merchant: "Coffee Corner",
    merchantId: "MERCH001",
    amount: "$12.50",
    type: "payment",
    status: "completed",
    rfidCard: "RFID001",
    nfcScanner: "NFC001",
    balanceBefore: "$138.00",
    balanceAfter: "$125.50",
  },
  {
    id: "TXN002",
    timestamp: "2024-03-15 16:45:12",
    customer: "Jane Smith",
    customerId: "CUST002",
    merchant: "Quick Gas Station",
    merchantId: "MERCH002",
    amount: "$45.00",
    type: "payment",
    status: "completed",
    rfidCard: "RFID002",
    nfcScanner: "NFC002",
    balanceBefore: "$134.25",
    balanceAfter: "$89.25",
  },
  {
    id: "TXN003",
    timestamp: "2024-03-15 18:20:45",
    customer: "Mike Johnson",
    customerId: "CUST003",
    merchant: "Bella Restaurant",
    merchantId: "MERCH003",
    amount: "$28.75",
    type: "payment",
    status: "pending",
    rfidCard: "RFID003",
    nfcScanner: "NFC003",
    balanceBefore: "$28.75",
    balanceAfter: "$0.00",
  },
  {
    id: "TXN004",
    timestamp: "2024-03-15 19:15:30",
    customer: "Sarah Wilson",
    customerId: "CUST004",
    merchant: "Fresh Grocery",
    merchantId: "MERCH004",
    amount: "$67.20",
    type: "payment",
    status: "completed",
    rfidCard: "RFID004",
    nfcScanner: "NFC004",
    balanceBefore: "$301.95",
    balanceAfter: "$234.75",
  },
  {
    id: "TXN005",
    timestamp: "2024-03-15 20:05:18",
    customer: "Tom Brown",
    customerId: "CUST005",
    merchant: "City Pharmacy",
    merchantId: "MERCH005",
    amount: "$15.30",
    type: "payment",
    status: "failed",
    rfidCard: "RFID005",
    nfcScanner: "NFC005",
    balanceBefore: "$45.00",
    balanceAfter: "$45.00",
  },
  {
    id: "TXN006",
    timestamp: "2024-03-14 10:30:00",
    customer: "John Doe",
    customerId: "CUST001",
    merchant: "System",
    merchantId: "SYS001",
    amount: "$100.00",
    type: "topup",
    status: "completed",
    rfidCard: "RFID001",
    nfcScanner: null,
    balanceBefore: "$38.00",
    balanceAfter: "$138.00",
  },
]

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<(typeof transactions)[0] | null>(null)

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesType = typeFilter === "all" || transaction.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

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
        <Button className="bg-primary hover:bg-primary/90">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Complete list of all transactions in the system.</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
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
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="topup">Top Up</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.timestamp}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{transaction.customer}</p>
                      <p className="text-xs text-muted-foreground">{transaction.customerId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{transaction.merchant}</p>
                      <p className="text-xs text-muted-foreground">{transaction.merchantId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "default"
                          : transaction.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
                  <p className="text-sm text-muted-foreground">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.timestamp}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.customer} ({selectedTransaction.customerId})
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Merchant</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.merchant} ({selectedTransaction.merchantId})
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.amount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge variant="outline">{selectedTransaction.type}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={
                      selectedTransaction.status === "completed"
                        ? "default"
                        : selectedTransaction.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">RFID Card</Label>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.rfidCard}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">NFC Scanner</Label>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.nfcScanner || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Balance Before</Label>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.balanceBefore}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Balance After</Label>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.balanceAfter}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
