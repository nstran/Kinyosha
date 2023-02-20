using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Product;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin.Product
{
    public class UpdateConfigurationProductMappingParameter : BaseParameter
    {
        public Guid ProductId { get; set; }
        public List<ConfigurationProductEntityModel> ListConfigurationProductEntity { get; set; } //Sửa lại cho định mức NVL thành phẩm
    }
}
