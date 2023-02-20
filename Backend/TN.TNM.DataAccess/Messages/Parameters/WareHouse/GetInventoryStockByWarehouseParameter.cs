using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.WareHouse;

namespace TN.TNM.DataAccess.Messages.Parameters.WareHouse
{
    public class GetInventoryStockByWarehouseParameter : BaseParameter
    {
        public Guid WarehouseId { get; set; }
        public int InventoryType { get; set; }
    }
}
