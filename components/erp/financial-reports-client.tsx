"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { formatCurrency } from "@/lib/erp/format"
import type { TrialBalanceRow } from "@/lib/erp/types"

interface FinancialReportsClientProps {
  trialBalance: TrialBalanceRow[]
}

export function FinancialReportsClient({ trialBalance }: FinancialReportsClientProps) {
  const [tab, setTab] = useState("pnl")

  const pnl = useMemo(() => {
    const income = trialBalance.filter(r => r.root_type === "Income")
    const expense = trialBalance.filter(r => r.root_type === "Expense")
    const totalIncome = income.reduce((s, r) => s + r.closing_credit - r.closing_debit, 0)
    const totalExpense = expense.reduce((s, r) => s + r.closing_debit - r.closing_credit, 0)
    const netProfit = totalIncome - totalExpense
    return { income, expense, totalIncome, totalExpense, netProfit }
  }, [trialBalance])

  const bs = useMemo(() => {
    const assets = trialBalance.filter(r => r.root_type === "Asset")
    const liabilities = trialBalance.filter(r => r.root_type === "Liability")
    const equity = trialBalance.filter(r => r.root_type === "Equity")
    const totalAssets = assets.reduce((s, r) => s + r.closing_debit - r.closing_credit, 0)
    const totalLiabilities = liabilities.reduce((s, r) => s + r.closing_credit - r.closing_debit, 0)
    const totalEquity = equity.reduce((s, r) => s + r.closing_credit - r.closing_debit, 0)
    return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity }
  }, [trialBalance])

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
        <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
      </TabsList>

      <TabsContent value="pnl" className="mt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Income</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(pnl.totalIncome)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Expense</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold text-red-600">{formatCurrency(pnl.totalExpense)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Net Profit</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className={`text-2xl font-bold ${pnl.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(pnl.netProfit)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Income</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pnl.income.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No income entries</TableCell></TableRow>
                  ) : (
                    pnl.income.map(r => (
                      <TableRow key={r.account_id}>
                        <TableCell>
                          <span className="mr-2 font-mono text-xs text-muted-foreground">{r.account_number}</span>
                          {r.account_name}
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(r.closing_credit - r.closing_debit)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-semibold">Total Income</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{formatCurrency(pnl.totalIncome)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Expenses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pnl.expense.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No expense entries</TableCell></TableRow>
                  ) : (
                    pnl.expense.map(r => (
                      <TableRow key={r.account_id}>
                        <TableCell>
                          <span className="mr-2 font-mono text-xs text-muted-foreground">{r.account_number}</span>
                          {r.account_name}
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(r.closing_debit - r.closing_credit)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-semibold">Total Expenses</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{formatCurrency(pnl.totalExpense)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="bs" className="mt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Assets</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold text-foreground">{formatCurrency(bs.totalAssets)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Liabilities</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold text-foreground">{formatCurrency(bs.totalLiabilities)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Equity</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold text-foreground">{formatCurrency(bs.totalEquity)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {(["assets", "liabilities", "equity"] as const).map(section => {
            const rows = bs[section]
            const label = section.charAt(0).toUpperCase() + section.slice(1)
            const total = section === "assets" ? bs.totalAssets : section === "liabilities" ? bs.totalLiabilities : bs.totalEquity
            const isDebit = section === "assets"
            return (
              <Card key={section}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">{label}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.length === 0 ? (
                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No data</TableCell></TableRow>
                      ) : (
                        rows.map(r => (
                          <TableRow key={r.account_id}>
                            <TableCell className="text-sm">
                              <span className="mr-1 font-mono text-xs text-muted-foreground">{r.account_number}</span>
                              {r.account_name}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {formatCurrency(isDebit ? r.closing_debit - r.closing_credit : r.closing_credit - r.closing_debit)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-semibold">Total</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{formatCurrency(total)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </TabsContent>
    </Tabs>
  )
}
