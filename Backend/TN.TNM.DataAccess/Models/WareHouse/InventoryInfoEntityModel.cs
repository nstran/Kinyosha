using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.WareHouse
{
    public class InventoryInfoEntityModel
    {
        public Guid InventoryInfoEntityModelId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public Guid? ProductUnitId { get; set; }
        public string ProductUnitName { get; set; }
        public string VendorName { get; set; }
        public decimal StartInventory { get; set; }
        public decimal EndInventory { get; set; }
        public decimal QuantityDelivery { get; set; }
        public decimal QuantityReceiving { get; set; }
        public decimal Actual { get; set; }
        public Guid ProductCategoryId { get; set; }
        public string ProductCategoryName { get; set; }
        public Guid? WarehouseId { get; set; }
        public List<InventoryInfoLotNoEntityModel> ListInventoryInfoLotNoEntityModel { get; set; } = new List<InventoryInfoLotNoEntityModel>();
    }
    public class InventoryInfoLotNoEntityModel
    {
        public Guid InventoryInfoLotNoEntityModelId { get; set; }
        public Guid InventoryInfoEntityModelId { get; set; }
        public long LotNoId { get; set; }
        public string LotNoName { get; set; }
        public Guid ProductId { get; set; }
        public decimal StartInventory { get; set; }
        public decimal EndInventory { get; set; }
        public decimal QuantityDelivery { get; set; }
        public decimal QuantityReceiving { get; set; }
        public Guid? WarehouseId { get; set; }
        public List<InventoryInfoProductEntityModel> ListInventoryInfoProductEntityModel { get; set; } = new List<InventoryInfoProductEntityModel>();
    }
    public class InventoryInfoProductEntityModel
    {
        public Guid InventoryInfoProductEntityModelId { get; set; }
        public Guid InventoryInfoLotNoEntityModelId { get; set; }
        public long LotNoId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public Guid ProductUnitId { get; set; }
        public string ProductUnitName { get; set; }
        public decimal QuantityDelivery { get; set; }
        public decimal QuantityReceiving { get; set; }
        public string InventoryReceivingVoucherDate { get; set; } 
        public string InventoryDeliveryVoucherDate { get; set; }
        public decimal QuanlityInventory { get; set; }
        public Guid? WarehouseId { get; set; }
    }
    public class InventoryInfoTPEntityModel
    {
        public Guid InventoryInfoTPEntityModelId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public decimal TonKhoHienTai { get; set; }
        public decimal TonThangTruoc { get; set; }
        public decimal TonThangNay { get; set; }
        public decimal SanXuatThangNay { get; set; }
        public decimal XuatDiThangNay { get; set; }
        public Guid? WarehouseId { get; set; }
        public decimal MauTest { get; set; }
        public decimal Pending { get; set; }
        public List<InventoryInfoProductTPEntityModel> ListInventoryInfoProductTPEntityModel { get; set; } = new List<InventoryInfoProductTPEntityModel>();
    }
    public class InventoryInfoProductTPEntityModel
    {
        public Guid InventoryInfoProductTPEntityModelId { get; set; }
        public Guid InventoryInfoTPEntityModelId { get; set; }
        public Guid ProductId { get; set; }
        public string LotNoName { get; set; }
        public DateTime Date { get; set; } 
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public decimal QuantityReceiving { get; set; } 
        public decimal QuantityDelivery { get; set; } // so luong xuat
        public decimal EndInventory { get; set; } // ton cuối kỳ
        public decimal StartInventory { get; set; } // ton đầu kỳ
        public decimal QuantityOK { get; set; } // so luong OK
        public decimal QuantityNG { get; set; } // so luong NG
        public decimal ProductionNumber { get; set; } // so luong dau vao
    }
    
}
