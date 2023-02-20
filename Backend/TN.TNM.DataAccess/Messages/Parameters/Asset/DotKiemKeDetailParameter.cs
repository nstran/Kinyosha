using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Asset
{
    public class DotKiemKeDetailParameter: BaseParameter
    {
        public long DotKiemKeId { get; set; }
        public Guid WarehouseId { get; set; }
        public bool RefreshData { get; set; }
    }
}
