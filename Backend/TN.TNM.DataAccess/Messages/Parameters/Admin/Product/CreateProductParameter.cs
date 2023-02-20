using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models.Product;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin.Product
{
    public class CreateProductParameter : BaseParameter
    {
        public ProductEntityModel Product { get; set; }
        //public List<ConfigurationProductEntityModel> ListConfigurationProductEntity { get; set; } //định mức NVL thành phẩm
        public List<ProductVendorMapping> ListProductVendorMapping { get; set; }
    }
}
