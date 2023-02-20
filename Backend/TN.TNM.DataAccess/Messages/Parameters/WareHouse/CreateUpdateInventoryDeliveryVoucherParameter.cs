using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models.WareHouse;

namespace TN.TNM.DataAccess.Messages.Parameters.WareHouse
{
    public class CreateUpdateInventoryDeliveryVoucherParameter : BaseParameter
    {
        public int ScreenType { get; set; } 
        public InventoryDeliveryVoucher InventoryDeliveryVoucher { get; set; }
        public List<InventoryDeliveryVoucherMappingEntityModel> InventoryyDeliveryVoucherMapping { get; set; }
        public string NoteContent { get; set; }

    }
}
