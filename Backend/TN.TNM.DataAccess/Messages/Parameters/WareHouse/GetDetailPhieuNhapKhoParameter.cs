using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.WareHouse
{
    public class GetDetailPhieuNhapKhoParameter : BaseParameter
    {
        public int WarehouseType { get; set; }
        public Guid InventoryReceivingVoucherId { get; set; }
    }
}
