using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Http;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models.WareHouse;

namespace TN.TNM.DataAccess.Messages.Parameters.WareHouse
{
    public class CreatePhieuNhapKhoParameter : BaseParameter
    {
        public int WarehouseType { get; set; }
        public InventoryReceivingVoucherEntityModel InventoryReceivingVoucher { get; set; }
        public List<InventoryReceivingVoucherMappingEntityModel> ListInventoryReceivingVoucherMapping { get; set; }
    }
}

