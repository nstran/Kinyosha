﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Quote
{
    public class QuoteApproveDetailHistoryEntityModel
    {
        public Guid Id { get; set; }
        public Guid QuoteId { get; set; }
        public Guid QuoteApproveHistoryId { get; set; }
        public Guid? VendorId { get; set; }
        public Guid? ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public Guid? CurrencyUnit { get; set; }
        public decimal? ExchangeRate { get; set; }
        public decimal? Vat { get; set; }
        public bool? DiscountType { get; set; }
        public decimal? DiscountValue { get; set; }
        public string Description { get; set; }
        public short? OrderDetailType { get; set; }
        public Guid? UnitId { get; set; }
        public string IncurredUnit { get; set; }
        public bool? Active { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
