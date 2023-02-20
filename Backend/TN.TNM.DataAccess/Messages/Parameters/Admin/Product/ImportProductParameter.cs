using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models.Product;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin.Product
{
    public class ImportProductParameter : BaseParameter
    {
        public List<ProductEntityModel> ListProduct { get; set; }
        public List<ProductVendorMapping> ListProductVendorMapping { get; set; }

    }
}
