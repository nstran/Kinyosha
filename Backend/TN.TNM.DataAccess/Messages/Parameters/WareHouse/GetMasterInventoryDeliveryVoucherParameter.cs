using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Messages.Results;

namespace TN.TNM.DataAccess.Messages.Parameters.WareHouse
{
    public class GetMasterInventoryDeliveryVoucherParameter : BaseParameter
    {
        public int WarehouseType { get; set; }//NVL = 0, CCDC = 1, TSK = 2,  CSX = 3,  KTP = 4
        public int ProductType { get; set; }//NVL = 0, ThanhPham = 1, CCDC = 2
    }
}
