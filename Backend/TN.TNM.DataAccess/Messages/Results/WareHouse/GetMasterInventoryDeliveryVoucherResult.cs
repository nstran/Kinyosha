using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Asset;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.WareHouse;

namespace TN.TNM.DataAccess.Messages.Results.WareHouse
{
    public class GetMasterInventoryDeliveryVoucherResult : BaseResult
    {
        //public List<WareHouseEntityModel> ListWarehouseDelivery { get; set; } //Danh sach kho xuất
        public List<ProductEntityModel> ListProduct { get; set; }
        //public List<WareHouseEntityModel> ListWarehouseReceiving { get; set; } //Danh sach kho nhận
        public string EmployeeDepartment { get; set; }
        public Guid EmployeeDepartmentId { get; set; }
        public string NameCreate { get; set; }
        public List<InventoryReceivingVoucher> ListPhieuNhapLai { get; set; }
        public List<OrganizationEntityModel> ListOrganization { get; set; }
        public List<EmployeeEntityModel> ListEmployee { get; set; }
        public List<DotKiemKeEntityModel> ListDotKiemKe { get; set; }
    }
}
