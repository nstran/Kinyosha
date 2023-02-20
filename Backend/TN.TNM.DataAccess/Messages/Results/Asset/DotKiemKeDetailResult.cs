using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Address;
using TN.TNM.DataAccess.Models.Asset;
using TN.TNM.DataAccess.Models.DynamicColumnTable;
using TN.TNM.DataAccess.Models.Employee;

namespace TN.TNM.DataAccess.Messages.Results.Asset
{
    public class DotKiemKeDetailResult: BaseResult
    {
        public DotKiemKeEntityModel DotKiemKe { get; set; }
        public List<DotKiemKeChiTietEntityModel> ListDotKiemKeChiTiet { get; set; }
        public List<List<DataHeaderModel>> ListDataHeader { get; set; }
        public List<List<DataRowModel>> ListData { get; set; }
    }
}
