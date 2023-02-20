using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Asset
{
    public  class DotKiemKeEntityModel
    {
        public long DotKiemKeId { get; set; }
        public string TenDotKiemKe { get; set; } // Tên đợt
        public Guid? WarehouseId { get; set; }
        public string WarehouseName { get; set; }
        public int? TrangThaiId { get; set; }
        public string TenTrangThai { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? TenantId { get; set; }
        public DateTime ThangKiemKe { get; set; }
        public List<DotKiemKeEntityModel> ListDotKiemKeChild { get; set; }
    }
}
