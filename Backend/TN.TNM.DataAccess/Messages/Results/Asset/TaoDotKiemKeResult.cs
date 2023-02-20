using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Results.Asset
{
    public class TaoDotKiemKeResult: BaseResult
    {

    }

    //public class DotKiemKe
    //{
    //    public int Thang { get; set; }
    //    public string TenDotKiemKe { get; set; }
    //    public List<KhoKiemKe> ListKhoKiemKe { get; set; }
    //}

    public class KhoKiemKe
    {
        public Guid KhoId { get; set; }
        public string KhoName { get; set; }
        public string TrangThai { get; set; }
        public List<DanhSachKiemKe> ListDanhSachKiemKe { get; set; }
    }

    public class DanhSachKiemKe
    {
        public Guid? ProductId { get; set; }
        public string ProductCode { get; set; }
        public Guid? ProductUnit { get; set; }
        public string ProductUnitName { get; set; }
        public decimal? Tondauky { get; set; }
        public decimal? Nhapkho { get; set; }
        public decimal? Xuatkho { get; set; }
        public decimal? Toncuoiky { get; set; }
        public decimal? Checkkiemtra { get; set; }
        public decimal? Ckecknhapga { get; set; }
        public decimal? Checktra { get; set; }
        public decimal? Checkpending { get; set; }
        public decimal? CheckTNCC { get; set; }
        public decimal? Tong { get; set; }
        public decimal? Chenhlech { get; set; }
        public Guid? Loaihang { get; set; }
        public string Note { get; set; }
        public decimal? CF { get; set; }
        public decimal? MB { get; set; }
        public decimal? MBPFC { get; set; }
        public decimal? PFA { get; set; }
        public decimal? GaNhua { get; set; }
        public decimal? PFC { get; set; }
        public decimal? KJP { get; set; }
        public decimal? QAMB { get; set; }
        public decimal? QAFC { get; set; }
        public decimal? KTSX { get; set; }
        public decimal? ISO { get; set; }
        public decimal? HK { get; set; }
        public decimal? TIEUHUY { get; set; }
        public decimal? ADM { get; set; }
        public Guid? WarehouseId { get; set; }
    }
}
