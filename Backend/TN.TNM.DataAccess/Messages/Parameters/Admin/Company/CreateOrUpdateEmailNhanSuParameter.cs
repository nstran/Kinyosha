using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin.Company
{
    public class CreateOrUpdateEmailNhanSuParameter : BaseParameter
    {
        public EmailNhanSuModel EmailNhanSu { get; set; }
    }
}
