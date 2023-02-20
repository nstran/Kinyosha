using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.WareHouse;

namespace TN.TNM.DataAccess.Messages.Results.WareHouse
{
    public class CreateUpdateWarehouseMasterdataResult: BaseResult
    {
        public List<OrganizationEntityModel> ListOrganization { get; set; }
        public WareHouseEntityModel WarehouseEntityModel { get; set; }
        public List<CategoryEntityModel> ListCategoryEntityModel { get; set; } //Danh sach loai kho
    }
}
