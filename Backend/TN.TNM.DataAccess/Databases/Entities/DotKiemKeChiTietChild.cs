using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class DotKiemKeChiTietChild
    {
        public long DotKiemKeChiTietChildId { get; set; }
        public long DotKiemKeChiTietId { get; set; }
        public Guid OrganizationId { get; set; }
        public decimal SoLuong { get; set; }
    }
}
