using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Product
{
    public class ConfigurationProductMappingEntityModel : BaseModel<Databases.Entities.ConfigurationProductMapping>
    {
        #region Hungnq Add
        public ConfigurationProductMappingEntityModel()
        {

        }
        public override DataAccess.Databases.Entities.ConfigurationProductMapping ToEntity()
        {
            var entity = new DataAccess.Databases.Entities.ConfigurationProductMapping();
            Mapper(this, entity);
            return entity;
        }

        public ConfigurationProductMappingEntityModel(Databases.Entities.ConfigurationProductMapping model)
        {
            Mapper(model, this);
        }
        #endregion
        public Guid ConfigurationProductMappingId { get; set; }
        public Guid ConfigurationProductId { get; set; }
        public Guid ProductId { get; set; } // Mã nguyên vật liệu
        public Guid? StageGroupId { get; set; }
        public bool? ReuseNg { get; set; }
        public decimal? Quota { get; set; }
        public decimal? Consumption { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        #region Hungnq Add
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string StageGroupCode { get; set; }
        public string StageGroupName { get; set; }
        public string ProductUnitCode { get; set; }
        public string ProductUnitName { get; set; }  
        #endregion
    }
}
