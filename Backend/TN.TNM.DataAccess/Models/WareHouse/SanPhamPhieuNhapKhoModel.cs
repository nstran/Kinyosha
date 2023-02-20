using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.WareHouse
{
    public class SanPhamPhieuNhapKhoModel
    {
        public Guid? InventoryReceivingVoucherMappingId { get; set; }
        public Guid? InventoryReceivingVoucherId { get; set; }
        public Guid? ProductId { get; set; }
        public decimal QuantityActual { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public string UnitName { get; set; }    //Đơn vị tính
        public bool? PackagingStatus { get; set; }
        public bool? ProductStatus { get; set; }
        public long? LotNoId { get; set; }
        public string LotNoName { get; set; }
        public decimal QuantityPending { get; set; }
        public decimal QuantityOK { get; set; }
        public decimal QuantityNG { get; set; }
        public decimal QuantityProduct { get; set; }
    }
}
