﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin.Product
{
    public class DeleteConfigurationProductParameter : BaseParameter
    {
        public Guid ConfigurationProductId { get; set; }
    }
}