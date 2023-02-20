using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Product
{
    public class ProductLotNoMappingEntityModel
    {
        public Guid ProductLotNoMappingId { get; set; }
        public Guid ProductId { get; set; }
        public long? LotNoId { get; set; }
        public string LotNoName { get; set; }
        public decimal Quantity { get; set; } //So luong nhap, su dung o phieu nhap
        public decimal QuantityInventory { get; set; } // luu Tồn kho theo LotNo, su dung o phieu xuat
        public decimal QuantityRequest { get; set; } // so luong de nghi
        public decimal QuantityDelivery { get; set; } // So luong giao
        public bool? PackagingStatus { get; set; }
        public bool? ProductStatus { get; set; }
        public string Note { get; set; }
    }
}
