"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/erp/format"
import type { TrialBalanceRow, FiscalYear } from "@/lib/erp/types"

const ROOT_TYPE_COLORS: Record<string, string> = {
  Asset: "bg-blue-100 text-blue-800",
  Liability: "bg-amber-100 text-amber-800",
  Income: "bg-emerald-100 text-emerald-800",
  Expense: "bg-red-100 text-red-800",
  Equity: "bg-violet-100 text-violet-800",
}

export function TrialBalanceClient({ rows, fiscalYears }: { rows: TrialBalanceRow[]; fiscalYears: FiscalYear[] }) {
  const defaultFY = fiscalYears.find(f => f.is_default) || fiscalYears[0]

  const grandOpeningDebit = rows.reduce((s, r) => s + r.opening_debit, 0)
  const grandOpeningCredit = rows.reduce((s, r) => s + r.opening_credit, 0)
  const grandDebit = rows.reduce((s, r) => s + r.debit, 0)
  const grandCredit = rows.reduce((s, r) => s + r.credit, 0)
  const grandClosingDebit = rows.reduce((s, r) => s + r.closing_debit, 0)
  const grandClosingCredit = rows.reduce((s, r) => s + r.closing_credit, 0)

  return (
    <div className="flex flex-col gap-4">
      {defaultFY && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Fiscal Year: <span className="font-medium text-foreground">{defaultFY.name}</span>
              {" "}&middot;{" "}
              {defaultFY.start_date} to {defaultFY.end_date}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Trial Balance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Opening (Dr)</TableHead>
                <TableHead className="text-right">Opening (Cr)</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Closing (Dr)</TableHead>
                <TableHead className="text-right">Closing (Cr)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    No data for this period. Submit journal entries to see balances.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(row => (
                  <TableRow key={row.account_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {row.account_number && (
                          <span className="font-mono text-xs text-muted-foreground">{row.account_number}</span>
                        )}
                        <span className="text-sm font-medium text-foreground">{row.account_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${ROOT_TYPE_COLORS[row.root_type] || ""}`}>{row.root_type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.opening_debit > 0 ? formatCurrency(row.opening_debit) : "-"}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.opening_credit > 0 ? formatCurrency(row.opening_credit) : "-"}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.debit > 0 ? formatCurrency(row.debit) : "-"}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.credit > 0 ? formatCurrency(row.credit) : "-"}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.closing_debit > 0 ? formatCurrency(row.closing_debit) : "-"}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.closing_credit > 0 ? formatCurrency(row.closing_credit) : "-"}</TableCell>
                  </TableRow>
                ))
              )}
              {rows.length > 0 && (
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>Grand Total</TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(grandOpeningDebit)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(grandOpeningCredit)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(grandDebit)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(grandCredit)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(grandClosingDebit)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(grandClosingCredit)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
