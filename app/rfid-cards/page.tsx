"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, CreditCard } from "lucide-react"
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

const rfidCards = [
  {
    id: "RFID001",
    uid: "04:A3:B2:C1:D4:E5:F6",
    status: "active",
    assignedTo: "John Doe",
    customerId: "CUST001",
    issueDate: "2024-01-15",
    expiryDate: "2026-01-15",
  },
  {
    id: "RFID002",
    uid: "04:B4:C3:D2:E5:F6:A7",
    status: "active",
    assignedTo: "Jane Smith",
    customerId: "CUST002",
    issueDate: "2024-01-20",
    expiryDate: "2026-01-20",
  },
  {
    id: "RFID003",
    uid: "04:C5:D4:E3:F6:A7:B8",
    status: "unassigned",
    assignedTo: null,
    customerId: null,
    issueDate: "2024-02-01",
    expiryDate: "2026-02-01",
  },
  {
    id: "RFID004",
    uid: "04:D6:E5:F4:A7:B8:C9",
    status: "active",
    assignedTo: "Sarah Wilson",
    customerId: "CUST004",
    issueDate: "2024-02-10",
    expiryDate: "2026-02-10",
  },
  {
    id: "RFID005",
    uid: "04:E7:F6:A5:B8:C9:DA",
    status: "blocked",
    assignedTo: "Tom Brown",
    customerId: "CUST005",
    issueDate: "2024-02-15",
    expiryDate: "2026-02-15",
  },
]

const customers = [
  { id: "CUST001", name: "John Doe" },
  { id: "CUST002", name: "Jane Smith" },
  { id: "CUST003", name: "Mike Johnson" },
  { id: "CUST004", name: "Sarah Wilson" },
  { id: "CUST005", name: "Tom Brown" },
  { id: "CUST006", name: "Alice Cooper" },
  { id: "CUST007", name: "Bob Wilson" },
]

export default function RfidCardsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCards = rfidCards.filter(
    (card) =>
      card.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.uid.includes(searchTerm) ||
      (card.assignedTo && card.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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
        <Dialog>
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
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="card-uid">Card UID</Label>
                <Input id="card-uid" placeholder="04:XX:XX:XX:XX:XX:XX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input id="expiry-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-customer">Assign to Customer (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer or leave unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Leave Unassigned</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Create Card</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">RFID Card List</CardTitle>
              <CardDescription className="mt-1">Manage all RFID cards in your system</CardDescription>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cards..."
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
                  <TableHead className="font-semibold">Card ID</TableHead>
                  <TableHead className="font-semibold">UID</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Assigned To</TableHead>
                  <TableHead className="font-semibold">Issue Date</TableHead>
                  <TableHead className="font-semibold">Expiry Date</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCards.map((card) => (
                  <TableRow key={card.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium">{card.id}</TableCell>
                    <TableCell className="font-mono text-sm">{card.uid}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          card.status === "active"
                            ? "default"
                            : card.status === "unassigned"
                              ? "secondary"
                              : "destructive"
                        }
                        className="font-medium"
                      >
                        {card.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {card.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {card.assignedTo}
                        </div>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{card.issueDate}</TableCell>
                    <TableCell className="text-sm">{card.expiryDate}</TableCell>
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
                                <Input id="edit-card-uid" defaultValue={card.uid} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-expiry-date">Expiry Date</Label>
                                <Input id="edit-expiry-date" type="date" defaultValue={card.expiryDate} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-card-status">Status</Label>
                                <Select defaultValue={card.status}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    <SelectItem value="blocked">Blocked</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-assign-customer">Assigned Customer</Label>
                                <Select defaultValue={card.customerId || "unassigned"}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {customers.map((customer) => (
                                      <SelectItem key={customer.id} value={customer.id}>
                                        {customer.name} ({customer.id})
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
