-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT,
    "role" TEXT NOT NULL DEFAULT 'SELLER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "sellerId" TEXT NOT NULL,
    "sellerGstin" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "buyerId" TEXT,
    "buyerGstin" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerAddress" TEXT,
    "placeOfSupply" TEXT NOT NULL,
    "reverseCharge" BOOLEAN NOT NULL DEFAULT false,
    "taxableAmount" REAL NOT NULL DEFAULT 0,
    "cgstAmount" REAL NOT NULL DEFAULT 0,
    "sgstAmount" REAL NOT NULL DEFAULT 0,
    "igstAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "totalTax" REAL NOT NULL DEFAULT 0,
    "roundOff" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "statusReason" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "pdfUrl" TEXT,
    "jsonData" TEXT,
    "irn" TEXT,
    "irnGeneratedAt" DATETIME,
    "itcClaimed" BOOLEAN NOT NULL DEFAULT false,
    "itcClaimedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "invoices_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hsnCode" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "taxableValue" REAL NOT NULL DEFAULT 0,
    "cgstRate" REAL NOT NULL DEFAULT 9,
    "cgstAmount" REAL NOT NULL DEFAULT 0,
    "sgstRate" REAL NOT NULL DEFAULT 9,
    "sgstAmount" REAL NOT NULL DEFAULT 0,
    "igstRate" REAL NOT NULL DEFAULT 18,
    "igstAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "inventoryId" TEXT,
    CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invoice_items_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "credit_debit_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noteNumber" TEXT NOT NULL,
    "noteType" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "noteDate" DATETIME NOT NULL,
    "taxableAmount" REAL NOT NULL DEFAULT 0,
    "cgstAmount" REAL NOT NULL DEFAULT 0,
    "sgstAmount" REAL NOT NULL DEFAULT 0,
    "igstAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "credit_debit_notes_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "credit_debit_notes_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "paymentDate" DATETIME NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "referenceNo" TEXT,
    "bankName" TEXT,
    "notes" TEXT,
    "isAdvance" BOOLEAN NOT NULL DEFAULT false,
    "advanceUsed" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hsnCode" TEXT NOT NULL,
    "description" TEXT,
    "quantity" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "reorderLevel" REAL NOT NULL DEFAULT 0,
    "purchasePrice" REAL NOT NULL DEFAULT 0,
    "salePrice" REAL NOT NULL DEFAULT 0,
    "cgstRate" REAL NOT NULL DEFAULT 9,
    "sgstRate" REAL NOT NULL DEFAULT 9,
    "igstRate" REAL NOT NULL DEFAULT 18,
    "lastPurchaseAt" DATETIME,
    "lastSaleAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoice_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "performedByRole" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_activities_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "gst_returns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "returnType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "summaryData" TEXT NOT NULL,
    "filed" BOOLEAN NOT NULL DEFAULT false,
    "filedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_gstin_key" ON "users"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_irn_key" ON "invoices"("irn");

-- CreateIndex
CREATE UNIQUE INDEX "credit_debit_notes_noteNumber_key" ON "credit_debit_notes"("noteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_userId_hsnCode_key" ON "inventory"("userId", "hsnCode");

-- CreateIndex
CREATE UNIQUE INDEX "gst_returns_userId_returnType_period_key" ON "gst_returns"("userId", "returnType", "period");
