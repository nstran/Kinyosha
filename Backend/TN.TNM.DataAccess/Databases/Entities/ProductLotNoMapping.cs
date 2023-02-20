using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ProductLotNoMapping
    {
        public Guid ProductLotNoMappingId { get; set; }
        public Guid ProductId { get; set; }
        public long LotNoId { get; set; }
    }
}
