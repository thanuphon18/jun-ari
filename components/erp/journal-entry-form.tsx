"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createJournalEntry } from "@/lib/erp/actions"
import { formatCurrency } from "@/lib/erp/format"
import type { Account, CostCenter } from "@/lib/erp/types"

interface LineItem {
  key: number
  account_id: string
  cost_center_id: string
  debit: string
  credit: string
}

let lineKeyCounter = 2

export function JournalEntryForm({ accounts, costCenters }: { accounts: Account[]; costCenters: CostCenter[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [entryType, setEntryType] = useState("Journal Entry")
  const [postingDate, setPostingDate] = useState(new Date().toISOString().split("T")[0])
  const [userRemark, setUserRemark] = useState("")
  const [lines, setLines] = useState<LineItem[]>([
    { key: 0, account_id: "", cost_center_id: "", debit: "", credit: "" },
    { key: 1, account_id: "", cost_center_id: "", debit: "", credit: "" },
  ])

  const addLine = () => {
    setLines([...lines, { key: lineKeyCounter++, account_id: "", cost_center_id: "", debit: "", credit: "" }])
  }

  const removeLine = (key: number) => {
    if (lines.length <= 2) return
    setLines(lines.filter(l => l.key !== key))
  }

  const updateLine = (key: number, field: keyof LineItem, value: string) => {
    setLines(lines.map(l => l.key === key ? { ...l, [field]: value } : l))
  }

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0)
  const difference = Math.abs(totalDebit - totalCredit)
  const isBalanced = difference < 0.01

  const handleSubmit = async () => {
    if (!isBalanced) {
      toast.error("Total debit must equal total credit")
      return
    }

    const validLines = lines.filter(l => l.account_id && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0))
    if (validLines.length < 2) {
      toast.error("At least 2 line items are required")
      return
    }

    setLoading(true)
    const result = await createJournalEntry({
      entry_type: entryType,
      posting_date: postingDate,
      user_remark: userRemark || undefined,
      items: validLines.map(l => ({
        account_id: l.account_id,
        cost_center_id: l.cost_center_id || undefined,
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0,
      })),
    })

    if (result.success) {
      toast.success("Journal Entry created")
      router.push(`/admin/accounting/journal-entries/${result.id}`)
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Entry Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label>Entry Type</Label>
              <Select value={entryType} onValueChange={setEntryType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Journal Entry">Journal Entry</SelectItem>
                  <SelectItem value="Bank Entry">Bank Entry</SelectItem>
                  <SelectItem value="Cash Entry">Cash Entry</SelectItem>
                  <SelectItem value="Credit Note">Credit Note</SelectItem>
                  <SelectItem value="Debit Note">Debit Note</SelectItem>
                  <SelectItem value="Opening Entry">Opening Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Posting Date</Label>
              <Input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} />
            </div>
            <div>
              <Label>Remark</Label>
              <Textarea rows={1} value={userRemark} onChange={e => setUserRemark(e.target.value)} placeholder="Optional note..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Accounting Entries</CardTitle>
            <Button variant="outline" size="sm" onClick={addLine} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Cost Center</TableHead>
                <TableHead className="w-36">Debit</TableHead>
                <TableHead className="w-36">Credit</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, idx) => (
                <TableRow key={line.key}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell>
                    <Select value={line.account_id} onValueChange={v => updateLine(line.key, "account_id", v)}>
                      <SelectTrigger className="min-w-[200px]">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.account_number ? `${a.account_number} - ` : ""}{a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={line.cost_center_id} onValueChange={v => updateLine(line.key, "cost_center_id", v)}>
                      <SelectTrigger className="min-w-[140px]">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {costCenters.map(cc => (
                          <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={line.debit}
                      onChange={e => {
                        updateLine(line.key, "debit", e.target.value)
                        if (parseFloat(e.target.value) > 0) updateLine(line.key, "credit", "")
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={line.credit}
                      onChange={e => {
                        updateLine(line.key, "credit", e.target.value)
                        if (parseFloat(e.target.value) > 0) updateLine(line.key, "debit", "")
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeLine(line.key)}
                      disabled={lines.length <= 2}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals row */}
              <TableRow className="bg-muted/50 font-medium">
                <TableCell colSpan={3} className="text-right text-sm">
                  Totals
                  {!isBalanced && (
                    <span className="ml-2 text-xs text-destructive">
                      (Difference: {formatCurrency(difference)})
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">{formatCurrency(totalDebit)}</TableCell>
                <TableCell className="font-mono text-sm">{formatCurrency(totalCredit)}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>Discard</Button>
        <Button onClick={handleSubmit} disabled={loading || !isBalanced}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save as Draft"}
        </Button>
      </div>
    </div>
  )
}
