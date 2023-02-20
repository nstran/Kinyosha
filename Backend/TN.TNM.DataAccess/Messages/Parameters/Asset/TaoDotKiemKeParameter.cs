using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Asset
{
    public class TaoDotKiemKeParameter: BaseParameter
    {
        public int? DotKiemKeId { get; set; }
        public DateTime ThangKiemKe { get; set; }
        public Guid? WarehouseId { get; set; } //kho kiểm kê
    }
}
