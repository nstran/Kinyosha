using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.WareHouse
{
    public class ChiTietSanPhamPhieuXuatKho
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public DateTime? NgayXuat { get; set; }
        public decimal? Quantity { get; set; }
        public string ProductUnitName { get; set; }
        public string ProductCategoryName { get; set; }
        public string TenPhieuXuat { get; set; }
        public string OrganizationName { get; set; }
        public Guid InventoryDeliveryVoucherId { get; set; }
    }
}
