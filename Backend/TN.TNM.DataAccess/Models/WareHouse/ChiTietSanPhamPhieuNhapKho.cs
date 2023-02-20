using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.WareHouse
{
    public class ChiTietSanPhamPhieuNhapKho
    {
        public Guid? InventoryReceivingVoucherId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public DateTime NgayNhap { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? QuantityOk { get; set; }
        public decimal? QuantityPending { get; set; }
        public decimal? QuantityNg { get; set; }
        public string ProductUnitName { get; set; }
        public string ProductCategoryName { get; set; }
        public string LoaiPhieu { get; set; }
        public string TenPhieuNhap{ get; set; }
    }
}
