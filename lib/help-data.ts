// Help Center Content Data
// Covers all modules: Accounting, Selling, Stock, Store Management

export interface HelpArticle {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  module: "accounting" | "selling" | "stock" | "store" | "general"
  category: string
  tags: string[]
}

export interface HelpCategory {
  id: string
  name: string
  description: string
  module: "accounting" | "selling" | "stock" | "store" | "general"
  icon: string
}

export const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Learn the basics of using the admin dashboard",
    module: "general",
    icon: "rocket",
  },
  {
    id: "chart-of-accounts",
    name: "Chart of Accounts",
    description: "Understanding and managing your accounts structure",
    module: "accounting",
    icon: "book",
  },
  {
    id: "journal-entries",
    name: "Journal Entries",
    description: "Creating and managing double-entry bookkeeping",
    module: "accounting",
    icon: "file-text",
  },
  {
    id: "payments",
    name: "Payments",
    description: "Recording customer receipts and vendor payments",
    module: "accounting",
    icon: "credit-card",
  },
  {
    id: "thai-tax",
    name: "Thai Tax System",
    description: "VAT, WHT, and tax invoice requirements for Thailand",
    module: "accounting",
    icon: "receipt",
  },
  {
    id: "sales-invoices",
    name: "Sales Invoices",
    description: "Creating and managing sales invoices",
    module: "selling",
    icon: "receipt",
  },
  {
    id: "quotations",
    name: "Quotations",
    description: "Creating quotes and proposals for customers",
    module: "selling",
    icon: "clipboard-list",
  },
  {
    id: "customers",
    name: "Customer Management",
    description: "Managing customer records and credit terms",
    module: "selling",
    icon: "users",
  },
  {
    id: "stock-management",
    name: "Stock Management",
    description: "Managing inventory with stock entries",
    module: "stock",
    icon: "boxes",
  },
  {
    id: "warehouses",
    name: "Warehouses",
    description: "Setting up and managing warehouse locations",
    module: "stock",
    icon: "warehouse",
  },
  {
    id: "orders",
    name: "Order Processing",
    description: "Managing customer orders and fulfillment",
    module: "store",
    icon: "shopping-cart",
  },
  {
    id: "products",
    name: "Products & Variants",
    description: "Managing products and their variants",
    module: "store",
    icon: "package",
  },
]

export const helpArticles: HelpArticle[] = [
  // ==================== GENERAL ====================
  {
    id: "intro-dashboard",
    slug: "introduction-to-dashboard",
    title: "Introduction to the Admin Dashboard",
    summary: "An overview of the GreenLeaf admin dashboard and its modules.",
    module: "general",
    category: "getting-started",
    tags: ["overview", "navigation", "modules"],
    content: `
# Introduction to the Admin Dashboard

The GreenLeaf Admin Dashboard provides a comprehensive suite of tools for managing your organic food business. It's organized into several modules:

## Store Management
- **Orders**: Process and track customer orders
- **Products**: Manage your product catalog and variants
- **Inventory**: Track stock levels and set reorder points
- **Customers**: View customer information and order history
- **Analytics**: Monitor sales performance and trends

## Accounting
- **Chart of Accounts**: Set up your account structure
- **Journal Entries**: Record financial transactions
- **Payments**: Process receipts and payments
- **General Ledger**: View all accounting entries
- **Reports**: Generate financial statements

## Selling
- **Sales Invoices**: Create and manage invoices with Thai tax support
- **Quotations**: Prepare price quotes for customers
- **Pricing Rules**: Set up volume discounts and special pricing

## Stock
- **Stock Entries**: Record material receipts, issues, and transfers
- **Warehouses**: Manage multiple storage locations
- **Stock Ledger**: Track all inventory movements
- **Stock Balance**: View current stock quantities and values

## Navigation Tips
- Use the sidebar to navigate between modules
- The current section is highlighted in the sidebar
- Click your profile to access settings or logout
    `,
  },
  {
    id: "docstatus-workflow",
    slug: "document-workflow",
    title: "Document Status Workflow (Draft → Submitted → Cancelled)",
    summary: "Understanding the Frappe-style document workflow used throughout the system.",
    module: "general",
    category: "getting-started",
    tags: ["workflow", "docstatus", "submit", "cancel"],
    content: `
# Document Status Workflow

All major documents in the system follow a standard workflow with three states:

## Document States

### 0 - Draft
- Document can be freely edited
- No accounting or stock entries are created
- Can be deleted if needed
- Shows as "Draft" status

### 1 - Submitted
- Document is finalized and locked
- Accounting entries (GL) are automatically posted
- Stock entries affect inventory levels
- Cannot be directly edited
- Shows as "Submitted" status

### 2 - Cancelled
- Reverses all effects of submission
- GL entries are reversed (not deleted)
- Stock movements are reversed
- Document is preserved for audit trail
- Can be "amended" to create a corrected copy

## Best Practices

1. **Review Before Submit**: Always double-check amounts and details before submitting
2. **Don't Cancel Unless Necessary**: Cancellation leaves an audit trail; only cancel for genuine errors
3. **Use Amendments**: If you need to correct a submitted document, cancel and create an amendment
4. **Draft for Pending**: Keep documents as drafts until all information is confirmed
    `,
  },

  // ==================== THAI TAX ====================
  {
    id: "thai-vat-overview",
    slug: "thai-vat-overview",
    title: "Thai VAT System Overview",
    summary: "Understanding Thailand's 7% VAT system and compliance requirements.",
    module: "accounting",
    category: "thai-tax",
    tags: ["VAT", "Thailand", "tax", "7%"],
    content: `
# Thai VAT System Overview

Thailand's Value Added Tax (VAT) is a consumption tax applied to goods and services at a rate of **7%**.

## Key Concepts

### VAT Registration
- Businesses with annual revenue over 1.8 million THB must register for VAT
- Registered businesses collect VAT on sales and can claim input VAT on purchases
- Customers in the system can be marked as "VAT Registered"

### VAT Calculation Methods

**Prices Include VAT (ราคารวม VAT)**
- Total amount includes 7% VAT
- Net Amount = Total ÷ 1.07
- VAT Amount = Total - Net Amount

**Prices Exclude VAT (ราคาไม่รวม VAT)**
- Add 7% VAT to the price
- VAT Amount = Net Amount × 0.07
- Total = Net Amount + VAT Amount

### In the System
When creating sales invoices or quotations:
1. Toggle "Apply VAT 7%" to include VAT
2. Choose whether prices include or exclude VAT
3. The system automatically calculates net amount and VAT

### VAT Accounts
- **VAT Output Tax (ภาษีขาย)**: VAT collected from customers
- **VAT Input Tax (ภาษีซื้อ)**: VAT paid to suppliers (claimable)
    `,
  },
  {
    id: "thai-tax-invoice",
    slug: "thai-tax-invoice-requirements",
    title: "Tax Invoice Requirements (ใบกำกับภาษี)",
    summary: "Requirements for valid Thai tax invoices per Revenue Department regulations.",
    module: "accounting",
    category: "thai-tax",
    tags: ["tax invoice", "ใบกำกับภาษี", "compliance", "Revenue Department"],
    content: `
# Thai Tax Invoice Requirements

A **Tax Invoice (ใบกำกับภาษี)** is required for VAT-registered customers who want to claim input VAT.

## Required Elements

Every tax invoice must include:

1. **Header**: "ใบกำกับภาษี" (Tax Invoice) prominently displayed
2. **Tax Invoice Number**: Sequential number for the tax period
3. **Tax Invoice Date**: Date of issue (can differ from posting date)
4. **Seller Information**:
   - Company name
   - 13-digit Tax ID (เลขประจำตัวผู้เสียภาษี)
   - Branch (สำนักงานใหญ่ or branch number)
   - Address
5. **Buyer Information**:
   - Customer name
   - 13-digit Tax ID
   - Branch
   - Address
6. **Line Items**: Description, quantity, unit price, amount
7. **VAT Breakdown**: Net amount, VAT 7%, and total amount

## In the System

When creating a Sales Invoice:
1. Check "Issue Tax Invoice (ใบกำกับภาษี)"
2. Enter the buyer's 13-digit Tax ID
3. Specify the branch number
4. The system validates and formats the tax invoice

## Common Issues

- **Missing Tax ID**: Customer must provide their 13-digit tax ID
- **Wrong Branch**: Verify the correct branch is selected
- **Date Errors**: Tax invoice date should be within the tax period
    `,
  },
  {
    id: "thai-wht-overview",
    slug: "thai-withholding-tax",
    title: "Withholding Tax (หัก ณ ที่จ่าย)",
    summary: "Understanding Thailand's withholding tax system for business transactions.",
    module: "accounting",
    category: "thai-tax",
    tags: ["WHT", "withholding tax", "หัก ณ ที่จ่าย", "PND3", "PND53"],
    content: `
# Withholding Tax (หัก ณ ที่จ่าย)

Withholding Tax (WHT) is a tax deducted at source by the payer on behalf of the government.

## Common WHT Rates

| Income Type | Rate | Form |
|------------|------|------|
| Service fees (from company) | 3% | PND53 |
| Service fees (from individual) | 3% | PND3 |
| Professional fees | 3% | PND3/53 |
| Rental income | 5% | PND3/53 |
| Advertising fees | 2% | PND53 |

## How WHT Works

When a customer (payer) pays you:
1. They deduct WHT from the payment
2. They remit the WHT to the Revenue Department
3. They give you a WHT Certificate (หนังสือรับรองภาษีหัก ณ ที่จ่าย)
4. You can use this certificate to offset your income tax

### Example
- Invoice Amount: ฿107,000 (including 7% VAT)
- Net before VAT: ฿100,000
- VAT 7%: ฿7,000
- WHT 3% on ฿100,000: ฿3,000
- **Amount Due**: ฿107,000 - ฿3,000 = **฿104,000**

## In the System

When creating a Sales Invoice:
1. Select the appropriate WHT rate (1%, 2%, 3%, or 5%)
2. The system calculates WHT on the net amount (before VAT)
3. The outstanding amount reflects the actual payment expected
4. GL entries record the WHT receivable
    `,
  },

  // ==================== ACCOUNTING ====================
  {
    id: "coa-overview",
    slug: "chart-of-accounts-overview",
    title: "Chart of Accounts Overview",
    summary: "Understanding the account structure and types.",
    module: "accounting",
    category: "chart-of-accounts",
    tags: ["accounts", "chart", "structure", "types"],
    content: `
# Chart of Accounts Overview

The Chart of Accounts (COA) is the foundation of your accounting system. It organizes all accounts into a hierarchical structure.

## Account Types (Root Types)

### Assets
- What your business owns
- Normal balance: Debit
- Examples: Cash, Accounts Receivable, Inventory, Equipment

### Liabilities
- What your business owes
- Normal balance: Credit
- Examples: Accounts Payable, Loans, VAT Payable

### Equity
- Owner's stake in the business
- Normal balance: Credit
- Examples: Capital, Retained Earnings

### Income
- Revenue from business operations
- Normal balance: Credit
- Examples: Sales, Service Revenue

### Expenses
- Costs of running the business
- Normal balance: Debit
- Examples: Cost of Goods Sold, Rent, Salaries

## Account Hierarchy

Accounts can be organized in a tree structure:
- **Group Accounts**: Container accounts that hold child accounts
- **Leaf Accounts**: Actual accounts where transactions are posted

Example:
\`\`\`
Assets (Group)
├── Current Assets (Group)
│   ├── Cash (Leaf)
│   ├── Bank Accounts (Group)
│   │   ├── SCB Bank (Leaf)
│   │   └── Kasikorn Bank (Leaf)
│   └── Accounts Receivable (Leaf)
└── Fixed Assets (Group)
    └── Equipment (Leaf)
\`\`\`
    `,
  },
  {
    id: "journal-entry-basics",
    slug: "journal-entry-basics",
    title: "Creating Journal Entries",
    summary: "How to create and post manual journal entries.",
    module: "accounting",
    category: "journal-entries",
    tags: ["journal", "entry", "debit", "credit", "double-entry"],
    content: `
# Creating Journal Entries

Journal entries are the core of double-entry bookkeeping. Every transaction must have equal debits and credits.

## Types of Journal Entries

1. **Journal Entry**: General-purpose manual entry
2. **Bank Entry**: Bank-related transactions
3. **Cash Entry**: Cash transactions
4. **Credit Note**: Customer credit adjustments
5. **Debit Note**: Supplier debit adjustments
6. **Opening Entry**: Opening balances for new fiscal year

## How to Create a Journal Entry

1. Navigate to **Accounting → Journal Entries → New**
2. Select the entry type
3. Enter the posting date
4. Add line items with:
   - Account (select from chart of accounts)
   - Debit OR Credit amount
   - Optional: Cost Center, Party
5. Ensure total debits = total credits
6. Save as Draft
7. Review and Submit to post to the ledger

## The Golden Rules

**For Assets and Expenses:**
- Increase: Debit
- Decrease: Credit

**For Liabilities, Equity, and Income:**
- Increase: Credit
- Decrease: Debit

## Example: Recording a Bank Fee

| Account | Debit | Credit |
|---------|-------|--------|
| Bank Charges (Expense) | ฿500 | |
| Bank Account (Asset) | | ฿500 |
    `,
  },

  // ==================== SELLING ====================
  {
    id: "sales-invoice-basics",
    slug: "sales-invoice-basics",
    title: "Creating Sales Invoices",
    summary: "Step-by-step guide to creating sales invoices with Thai tax support.",
    module: "selling",
    category: "sales-invoices",
    tags: ["invoice", "sales", "billing", "tax invoice"],
    content: `
# Creating Sales Invoices

Sales Invoices are used to bill customers for goods or services. They can optionally include Thai tax invoice details.

## Creating an Invoice

### From Scratch
1. Navigate to **Selling → Sales Invoices → New**
2. Select a customer
3. Add line items:
   - Search for products by SKU or name, OR
   - Enter items manually
4. Set VAT and WHT options as needed
5. For tax invoices, enable "Issue Tax Invoice"
6. Save as Draft and review
7. Submit to post accounting entries

### From an Order
1. Open the order in **Store → Orders**
2. Click "Create Sales Invoice"
3. Items are pre-filled from the order
4. Add VAT and tax invoice details
5. Submit when ready

## Tax Settings

### VAT Options
- **Apply VAT 7%**: Toggle to include VAT
- **Prices Include VAT**: Whether entered prices include VAT

### Withholding Tax
- Select the WHT rate if applicable (1%, 2%, 3%, 5%)
- WHT is calculated on the net amount before VAT
- Outstanding amount is reduced by WHT

## After Submission

- GL entries are automatically created
- Accounts Receivable is debited
- Sales Revenue is credited
- VAT Output Tax is credited (if applicable)
- WHT Receivable is debited (if applicable)
    `,
  },
  {
    id: "quotation-basics",
    slug: "quotation-basics",
    title: "Creating Quotations",
    summary: "How to create price quotes for customers.",
    module: "selling",
    category: "quotations",
    tags: ["quotation", "quote", "proposal", "pricing"],
    content: `
# Creating Quotations

Quotations allow you to provide price estimates to customers before they commit to a purchase.

## Creating a Quotation

1. Navigate to **Selling → Quotations → New**
2. Select a customer
3. Set the posting date and validity period
4. Add line items:
   - Search for products by SKU or name
   - Enter custom items with descriptions
   - Set quantities and rates
5. Configure VAT settings
6. Save and submit

## Quotation Lifecycle

| Status | Description |
|--------|-------------|
| Draft | Can be edited, not yet sent |
| Open | Submitted and valid |
| Replied | Customer has responded |
| Ordered | Converted to sales order |
| Lost | Customer declined |
| Cancelled | Quotation cancelled |

## Best Practices

- Set appropriate validity periods (default: 30 days)
- Include detailed item descriptions
- Clearly state VAT inclusion/exclusion
- Follow up before expiry date
    `,
  },

  // ==================== STOCK ====================
  {
    id: "stock-entry-basics",
    slug: "stock-entry-basics",
    title: "Stock Entry Types and Usage",
    summary: "Understanding material receipts, issues, and transfers.",
    module: "stock",
    category: "stock-management",
    tags: ["stock", "inventory", "receipt", "issue", "transfer"],
    content: `
# Stock Entry Types

Stock Entries record all inventory movements in the system.

## Entry Types

### Material Receipt
- Use when: Receiving goods into a warehouse
- Target Warehouse: Required
- Source Warehouse: Not applicable
- Example: Receiving purchase order items

### Material Issue
- Use when: Issuing goods out of a warehouse
- Source Warehouse: Required
- Target Warehouse: Not applicable
- Example: Writing off damaged goods

### Material Transfer
- Use when: Moving goods between warehouses
- Source Warehouse: Required
- Target Warehouse: Required
- Example: Moving stock from Main to Bangkok warehouse

## Creating a Stock Entry

1. Navigate to **Stock → Stock Entries → New**
2. Select the entry type
3. Choose source/target warehouse(s)
4. Add items:
   - Search by SKU or product name
   - Enter quantity and valuation rate
5. Save as Draft and review
6. Submit to update stock levels

## Valuation

- **Valuation Rate**: Cost per unit
- **Amount**: Qty × Valuation Rate
- Stock value is tracked for inventory accounting

## Stock Ledger

All stock movements are recorded in the Stock Ledger with:
- Quantity change (+ or -)
- Running balance
- Valuation rate
- Reference to source document
    `,
  },
  {
    id: "warehouse-setup",
    slug: "warehouse-setup",
    title: "Setting Up Warehouses",
    summary: "How to configure warehouse locations for stock tracking.",
    module: "stock",
    category: "warehouses",
    tags: ["warehouse", "location", "setup", "inventory"],
    content: `
# Setting Up Warehouses

Warehouses are locations where inventory is stored. You can have multiple warehouses and track stock separately at each location.

## Warehouse Hierarchy

Warehouses can be organized in a tree structure:

\`\`\`
All Warehouses (Group)
├── Main Warehouse (Leaf)
├── Bangkok Region (Group)
│   ├── Bangkok Store (Leaf)
│   └── Bangkok DC (Leaf)
└── Chiang Mai (Leaf)
\`\`\`

## Types

- **Group**: Container for other warehouses
- **Leaf**: Actual storage location (where stock is held)

## Creating a Warehouse

1. Navigate to **Stock → Warehouses**
2. Click "New Warehouse"
3. Enter:
   - Name
   - Parent warehouse (optional)
   - Is Group (check if container)
   - Address (optional)
4. Save

## Best Practices

- Use meaningful names that indicate location
- Create groups for regions or types
- Only post stock to leaf warehouses
- Keep inactive warehouses marked as inactive
    `,
  },

  // ==================== STORE ====================
  {
    id: "order-processing",
    slug: "order-processing",
    title: "Order Processing Workflow",
    summary: "Managing customer orders from placement to delivery.",
    module: "store",
    category: "orders",
    tags: ["orders", "fulfillment", "status", "workflow"],
    content: `
# Order Processing Workflow

Orders flow through several statuses from placement to delivery.

## Order Statuses

| Status | Description |
|--------|-------------|
| Pending | New order, awaiting confirmation |
| Confirmed | Order accepted, preparing |
| Processing | Being prepared/packed |
| Shipped | Out for delivery |
| Delivered | Successfully delivered |
| Returned | Customer returned items |
| Cancelled | Order cancelled |

## Processing Steps

### 1. Review New Orders
- Check pending orders daily
- Verify payment and stock availability
- Confirm or contact customer if issues

### 2. Confirm Order
- Update status to "Confirmed"
- Reserve stock for the order

### 3. Prepare Order
- Update to "Processing"
- Pick and pack items
- Print packing slip

### 4. Ship Order
- Update to "Shipped"
- Enter tracking information
- Notify customer

### 5. Mark Delivered
- Update to "Delivered" when confirmed
- Optionally create sales invoice

## Creating Invoices from Orders

For completed orders:
1. Open the order detail page
2. Click "Create Sales Invoice"
3. Invoice is pre-filled with order items
4. Add tax invoice details if needed
5. Submit the invoice
    `,
  },
]

// Helper functions
export function getArticlesByModule(module: string): HelpArticle[] {
  return helpArticles.filter(a => a.module === module)
}

export function getArticlesByCategory(categoryId: string): HelpArticle[] {
  return helpArticles.filter(a => a.category === categoryId)
}

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return helpArticles.find(a => a.slug === slug)
}

export function getCategoriesByModule(module: string): HelpCategory[] {
  return helpCategories.filter(c => c.module === module || c.module === "general")
}

export function searchArticles(query: string): HelpArticle[] {
  const q = query.toLowerCase()
  return helpArticles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.summary.toLowerCase().includes(q) ||
    a.tags.some(t => t.toLowerCase().includes(q))
  )
}
