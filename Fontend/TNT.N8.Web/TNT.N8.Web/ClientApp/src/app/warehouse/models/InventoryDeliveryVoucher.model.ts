export class InventoryDeliveryVoucher{
  InventoryDeliveryVoucherId: string;
  InventoryDeliveryVoucherCode: string;
  StatusId: string;
  InventoryDeliveryVoucherType: number;
  WarehouseId: string;
  ObjectId: string;
  Receiver: string;
  Reason: string;
  InventoryDeliveryVoucherDate: Date;
  InventoryDeliveryVoucherTime: Date;
  LicenseNumber: number;
  Active: boolean;
  CreatedDate: Date;
  CreatedById: string;
  NameObject: string;
  NameOutOfStock: string;
  NameCreate: string;
  NameStatus: string;
}

export class InventoryDeliveryVoucherModel {
  inventoryDeliveryVoucherId: string;
  inventoryDeliveryVoucherCode: string;
  statusId: string;
  statusName: string;
  inventoryDeliveryVoucherType: number;
  inventoryDeliveryVoucherTypeName: string;
  warehouseId: string;
  wareHouseReceivingId: string;
  objectId: string;
  organizationId: string;
  receiverId: string;
  note: string;
  reason: string;
  department: string;
  inventoryDeliveryVoucherDate: Date;
  inventoryDeliveryVoucherTime: Date;
  licenseNumber: number;
  active: boolean;
  createdDate: Date;
  createdById: string;
  nameObject: string;
  nameOutOfStock: string;
  nameCreate: string;
  nameStatus: string;
  warehouseCategory: number;
  inventoryDeliveryVoucherScreenType: number;
  orderNumber: string;
}
