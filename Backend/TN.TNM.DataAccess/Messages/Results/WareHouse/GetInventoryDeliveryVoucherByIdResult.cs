using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Asset;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.WareHouse;

namespace TN.TNM.DataAccess.Messages.Results.WareHouse
{
    public class GetInventoryDeliveryVoucherByIdResult:BaseResult
    {
        public InventoryDeliveryVoucherEntityModel inventoryDeliveryVoucher { get; set; }
        public List<InventoryDeliveryVoucherMappingEntityModel> inventoryDeliveryVoucherMappingModel { get; set; }
        public List<ProductEntityModel> ListProduct { get; set; }
        public List<InventoryDeliveryVoucherMappingEntityModel> ListItemGroup { get; set; }
        public List<DotKiemKeEntityModel> ListDotKiemKe { get; set; }
    }
}
