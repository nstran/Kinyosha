using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class EmailNhanSu
    {
        public int EmailNhanSuId { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public Guid? TenantId { get; set; }
    }
}
