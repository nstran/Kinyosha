﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Quote
{
    public class GetMasterDataUpdateQuoteParameter : BaseParameter
    {
        public Guid QuoteId { get; set; }
    }
}