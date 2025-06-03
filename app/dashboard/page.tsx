"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Store, CreditCard, Scan, TrendingUp, DollarSign } from "lucide-react"

const stats = [
  {
    title: "Total Customers",
    value: "2,847",
    change: "+12%",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Active Merchants",
    value: "156",
    change: "+8%",
    icon: Store,
    color: "text-green-600",
  },
  {
    title: "RFID Cards",
    value: "3,241",
    change: "+15%",
    icon: CreditCard,
    color: "text-purple-600",
  },
  {
    title: "NFC Scanners",
    value: "89",
    change: "+5%",
    icon: Scan,
    color: "text-orange-600",
  },
]

const recentTransactions = [
  { id: "TXN001", customer: "John Doe", merchant: "Coffee Shop", amount: "$12.50", status: "completed" },
  { id: "TXN002", customer: "Jane Smith", merchant: "Gas Station", amount: "$45.00", status: "completed" },
  { id: "TXN003", customer: "Mike Johnson", merchant: "Restaurant", amount: "$28.75", status: "pending" },
  { id: "TXN004", customer: "Sarah Wilson", merchant: "Grocery Store", amount: "$67.20", status: "completed" },
  { id: "TXN005", customer: "Tom Brown", merchant: "Pharmacy", amount: "$15.30", status: "failed" },
]

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Transaction Volume Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Transaction Volume
            </CardTitle>
            <div className="text-2xl font-bold text-primary">$2,847,392.50</div>
            <CardDescription>
              Total volume this month: $2,847,392.50 | Daily breakdown for the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-end justify-between gap-2">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className="bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                  style={{
                    height: `${Math.random() * 160 + 40}px`,
                    width: "100%",
                  }}
                />
              ))}
            </div>
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
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{transaction.customer}</p>
                    <p className="text-sm text-muted-foreground">{transaction.merchant}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">{transaction.amount}</p>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "default"
                          : transaction.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
