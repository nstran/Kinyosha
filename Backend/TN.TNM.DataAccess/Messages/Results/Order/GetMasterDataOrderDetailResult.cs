using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.DAO;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.BankAccount;
using TN.TNM.DataAccess.Models.BillSale;
using TN.TNM.DataAccess.Models.Contract;
using TN.TNM.DataAccess.Models.Customer;
using TN.TNM.DataAccess.Models.CustomerOrder;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.Folder;
using TN.TNM.DataAccess.Models.Note;
using TN.TNM.DataAccess.Models.Order;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.Quote;
using TN.TNM.DataAccess.Models.WareHouse;
using CustomerOrderEntityModel = TN.TNM.DataAccess.Models.Order.CustomerOrderEntityModel;

namespace TN.TNM.DataAccess.Messages.Results.Order
{
    public class GetMasterDataOrderDetailResult : BaseResult
    {
        public List<OrderStatusEntityModel> ListOrderStatus { get; set; }
        public List<EmployeeEntityModel> ListEmployee { get; set; }
        public List<CustomerEntityModel> ListCustomer { get; set; }
        public List<BankAccountEntityModel> ListCustomerBankAccount { get; set; }
        public List<CategoryEntityModel> ListPaymentMethod { get; set; }
        public List<CategoryEntityModel> ListCustomerGroup { get; set; }
        public List<string> ListCustomerCode { get; set; }
        public CustomerOrderEntityModel CustomerOrderObject { get; set; }
        public List<CustomerOrderDetailEntityModel> ListCustomerOrderDetail { get; set; }
        public List<OrderCostDetailEntityModel> ListCustomerOrderCostDetail { get; set; }
        public List<NoteEntityModel> ListNote { get; set; }
        public List<QuoteEntityModel> ListQuote { get; set; }
        public List<WareHouseEntityModel> ListWare { get; set; }
        public List<BillSaleEntityModel> ListBillSale { get; set; }
        public List<ProductEntityModel> ListProduct { get; set; }
        public List<ContractEntityModel> ListContract { get; set; }
        public List<InventoryDeliveryVoucherEntityModel> ListInventoryDeliveryVoucher { get; set; }
        public bool IsManager { get; set; }

        public  List<PaymentInformationEntityModel> ListPaymentInformationEntityModel { get; set; }

        public List<FileInFolderEntityModel> ListFile { get; set; }
        public List<TonKhoTheoSanPham> ListTonKhoTheoSanPham { get; set; }

    }
}
