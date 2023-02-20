using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models.Asset;
using TN.TNM.DataAccess.Models.Customer;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.Vendor;
using TN.TNM.DataAccess.Models.WareHouse;

namespace TN.TNM.DataAccess.Messages.Results.WareHouse
{
    public class GetMasterDataPhieuNhapKhoResult : BaseResult
    {
        public List<WareHouseEntityModel> ListWarehouse { get; set; }
        public List<ProductEntityModel> ListProduct { get; set; }
        public string EmployeeDepartment { get; set; }
        public string NameCreate { get; set; }
        public List<DotKiemKeEntityModel> ListDotKiemKe { get; set; }
    }
}
