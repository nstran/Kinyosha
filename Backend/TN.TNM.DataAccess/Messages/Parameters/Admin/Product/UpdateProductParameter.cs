using System;
using System.Collections.Generic;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.ProductAttributeCategory;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin.Product
{
    public class UpdateProductParameter : BaseParameter
    {
        public ProductEntityModel Product { get; set; }
        //public List<ConfigurationProductEntityModel> ListConfigurationProductEntity { get; set; } //Sửa lại cho định mức NVL thành phẩm
        public List<ProductVendorMapping> ListProductVendorMapping { get; set; }
    }
}
