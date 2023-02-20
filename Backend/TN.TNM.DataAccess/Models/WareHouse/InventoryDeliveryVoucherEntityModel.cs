using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.WareHouse
{
    public class InventoryDeliveryVoucherEntityModel
    {
        public Guid InventoryDeliveryVoucherId { get; set; }
        public string InventoryDeliveryVoucherCode { get; set; }
        public Guid StatusId { get; set; }
        public int InventoryDeliveryVoucherType { get; set; } //Kho sản xuất, Kho hành chính or xuat huy nếu tạo mới phiếu xuất kho
        public string InventoryDeliveryVoucherTypeText { get; set; }
        public Guid WarehouseId { get; set; }
        public string WarehouseName { get; set; }
        public Guid? ObjectId { get; set; }
        public string Receiver { get; set; }
        public Guid? ReceiverId { get; set; }
        public string Reason { get; set; }
        public DateTime? InventoryDeliveryVoucherDate { get; set; } // Ngày xuất
        public TimeSpan? InventoryDeliveryVoucherTime { get; set; }
        public int LicenseNumber { get; set; }
        public bool Active { get; set; }
        public DateTime CreatedDate { get; set; } // Ngày đề nghị or ngày tạo
        public Guid CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? OrganizationId { get; set; }
        public string DepartmentName { get; set; }
        public string NameObject { get; set; }
        public string NameOutOfStock { get; set; }
        public string NameCreate { get; set; }
        public string NameStatus { get; set; }
        public string Note { get; set; }
        public int IntStatusDnx { get; set; }
        public Guid? VendorId { get; set; }
        public string VedorName { get; set; }
        public int? InventoryDeliveryVoucherCategory { get; set; }
        //public int? WarehouseRequest { get; set; }
        //public string WarehouseRequestText { get; set; }
        public int? InventoryDeliveryVoucherReason { get; set; } // Xuất hàng ngày, hàng tuần, hàng tháng, xuất văn phòng phẩm
        public string InventoryDeliveryVoucherReasonText { get; set; }
        public DateTime? Day { get; set; } //Ngày
        public DateTime? DateFrom { get; set; } //Từ Ngày
        public DateTime? DateTo { get; set; } //Đến ngày
        public DateTime? Month { get; set; } //Tháng
        public Guid? WarehouseReceivingId { get; set; } // Kho nhận
        public string WarehouseReceivingText { get; set; } //Tên kho Nhận
        public string EmployeeDepartment { get; set; } // Bộ phân quản lý kho
        public int? WarehouseCategory { get; set; } // KHO NVL,CCDC, CSX=CF, NG-CF,TP
        public int? InventoryDeliveryVoucherScreenType { get; set; } // 
        public string OrderNumber { get; set; }
        public string Quantity { get; set; }
        public Guid? ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public Guid? StateId { get; set; } // Công đoạn ID
        public string StateName { get; set; }// Công đoạn Name
        public string StateCode { get; set; }// Công đoạn Mã
        public string LotNoName { get; set; }// Lô sản xuất
        public long LotNoId { get; set; }// Lô sản xuất
    }
}
