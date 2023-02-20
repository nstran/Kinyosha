using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.WareHouse
{
    public class GetInventoryDeliveryVoucherByIdParameter:BaseParameter
    {
        public int WarehouseType { get; set; }
        public Guid Id { get; set; }
    }
}
