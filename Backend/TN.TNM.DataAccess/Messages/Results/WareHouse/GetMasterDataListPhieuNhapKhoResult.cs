using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.Vendor;
using TN.TNM.DataAccess.Models.WareHouse;

namespace TN.TNM.DataAccess.Messages.Results.WareHouse
{
    public class GetMasterDataListPhieuNhapKhoResult : BaseResult
    {
        public List<ProductEntityModel> ListProduct { get; set; }
        public List<VendorEntityModel> ListVendor { get; set; }
    }
}
