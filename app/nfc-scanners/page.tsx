"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Scan } from "lucide-react"
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

const nfcScanners = [
  {
    id: "NFC001",
    serialNumber: "NFC-2024-001",
    model: "TapyzeReader Pro",
    status: "active",
    assignedTo: "Coffee Corner",
    merchantId: "MERCH001",
    installDate: "2024-01-10",
    lastActivity: "2024-03-15 14:30",
    location: "Counter 1",
  },
  {
    id: "NFC002",
    serialNumber: "NFC-2024-002",
    model: "TapyzeReader Pro",
    status: "active",
    assignedTo: "Quick Gas Station",
    merchantId: "MERCH002",
    installDate: "2024-01-15",
    lastActivity: "2024-03-15 16:45",
    location: "Pump Station",
  },
  {
    id: "NFC003",
    serialNumber: "NFC-2024-003",
    model: "TapyzeReader Lite",
    status: "unassigned",
    assignedTo: null,
    merchantId: null,
    installDate: null,
    lastActivity: null,
    location: null,
  },
  {
    id: "NFC004",
    serialNumber: "NFC-2024-004",
    model: "TapyzeReader Pro",
    status: "active",
    assignedTo: "Fresh Grocery",
    merchantId: "MERCH004",
    installDate: "2024-02-05",
    lastActivity: "2024-03-15 18:20",
    location: "Checkout 1",
  },
  {
    id: "NFC005",
    serialNumber: "NFC-2024-005",
    model: "TapyzeReader Pro",
    status: "maintenance",
    assignedTo: "City Pharmacy",
    merchantId: "MERCH005",
    installDate: "2024-02-10",
    lastActivity: "2024-03-10 12:15",
    location: "Main Counter",
  },
]

const merchants = [
  { id: "MERCH001", name: "Coffee Corner" },
  { id: "MERCH002", name: "Quick Gas Station" },
  { id: "MERCH003", name: "Bella Restaurant" },
  { id: "MERCH004", name: "Fresh Grocery" },
  { id: "MERCH005", name: "City Pharmacy" },
  { id: "MERCH006", name: "Tech Store" },
  { id: "MERCH007", name: "Book Shop" },
]

export default function NfcScannersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredScanners = nfcScanners.filter(
    (scanner) =>
      scanner.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scanner.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scanner.assignedTo && scanner.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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
                <Label htmlFor="serial-number">Serial Number</Label>
                <Input id="serial-number" placeholder="NFC-2024-XXX" />
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
                      <SelectItem key={merchant.id} value={merchant.id}>
                        {merchant.name} ({merchant.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Installation Location</Label>
                <Input id="location" placeholder="e.g., Counter 1, Checkout 2" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90">Add Scanner</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">NFC Scanner List</CardTitle>
              <CardDescription className="mt-1">Manage all NFC scanners in your system</CardDescription>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scanners..."
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
                  <TableHead className="font-semibold">Scanner ID</TableHead>
                  <TableHead className="font-semibold">Serial Number</TableHead>
                  <TableHead className="font-semibold">Model</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Assigned To</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Last Activity</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScanners.map((scanner) => (
                  <TableRow key={scanner.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium">{scanner.id}</TableCell>
                    <TableCell className="font-mono text-sm">{scanner.serialNumber}</TableCell>
                    <TableCell>{scanner.model}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          scanner.status === "active"
                            ? "default"
                            : scanner.status === "unassigned"
                              ? "secondary"
                              : scanner.status === "maintenance"
                                ? "destructive"
                                : "outline"
                        }
                        className="font-medium"
                      >
                        {scanner.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {scanner.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {scanner.assignedTo}
                        </div>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{scanner.location || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="text-sm">
                      {scanner.lastActivity || <span className="text-muted-foreground">Never</span>}
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
                              <DialogTitle>Edit NFC Scanner</DialogTitle>
                              <DialogDescription>Update NFC scanner information.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-serial-number">Serial Number</Label>
                                <Input id="edit-serial-number" defaultValue={scanner.serialNumber} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-model">Model</Label>
                                <Select defaultValue={scanner.model}>
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
                                <Label htmlFor="edit-location">Location</Label>
                                <Input id="edit-location" defaultValue={scanner.location || ""} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-scanner-status">Status</Label>
                                <Select defaultValue={scanner.status}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-assign-merchant">Assigned Merchant</Label>
                                <Select defaultValue={scanner.merchantId || "unassigned"}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {merchants.map((merchant) => (
                                      <SelectItem key={merchant.id} value={merchant.id}>
                                        {merchant.name} ({merchant.id})
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
