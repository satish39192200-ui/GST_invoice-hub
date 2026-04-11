"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGstin = validateGstin;
exports.getStateFromGstin = getStateFromGstin;
exports.isSameState = isSameState;
exports.calculateGst = calculateGst;
exports.isReverseChargeApplicable = isReverseChargeApplicable;
exports.generateMockIRN = generateMockIRN;
exports.validateHsnCode = validateHsnCode;
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.getFinancialYear = getFinancialYear;
exports.getMonthPeriod = getMonthPeriod;
exports.parsePeriod = parsePeriod;
exports.calculateDueDate = calculateDueDate;
exports.isOverdue = isOverdue;
exports.generateInvoiceNumber = generateInvoiceNumber;
const constants_1 = require("./constants");
/**
 * Validate GSTIN format
 */
function validateGstin(gstin) {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin.toUpperCase());
}
/**
 * Get state name from GSTIN
 */
function getStateFromGstin(gstin) {
    const stateCode = gstin.substring(0, 2);
    return constants_1.GST_STATES[stateCode] || 'Unknown';
}
/**
 * Check if same state (for CGST+SGST vs IGST)
 */
function isSameState(gstin1, gstin2) {
    return gstin1.substring(0, 2) === gstin2.substring(0, 2);
}
/**
 * Calculate GST amounts for an item
 */
function calculateGst(taxableValue, cgstRate, sgstRate, igstRate, sameState) {
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    if (sameState) {
        cgstAmount = (taxableValue * cgstRate) / 100;
        sgstAmount = (taxableValue * sgstRate) / 100;
    }
    else {
        igstAmount = (taxableValue * igstRate) / 100;
    }
    const totalTax = cgstAmount + sgstAmount + igstAmount;
    const totalAmount = taxableValue + totalTax;
    return {
        cgstAmount: Math.round(cgstAmount * 100) / 100,
        sgstAmount: Math.round(sgstAmount * 100) / 100,
        igstAmount: Math.round(igstAmount * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
    };
}
/**
 * Calculate reverse charge applicability
 */
function isReverseChargeApplicable(supplierGstin, recipientGstin, hsnCode) {
    // Check for reverse charge scenarios
    // 1. Unregistered dealer supply
    // 2. Specific goods/services under RCM
    const rcmHsnCodes = ['1401', '1402', '1403', '1404', '1405']; // Example
    return rcmHsnCodes.includes(hsnCode.substring(0, 4));
}
/**
 * Generate mock IRN (Invoice Reference Number)
 */
function generateMockIRN(gstin, invoiceNumber, invoiceDate) {
    const timestamp = invoiceDate.getTime().toString(36).toUpperCase();
    const gstinPart = gstin.substring(gstin.length - 4);
    const invoicePart = invoiceNumber.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${gstinPart}${invoicePart}${timestamp}${random}`;
}
/**
 * Validate HSN code
 */
function validateHsnCode(hsnCode, turnover) {
    if (turnover > 500000000) { // > 5 Crore
        return /^[0-9]{6}$/.test(hsnCode);
    }
    else {
        return /^[0-9]{4,6}$/.test(hsnCode);
    }
}
/**
 * Format currency for display
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}
/**
 * Format date for display
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}
/**
 * Get financial year
 */
function getFinancialYear(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    if (month >= 3) { // April onwards
        return `${year}-${(year + 1).toString().substring(2)}`;
    }
    else {
        return `${year - 1}-${year.toString().substring(2)}`;
    }
}
/**
 * Get month in format MM-YYYY
 */
function getMonthPeriod(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
}
/**
 * Parse period string to date range
 */
function parsePeriod(period) {
    const [month, year] = period.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
}
/**
 * Calculate due date based on payment terms
 */
function calculateDueDate(invoiceDate, terms) {
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + terms);
    return dueDate;
}
/**
 * Check if invoice is overdue
 */
function isOverdue(dueDate) {
    return new Date() > new Date(dueDate);
}
/**
 * Generate invoice number with prefix
 */
function generateInvoiceNumber(prefix = 'INV', sequence) {
    const year = new Date().getFullYear();
    const seq = sequence.toString().padStart(6, '0');
    return `${prefix}/${year}/${seq}`;
}
//# sourceMappingURL=gstHelpers.js.map