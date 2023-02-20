export class ProcurementRequestItemModel {
    procurementRequestItemId: string;
    productId: string;
    productName: string;
    productCode: string;
    vendorId: string;
    vendorName: string;
    quantity: number;
    quantityApproval: number;
    unitPrice: number;
    currencyUnit: string;
    exchangeRate: number;
    unit: string;
    unitString: string;
    totalPrice: number;
    procurementRequestId: string;
    procurementPlanId: string;
    procurementPlanCode: string;
    createdById: string;
    createdDate: Date;
    updatedById: string;
    updatedDate: Date;
    description: string;
    orderDetailType: string;
    discountType: boolean;
    discountValue: number;
    vat: number;
    incurredUnit: string;
    orderNumber: number;
    warehouseId: string;

    constructor() {
        this.warehouseId = null;
    }
}