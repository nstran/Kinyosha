using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;

namespace TN.TNM.DataAccess.Models.Product
{
    public class ProductDeliveryEntityModel
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public List<ProductLotNoMappingEntityModel> ListProductLotNoMapping { get; set; }
        public decimal QuantityInventory { get; set; } // luu Tồn kho theo product
        public Guid? UnitId { get; set; }
        public string UnitName { get; set; }
    }
}
