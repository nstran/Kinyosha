using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.WareHouse
{
    public class GetMasterDataListPhieuNhapKhoParameter : BaseParameter
    {
        public int WareHouseType { get; set; } 
        public int ProductType { get; set; }
    }
}
