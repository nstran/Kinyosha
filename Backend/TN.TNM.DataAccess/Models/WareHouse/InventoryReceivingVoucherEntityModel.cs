using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;

namespace TN.TNM.DataAccess.Models.WareHouse
{
    public class InventoryReceivingVoucherEntityModel : BaseModel<InventoryReceivingVoucher>
    {
        public Guid? InventoryReceivingVoucherId { get; set; }
        public string InventoryReceivingVoucherCode { get; set; }
        public Guid? StatusId { get; set; }
        public int InventoryReceivingVoucherType { get; set; } //Loại phiếu
        public string InventoryReceivingVoucherTypeName { get; set; } //Tên loại phiếu
        public bool? Active { get; set; }
        public DateTime InventoryReceivingVoucherDate { get; set; }    //Ngày nhập kho
        public DateTime? CreatedDate { get; set; } //Ngày lập phiếu (Tạo phiếu)
        public Guid? CreatedById { get; set; } //UserId người lập phiếu (Tạo phiếu)
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public string Description { get; set; }
        public string Note { get; set; }
        public string VendorName { get; set; } //Tên nhà cung cấp
        public Guid? VendorId { get; set; }
        public string CreatedName { get; set; } //Tên người lập phiếu
        public string StatusName { get; set; } //Tên trạng thái
        public int IntStatus { get; set; }
        public string ProducerName { get; set; }
        public string OrderNumber { get; set; }
        public DateTime? OrderDate { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public int? BoxGreen { get; set; }
        public int? BoxGreenMax { get; set; }
        public int? PalletMax { get; set; }
        public int? PalletNormal { get; set; }
        public int? BoxBlue { get; set; }
        public int? PalletSmall { get; set; }
        public Guid? ObjectId { get; set; }
        public Guid? WarehouseCategoryTypeId { get; set; } // Loai KHO con của NVL,CCDC, CSX=CF, NG-CF,TP
        
        public Guid WarehouseId { get; set; }
        public string ShiperName { get; set; } //Đại điện giao hàng
        public Guid? Storekeeper { get; set; }
        public TimeSpan? InventoryReceivingVoucherTime { get; set; }
        public int? LicenseNumber { get; set; }
        public DateTime? ExpectedDate { get; set; } //Ngày gửi dự kiến
        public Guid? PartnersId { get; set; } //Id đối tác
        public int? InventoryReceivingVoucherCategory { get; set; }
        public decimal QuantityActual { get; set; }
        public InventoryReceivingVoucherEntityModel()
        {
        }

        public InventoryReceivingVoucherEntityModel(DataAccess.Databases.Entities.InventoryReceivingVoucher entity)
        {
            Mapper(entity, this);
        }

        public override DataAccess.Databases.Entities.InventoryReceivingVoucher ToEntity()
        {
            var entity = new DataAccess.Databases.Entities.InventoryReceivingVoucher();
            Mapper(this, entity);
            return entity;
        }
    }
}
