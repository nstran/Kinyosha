export class InventoryReceivingVoucherModel {
  InventoryReceivingVoucherId: string
  InventoryReceivingVoucherCode: string
  StatusId: string
  Active: boolean
  UpdatedDate: Date
  UpdatedById: string
  Description: string
  Note: string
  ObjectId: string
  Storekeeper: string
  InventoryReceivingVoucherTime: Date
  LicenseNumber: number = 0
  ExpectedDate: Date
  PartnersId: string
  InventoryReceivingVoucherCategory: number

  InventoryReceivingVoucherType: number; // loại phiếu
  InventoryReceivingVoucherTypeName: string; // tên phiếu
  InventoryReceivingVoucherDate: Date; //ngày nhận
  // inventoryReceivingVoucherTime: string;
  PartnersName: string;
  CreatedName: string
  StatusName: string

  // licenseNumber: number;
  OrderDate: Date //ngày đặt hàng
  CreatedDate: Date; // ngày tạo
  CreatedById: string; //người lập phiếu
  WarehouseCategoryTypeId: string //loại kho
  ShiperName: string //giao hàng
  InvoiceNumber: number; //số hóa đơn
  InvoiceDate: Date; // Ngày
  ProducerName: string //Tên nhà sản xuất
  OrderNumber: number
  WarehouseId: string // id kho nhận

  BoxGreen: number
  BoxGreenMax: number
  PalletMax: number
  PalletNormal: number
  BoxBlue: number
  PalletSmall: number

  VendorId: string

  constructor() {
    // this.active = true;
  }
}
