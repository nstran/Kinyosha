
export class OrderCostDetail {
    orderCostDetailId: string;
    costId: string;
    orderId: string;
    quantity: number;
    unitPrice: number;
    costName: string;
    costCode: string;
    active: boolean;
    createdById: string;
    createdDate: Date;
    updatedById: string;
    updatedDate: Date;
    sumAmount: number;
    isInclude: boolean;
  
    constructor() {
      this.orderCostDetailId = '00000000-0000-0000-0000-000000000000',
      this.costId = '',
      this.orderId = '00000000-0000-0000-0000-000000000000',
      this.quantity = 0,
      this.unitPrice = 0,
      this.costName = '',
      this.active = true,
      this.createdById = '00000000-0000-0000-0000-000000000000',
      this.createdDate = new Date(),
      this.updatedById = null,
      this.updatedDate = null
    }
  }