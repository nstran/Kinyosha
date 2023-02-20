using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Asset;

namespace TN.TNM.DataAccess.Messages.Results.Asset
{
    public class CanBangDotKiemKeDetailResult : BaseResult
    {
        public List<PhieuCanBang> ListNhapCanBang { get; set; }
        public List<PhieuCanBang> ListXuatCanBang { get; set; }
    }

    public class PhieuCanBang
    {
        public long DotKiemKeChiTietId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string DonVi { get; set; }
        public decimal SoLuongCanNhap { get; set; }
        public decimal SoLuongCanXuat { get; set; }
        public int TrangThaiId { get; set; } //1= Đã cập nhật Lot.No ,0= Chua cập nhật Lot.No
        public string TrangThaiName { get; set; }
        public List<ProductLotNoPhieuCanBang> ListProductLotNoPhieuCanBang { get; set; }
    }
    public class ProductLotNoPhieuCanBang
    {
        public Guid ProductId { get; set; }
        public long? LotNoId { get; set; }
        public string LotNoName { get; set; }
        public decimal SoLuongTon { get; set; }
        public decimal SoLuong { get; set; }
    }
}
