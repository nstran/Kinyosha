using System;
using System.Collections.Generic;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Order;

namespace TN.TNM.DataAccess.Messages.Parameters.Order
{
    public class CreateCustomerOrderParameter : BaseParameter
    {
        public CustomerOrderEntityModel CustomerOrder { get; set; }
        public List<CustomerOrderDetailEntityModel> CustomerOrderDetail { get; set; }
        public List<OrderCostDetailEntityModel> OrderCostDetail { get; set; }
        public int TypeAccount { get; set; }
        public ContactEntityModel Contact { get; set; }
        public Guid? QuoteId { get; set; }
    }
}
