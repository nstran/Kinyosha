using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class DotKiemKe
    {
        public long DotKiemKeId { get; set; }
        public string TenDotKiemKe { get; set; }
        public int TrangThaiId { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? TenantId { get; set; }
        public Guid? WarehouseId { get; set; }
        public DateTime? ThangKiemKe { get; set; }
    }
}
