﻿using System;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin.Permission
{
    public class GetDetailPermissionParameter : BaseParameter
    {
        public Guid RoleId { get; set; }
    }
}
