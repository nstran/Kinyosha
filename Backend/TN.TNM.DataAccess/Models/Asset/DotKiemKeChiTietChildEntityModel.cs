using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Asset
{
    public class DotKiemKeChiTietChildEntityModel
    {
        public long DotKiemKeChiTietChildId { get; set; }
        public long DotKiemKeChiTietId { get; set; }
        public Guid OrganizationId { get; set; }
        public string OrganizationCode { get; set; }
        public decimal SoLuong { get; set; }
    }
}
