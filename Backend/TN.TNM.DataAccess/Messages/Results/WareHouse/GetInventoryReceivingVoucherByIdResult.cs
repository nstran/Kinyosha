using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models.Customer;
using TN.TNM.DataAccess.Models.Order;
using TN.TNM.DataAccess.Models.Vendor;
using TN.TNM.DataAccess.Models.WareHouse;
//using Entities = TN.TNM.DataAccess.Databases.Entities;

namespace TN.TNM.DataAccess.Messages.Results.WareHouse
{
    public class GetInventoryReceivingVoucherByIdResult:BaseResult
    {
        public InventoryReceivingVoucherEntityModel inventoryReceivingVoucher { get; set; }
        public List<GetVendorOrderDetailByVenderOrderIdEntityModel> inventoryReceivingVoucherMapping { get; set; }
    }
}
