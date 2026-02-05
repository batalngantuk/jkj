'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Building2, User, Mail, Phone, MapPin, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/components/app-layout'

export default function NewSupplierPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Indonesia',
    paymentTerms: '30',
    category: 'Raw Materials',
    taxId: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock save - in real app would call API
    console.log('Saving supplier:', formData)
    // Redirect back to suppliers list
    router.push('/purchasing/suppliers')
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/purchasing/suppliers">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add New Supplier</h1>
              <p className="text-sm text-muted-foreground">Create a new supplier record</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Company Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>Basic supplier company details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    placeholder="PT. Supplier Name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                      <SelectItem value="Packaging">Packaging</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / NPWP</Label>
                  <Input
                    id="taxId"
                    placeholder="00.000.000.0-000.000"
                    value={formData.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (Days) *</Label>
                  <Select value={formData.paymentTerms} onValueChange={(value) => handleChange('paymentTerms', value)}>
                    <SelectTrigger id="paymentTerms">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Cash on Delivery</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="45">45 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Primary contact person details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    placeholder="John Doe"
                    value={formData.contactPerson}
                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@supplier.com"
                      className="pl-9"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+62 21 1234 5678"
                      className="pl-9"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
                <CardDescription>Supplier location details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Jl. Supplier Street No. 123"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Jakarta"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={(value) => handleChange('country', value)}>
                    <SelectTrigger id="country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indonesia">Indonesia</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                      <SelectItem value="Malaysia">Malaysia</SelectItem>
                      <SelectItem value="Thailand">Thailand</SelectItem>
                      <SelectItem value="China">China</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Any additional information about this supplier</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes, certifications, or special requirements..."
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <Link href="/purchasing/suppliers">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              Save Supplier
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
