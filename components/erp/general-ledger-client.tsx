"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/erp/format"
import type { GLEntry, Account } from "@/lib/erp/types"

export function GeneralLedgerClient({ entries, accounts }: { entries: GLEntry[]; accounts: Account[] }) {
  const [accountFilter, setAccountFilter] = useState("")
  const [voucherFilter, setVoucherFilter] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const voucherTypes = [...new Set(entries.map(e => e.voucher_type))]

  const filtered = entries.filter(e => {
    if (accountFilter && e.account_id !== accountFilter) return false
    if (voucherFilter && e.voucher_type !== voucherFilter) return false
    if (fromDate && e.posting_date < fromDate) return false
    if (toDate && e.posting_date > toDate) return false
    return true
  })

  const totalDebit = filtered.reduce((s, e) => s + Number(e.debit), 0)
  const totalCredit = filtered.reduce((s, e) => s + Number(e.credit), 0)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <Label className="text-xs">Account</Label>
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger><SelectValue placeholder="All accounts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.account_number ? `${a.account_number} - ` : ""}{a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Voucher Type</Label>
              <Select value={voucherFilter} onValueChange={setVoucherFilter}>
                <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {voucherTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">From Date</Label>
              <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To Date</Label>
              <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead>Voucher</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    No GL entries found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm whitespace-nowrap">{formatDate(entry.posting_date)}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-foreground">{entry.accounts?.name || "-"}</div>
                      {entry.accounts?.account_number && (
                        <div className="text-xs font-mono text-muted-foreground">{entry.accounts.account_number}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {Number(entry.debit) > 0 ? formatCurrency(entry.debit) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {Number(entry.credit) > 0 ? formatCurrency(entry.credit) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{entry.voucher_type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {entry.remarks || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {filtered.length > 0 && (
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell colSpan={2} className="text-right text-sm">Totals</TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(totalDebit)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(totalCredit)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-right">{filtered.length} entries shown</p>
    </div>
  )
}
