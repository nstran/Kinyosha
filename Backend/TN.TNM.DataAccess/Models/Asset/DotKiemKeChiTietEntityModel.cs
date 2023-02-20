using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Asset
{
    public class DotKiemKeChiTietEntityModel
    {
        public long DotKiemKeChiTietId { get; set; }
        public long DotKiemKeId { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? TenantId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public Guid? ProductUnit { get; set; }
        public string ProductUnitName { get; set; }
        public decimal? Tondauky { get; set; }
        public decimal? Nhapkho { get; set; }
        public decimal? Xuatkho { get; set; }
        public decimal Toncuoiky { get; set; }
        public decimal Checkkiemtra { get; set; }
        public decimal Ckecknhapga { get; set; }
        public decimal Checktra { get; set; }
        public decimal Checkpending { get; set; }
        public decimal CheckTncc { get; set; }
        public decimal Tong { get { return Checkkiemtra + Ckecknhapga + Checktra + Checkpending + CheckTncc; } }
        public decimal Chenhlech { get { return Tong - Toncuoiky; } }
        public Guid? Loaihang { get; set; }
        public string TenLoaihang { get; set; }
        public string Note { get; set; }
        public List<DotKiemKeChiTietChildEntityModel> ListDotKiemKeChiTietChildEntityModel { get; set; }
    }
}
