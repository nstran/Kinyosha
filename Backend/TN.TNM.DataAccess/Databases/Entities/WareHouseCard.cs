using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class WareHouseCard
    {
        public Guid WareHouseCardId { get; set; }
        public Guid? ProductId { get; set; }
        public Guid? Department { get; set; }
        public string CardName { get; set; }
        public DateTime? CardDate { get; set; }
    }
}
