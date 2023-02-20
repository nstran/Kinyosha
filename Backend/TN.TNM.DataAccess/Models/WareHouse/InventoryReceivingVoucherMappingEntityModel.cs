using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;

namespace TN.TNM.DataAccess.Models.WareHouse
{
    public class InventoryReceivingVoucherMappingEntityModel : BaseModel<InventoryReceivingVoucherMapping>
    {
        public Guid? InventoryReceivingVoucherMappingId { get; set; }
        public Guid? InventoryReceivingVoucherId { get; set; }
        public Guid ProductId { get; set; }
        public decimal? QuantityActual { get; set; }
        public Guid? WarehouseId { get; set; }
        public string Description { get; set; }
        public bool? Active { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? UnitId { get; set; }
        public bool? PackagingStatus { get; set; }
        public bool? ProductStatus { get; set; }
        public long? LotNoId { get; set; }
        public string LotNoName { get; set; }
        public decimal QuantityOk { get; set; }
        public decimal QuantityPending { get; set; }
        public decimal QuantityNg { get; set; }
        public decimal QuantityProduct { get; set; }
        public InventoryReceivingVoucherMappingEntityModel()
        {
        }

        public InventoryReceivingVoucherMappingEntityModel(DataAccess.Databases.Entities.InventoryReceivingVoucherMapping entity)
        {
            Mapper(entity, this);
            //Xu ly sau khi lay tu DB len
        }

        public override DataAccess.Databases.Entities.InventoryReceivingVoucherMapping ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.InventoryReceivingVoucherMapping();
            Mapper(this, entity);
            return entity;
        }
    }
}
