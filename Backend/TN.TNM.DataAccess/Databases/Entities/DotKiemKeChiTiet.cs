using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class DotKiemKeChiTiet
    {
        public long DotKiemKeChiTietId { get; set; }
        public long DotKiemKeId { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; }
        public Guid? ProductUnit { get; set; }
        public decimal? Tondauky { get; set; }
        public decimal? Nhapkho { get; set; }
        public decimal? Xuatkho { get; set; }
        public decimal Toncuoiky { get; set; }
        public decimal Checkkiemtra { get; set; }
        public decimal Ckecknhapga { get; set; }
        public decimal Checktra { get; set; }
        public decimal Checkpending { get; set; }
        public decimal CheckTncc { get; set; }
        public decimal Tong { get; set; }
        public decimal Chenhlech { get; set; }
        public Guid? Loaihang { get; set; }
        public string Note { get; set; }
        public Guid? TenantId { get; set; }
    }
}
