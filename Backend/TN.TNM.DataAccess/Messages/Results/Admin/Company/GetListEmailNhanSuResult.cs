using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models;

namespace TN.TNM.DataAccess.Messages.Results.Admin.Company
{
    public class GetListEmailNhanSuResult : BaseResult
    {
        public List<EmailNhanSuModel> ListEmailNhanSu { get; set; }
    }
}
