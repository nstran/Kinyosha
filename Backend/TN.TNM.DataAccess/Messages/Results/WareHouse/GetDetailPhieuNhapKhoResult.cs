using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Asset;
using TN.TNM.DataAccess.Models.Customer;
using TN.TNM.DataAccess.Models.Folder;
using TN.TNM.DataAccess.Models.Note;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.Vendor;
using TN.TNM.DataAccess.Models.WareHouse;

namespace TN.TNM.DataAccess.Messages.Results.WareHouse
{
    public class GetDetailPhieuNhapKhoResult : BaseResult
    {
        public List<WareHouseEntityModel> ListWarehouse { get; set; }
        public PhieuNhapKhoModel PhieuNhapKho { get; set; }
        public List<SanPhamPhieuNhapKhoModel> ListItemDetail { get; set; }
        public List<ProductEntityModel> ListProduct { get; set; }
        public List<NoteEntityModel> NoteHistory { get; set; }
        public List<SanPhamPhieuNhapKhoModel> ListItemGroup { get; set; }
        public List<DotKiemKeEntityModel> ListDotKiemKe { get; set; }
    }
}
