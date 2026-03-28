"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, FolderOpen, Folder, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Account } from "@/lib/erp/types"

const ROOT_TYPE_COLORS: Record<string, string> = {
  Asset: "bg-blue-100 text-blue-800",
  Liability: "bg-amber-100 text-amber-800",
  Income: "bg-emerald-100 text-emerald-800",
  Expense: "bg-red-100 text-red-800",
  Equity: "bg-violet-100 text-violet-800",
}

function AccountNode({ account, depth = 0 }: { account: Account; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1)
  const hasChildren = account.children && account.children.length > 0

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
          hasChildren ? "cursor-pointer" : "cursor-default"
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {account.is_group ? (
          expanded ? <FolderOpen className="h-4 w-4 shrink-0 text-primary" /> : <Folder className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        <span className="flex-1 truncate font-medium text-foreground">
          {account.account_number && (
            <span className="mr-2 font-mono text-xs text-muted-foreground">{account.account_number}</span>
          )}
          {account.name}
        </span>

        {account.account_type && (
          <Badge variant="outline" className="ml-2 text-[10px] font-normal">
            {account.account_type}
          </Badge>
        )}

        <Badge className={cn("ml-1 text-[10px]", ROOT_TYPE_COLORS[account.root_type] || "")}>
          {account.root_type}
        </Badge>
      </button>

      {expanded && hasChildren && (
        <div>
          {account.children!.map(child => (
            <AccountNode key={child.id} account={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function AccountTreeClient({ accounts, tree }: { accounts: Account[]; tree: Account[] }) {
  const rootGroups = tree.reduce((acc, account) => {
    const type = account.root_type
    if (!acc[type]) acc[type] = []
    acc[type].push(account)
    return acc
  }, {} as Record<string, Account[]>)

  const rootOrder = ["Asset", "Liability", "Equity", "Income", "Expense"]

  return (
    <div className="grid gap-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {rootOrder.map(type => {
          const count = accounts.filter(a => a.root_type === type && !a.is_group).length
          return (
            <Card key={type}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {type}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-[11px] text-muted-foreground">leaf accounts</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tree */}
      <Card>
        <CardContent className="p-2">
          {rootOrder.map(type => (
            <div key={type}>
              {(rootGroups[type] ?? []).map(account => (
                <AccountNode key={account.id} account={account} depth={0} />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
