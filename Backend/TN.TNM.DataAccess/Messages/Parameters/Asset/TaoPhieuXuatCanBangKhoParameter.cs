using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Messages.Results.Asset;

namespace TN.TNM.DataAccess.Messages.Parameters.Asset
{
    public class TaoPhieuXuatCanBangKhoParameter: BaseParameter
    {
        public Guid WarehouseId { get; set; }
        public List<PhieuCanBang> ListXuatCanBang { get; set; }
        //public List<ProductLotNoPhieuCanBang> ListProductLotNoPhieuCanBang { get; set; }
    }
}
