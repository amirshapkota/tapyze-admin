"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, Eye, Store } from "lucide-react"
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

const merchants = [
  {
    id: "MERCH001",
    name: "Coffee Corner",
    email: "contact@coffeecorner.com",
    phone: "+1 234 567 9001",
    address: "123 Main St, City, State 12345",
    category: "Food & Beverage",
    status: "active",
    joinDate: "2024-01-10",
    nfcScanner: "NFC001",
    commission: "2.5%",
  },
  {
    id: "MERCH002",
    name: "Quick Gas Station",
    email: "info@quickgas.com",
    phone: "+1 234 567 9002",
    address: "456 Highway Rd, City, State 12345",
    category: "Fuel",
    status: "active",
    joinDate: "2024-01-15",
    nfcScanner: "NFC002",
    commission: "1.8%",
  },
  {
    id: "MERCH003",
    name: "Bella Restaurant",
    email: "hello@bellarestaurant.com",
    phone: "+1 234 567 9003",
    address: "789 Food Ave, City, State 12345",
    category: "Restaurant",
    status: "pending",
    joinDate: "2024-02-01",
    nfcScanner: null,
    commission: "3.0%",
  },
  {
    id: "MERCH004",
    name: "Fresh Grocery",
    email: "support@freshgrocery.com",
    phone: "+1 234 567 9004",
    address: "321 Market St, City, State 12345",
    category: "Grocery",
    status: "active",
    joinDate: "2024-02-05",
    nfcScanner: "NFC004",
    commission: "2.2%",
  },
  {
    id: "MERCH005",
    name: "City Pharmacy",
    email: "contact@citypharmacy.com",
    phone: "+1 234 567 9005",
    address: "654 Health Blvd, City, State 12345",
    category: "Healthcare",
    status: "suspended",
    joinDate: "2024-02-10",
    nfcScanner: "NFC005",
    commission: "2.0%",
  },
]

export default function MerchantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMerchant, setSelectedMerchant] = useState<(typeof merchants)[0] | null>(null)

  const filteredMerchants = merchants.filter(
    (merchant) =>
      merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Merchant List</CardTitle>
          <CardDescription>A list of all registered merchants in your system.</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant ID</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>NFC Scanner</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMerchants.map((merchant) => (
                <TableRow key={merchant.id}>
                  <TableCell className="font-medium">{merchant.id}</TableCell>
                  <TableCell>{merchant.name}</TableCell>
                  <TableCell>{merchant.category}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{merchant.email}</p>
                      <p className="text-xs text-muted-foreground">{merchant.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        merchant.status === "active"
                          ? "default"
                          : merchant.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {merchant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {merchant.nfcScanner ? (
                      <Badge variant="outline">{merchant.nfcScanner}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>{merchant.commission}</TableCell>
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
                                <Label htmlFor="edit-merchant-name">Business Name</Label>
                                <Input id="edit-merchant-name" defaultValue={merchant.name} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-merchant-category">Category</Label>
                                <Input id="edit-merchant-category" defaultValue={merchant.category} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-merchant-email">Email</Label>
                                <Input id="edit-merchant-email" type="email" defaultValue={merchant.email} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-merchant-phone">Phone</Label>
                                <Input id="edit-merchant-phone" defaultValue={merchant.phone} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-merchant-address">Address</Label>
                              <Textarea id="edit-merchant-address" defaultValue={merchant.address} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-merchant-commission">Commission Rate (%)</Label>
                                <Input
                                  id="edit-merchant-commission"
                                  type="number"
                                  step="0.1"
                                  defaultValue={merchant.commission.replace("%", "")}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-merchant-status">Status</Label>
                                <Select defaultValue={merchant.status}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
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
              ))}
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
                  <p className="text-sm text-muted-foreground">{selectedMerchant.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Business Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={
                      selectedMerchant.status === "active"
                        ? "default"
                        : selectedMerchant.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {selectedMerchant.status}
                  </Badge>
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
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Join Date</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Commission Rate</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.commission}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">NFC Scanner</Label>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.nfcScanner || "Not assigned"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
