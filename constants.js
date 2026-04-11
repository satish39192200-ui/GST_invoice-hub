"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HSN_CODES = exports.UNITS = exports.PAYMENT_MODES = exports.GST_STATES = exports.NOTIFICATION_TYPES = exports.NOTE_TYPES = exports.USER_ROLES = exports.PAYMENT_STATUS = exports.INVOICE_STATUS = exports.GST_RATES = void 0;
exports.GST_RATES = {
    CGST: [0, 2.5, 6, 9, 14],
    SGST: [0, 2.5, 6, 9, 14],
    IGST: [0, 5, 12, 18, 28]
};
exports.INVOICE_STATUS = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    MODIFY_REQUESTED: 'MODIFY_REQUESTED',
    MISSING_REQUESTED: 'MISSING_REQUESTED',
    CANCELLED: 'CANCELLED'
};
exports.PAYMENT_STATUS = {
    PENDING: 'PENDING',
    PARTIAL: 'PARTIAL',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE'
};
exports.USER_ROLES = {
    SELLER: 'SELLER',
    BUYER: 'BUYER',
    ADMIN: 'ADMIN'
};
exports.NOTE_TYPES = {
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT'
};
exports.NOTIFICATION_TYPES = {
    INVOICE_RECEIVED: 'INVOICE_RECEIVED',
    INVOICE_ACCEPTED: 'INVOICE_ACCEPTED',
    INVOICE_REJECTED: 'INVOICE_REJECTED',
    INVOICE_MODIFIED: 'INVOICE_MODIFIED',
    PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
    CREDIT_NOTE_ISSUED: 'CREDIT_NOTE_ISSUED',
    DEBIT_NOTE_ISSUED: 'DEBIT_NOTE_ISSUED',
    MISSING_INVOICE_REQUEST: 'MISSING_INVOICE_REQUEST',
    SYSTEM: 'SYSTEM'
};
exports.GST_STATES = {
    '01': 'Jammu & Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chhattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '25': 'Daman & Diu',
    '26': 'Dadra & Nagar Haveli',
    '27': 'Maharashtra',
    '28': 'Andhra Pradesh',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman & Nicobar Islands',
    '36': 'Telangana',
    '37': 'Andhra Pradesh (New)'
};
exports.PAYMENT_MODES = [
    'UPI',
    'NEFT',
    'RTGS',
    'IMPS',
    'Cash',
    'Cheque',
    'Demand Draft',
    'Credit Card',
    'Debit Card',
    'Net Banking'
];
exports.UNITS = [
    'PCS', 'KGS', 'GMS', 'LTR', 'ML', 'MTR', 'FT', 'BOX', 'SET', 'BTL', 'PAC', 'BAG', 'ROLL'
];
exports.HSN_CODES = [
    { code: '1001', description: 'Wheat and meslin' },
    { code: '1006', description: 'Rice' },
    { code: '2401', description: 'Unmanufactured tobacco' },
    { code: '3004', description: 'Medicaments' },
    { code: '8471', description: 'Automatic data processing machines' },
    { code: '8517', description: 'Telephone sets' },
    { code: '8473', description: 'Parts of computers' },
    { code: '9992', description: 'IT Services' },
    { code: '9997', description: 'Other support services' },
    { code: '9983', description: 'Telecommunications services' }
];
//# sourceMappingURL=constants.js.map