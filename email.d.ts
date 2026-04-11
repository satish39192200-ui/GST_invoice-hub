export declare function sendEmail(to: string, subject: string, html: string): Promise<void>;
export declare function generateOtpEmailTemplate(otp: string, name: string): string;
export declare function generateInvoiceSharedEmailTemplate(invoiceNumber: string, sellerName: string, amount: number, link: string): string;
//# sourceMappingURL=email.d.ts.map