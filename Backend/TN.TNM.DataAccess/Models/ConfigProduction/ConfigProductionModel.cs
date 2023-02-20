using System;
using System.Collections;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Models.ConfigProduction
{
    public class ConfigProductionModel : BaseModel<Databases.Entities.ConfigProduction>
    {
        public ConfigProductionModel()
        {

        }
        public override DataAccess.Databases.Entities.ConfigProduction ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ConfigProduction();
            Mapper(this, entity);
            return entity;
        }

        public ConfigProductionModel(Databases.Entities.ConfigProduction model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public Guid ProductId { get; set; }
        public string Code { get; set; } //Mã quy trình sản phẩm
        public string Description { get; set; } //Diễn giải
        public int ProductionNumber { get; set; } //Số lượng sản phẩm/lô hàng
        public int Ltv { get; set; } //Số tỉ lệ cần trộn nguyên liệu để chế tạo mẫu LTV
        public int Pc { get; set; } //Số sản phẩm cần đo độ cứng sau PC
        public bool Availability { get; set; } //HIệu lực
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string ProductCode { get; set; } //Mã sản phẩm
        public string ProductName { get; set; } //Tên sản phẩm
        public Guid[] InspectionStageId { get; set; }
        public List<ConfigStageModel> ConfigStages { get; set; } // Danh sách công đoạn
        public bool IsUsed { get; set; }//True: đã sử dụng vào sản xuất; False: chưa đưa vào sản xuất
    }

    public class ConfigStageModel : BaseModel<Databases.Entities.ConfigStage>
    {
        public ConfigStageModel()
        {

        }
        public override DataAccess.Databases.Entities.ConfigStage ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ConfigStage();
            Mapper(this, entity);
            return entity;
        }

        public ConfigStageModel(Databases.Entities.ConfigStage model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ConfigProductionId { get; set; }
        public Guid StageNameId { get; set; } //tên công đoạn
        public Guid StageGroupId { get; set; } //tên nhóm công đoạn
        public int NumberPeople { get; set; }//Số người thực hiện
        public Guid DepartmentId { get; set; } //Bộ phận phụ trách
        public Guid[] PersonInChargeId { get; set; } //Người phụ trách
        public Guid PersonVerifierId { get; set; } //Người xác nhận
        public bool Binding { get; set; } //Ràng buộc công đoạn
        public Guid? PreviousStageNameId { get; set; } //Công đoạn hoàn thành trước
        public int? FromTime { get; set; }//Thời gian bắt đầu
        public int? ToTime { get; set; }//Thời gian kết thúc
        public int? SortOrder { get; set; }//Thứ tự công đoạn        
        public bool IsStageWithoutNg { get; set; }//Công đoạn không có NG
        public bool IsStageWithoutProduct { get; set; }//Công đoạn không có sản phẩm
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        public string StageName { get; set; }//tên công đoạn
        public string StageGroupName { get; set; }//tên nhóm công đoạn
        public string DepartmentName { get; set; }//tên Bộ phận phụ trách
        public string[] PersonInChargeName { get; set; }//tên Người phụ trách
        public string PersonVerifierName { get; set; } //tên Người xác nhận

        public List<ConfigStepByStepStageModel> ConfigStepByStepStages { get; set; } //Danh sách các bước thực hiện
        public List<ConfigContentStageModel> ConfigContentStages { get; set; } //Danh sách nội dung kiểm tra
        public List<ConfigSpecificationsStageModel> ConfigSpecificationsStages { get; set; } //Danh sách quy cách
        public List<ConfigErrorItemModel> ConfigErrorItems { get; set; } //Danh sách hạng mục lỗi
        public List<ConfigStageProductInputModel> ConfigStageProductInputs { get; set; }//Danh sách nguyên vật liệu đầu vào
    }

    public class ConfigStepByStepStageModel : BaseModel<Databases.Entities.ConfigStepByStepStage>
    {
        public ConfigStepByStepStageModel()
        {

        }
        public override DataAccess.Databases.Entities.ConfigStepByStepStage ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ConfigStepByStepStage();
            Mapper(this, entity);
            return entity;
        }

        public ConfigStepByStepStageModel(Databases.Entities.ConfigStepByStepStage model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ConfigStageId { get; set; } //ConfigStage.Id (công đoạn)
        public string Name { get; set; } //tên các bước thực hiện
        public bool? IsShowTextBox { get; set; }//Xuất hiện hộp textbox để nhập số máy
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public long MappingId { get; set; } //được sử dụng phi thêm mới, nếu Id = 0 -> MappingId phải có, Id !=0 -> MappingId= Id
    }

    public class ConfigContentStageModel : BaseModel<Databases.Entities.ConfigContentStage>
    {
        public ConfigContentStageModel()
        {

        }
        public override DataAccess.Databases.Entities.ConfigContentStage ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ConfigContentStage();
            Mapper(this, entity);
            return entity;
        }

        public ConfigContentStageModel(Databases.Entities.ConfigContentStage model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ConfigStageId { get; set; }
        public bool? IsContentValues { get; set; }//Xuất hiện hộp textbox để nhập
        //public long? ConfigStepByStepStageId { get; set; } //ConfigStepByStepStage.Id Các bước thực hiện
        public Guid? ContentId { get; set; } //Category.CategoryId (Nội dung thực hiện)
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        //public long? ConfigStepByStepStageIdMapping { get; set; } //được sử dụng khi thêm mới
        public long MappingId { get; set; } //được sử dụng khi thêm mới, nếu Id = 0 -> MappingId phải có và duy nhất, Id !=0 -> MappingId= Id
    }

    public class ConfigSpecificationsStageModel : BaseModel<Databases.Entities.ConfigSpecificationsStage>
    {
        public ConfigSpecificationsStageModel()
        {

        }
        public override DataAccess.Databases.Entities.ConfigSpecificationsStage ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ConfigSpecificationsStage();
            Mapper(this, entity);
            return entity;
        }

        public ConfigSpecificationsStageModel(Databases.Entities.ConfigSpecificationsStage model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ConfigStageId { get; set; } //ConfigStage.Id (Công đoạn)
        public long? ConfigStepByStepStageId { get; set; } //ConfigStepByStepStage.Id (Các bước thực hiện)
        public long? ConfigContentStageId { get; set; } //ConfigContentStage.Id (Nội dung thực hiện)
        public Guid SpecificationsId { get; set; } ////Category.CategoryId  quy cách/ghi chú/thanh khảo
        public bool IsHaveValues { get; set; }
        public int NumberOfSamples { get; set; } //Số mẫu thử
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public long? ConfigStepByStepStageIdMapping { get; set; } //được sử dụng khi thêm mới
        public long? ConfigContentStageIdMapping { get; set; } //được sử dụng khi thêm mới
        public List<ConfigSpecificationsStageValueModel> ConfigSpecificationsStageValues { get; set; }//Danh sách giá trị quy cách/ghi chú/thanh khảo
    }
    public class ConfigSpecificationsStageValueModel : BaseModel<Databases.Entities.ConfigSpecificationsStageValue>
    {
        public ConfigSpecificationsStageValueModel()
        {

        }
        public override DataAccess.Databases.Entities.ConfigSpecificationsStageValue ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ConfigSpecificationsStageValue();
            Mapper(this, entity);
            return entity;
        }

        public ConfigSpecificationsStageValueModel(Databases.Entities.ConfigSpecificationsStageValue model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ConfigSpecificationsStageId { get; set; } //ConfigSpecificationsStage.Id
        public Guid FieldTypeId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int LineOrder { get; set; }
        public int SortLineOrder { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? ProductId { get; set; }
        public int? InfoFormula { get; set; }
        public int? Formula { get; set; }
        public decimal? FormulaValue { get; set; }
    }

    public class ConfigErrorItemModel : BaseModel<Databases.Entities.ConfigErrorItem>
    {
        public ConfigErrorItemModel()
        {

        }
        public override DataAccess.Databases.Entities.ConfigErrorItem ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ConfigErrorItem();
            Mapper(this, entity);
            return entity;
        }

        public ConfigErrorItemModel(Databases.Entities.ConfigErrorItem model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ConfigStageId { get; set; } //ConfigStage.Id
        public Guid ErrorItemId { get; set; } //Category.CategoryId
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string ErrorItemName { get; set; }//Tên hạng mục lỗi
    }

    public class ConfigStageProductInputModel : BaseModel<Databases.Entities.ConfigStageProductInput>
    {
        public ConfigStageProductInputModel()
        {

        }
        public override DataAccess.Databases.Entities.ConfigStageProductInput ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ConfigStageProductInput();
            Mapper(this, entity);
            return entity;
        }

        public ConfigStageProductInputModel(Databases.Entities.ConfigStageProductInput model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ConfigStageId { get; set; } //ConfigStage.Id
        public Guid ProductId { get; set; } //Product.ProductId
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string ProductCode { get; set; }//Mã nguyên vật liệu
        public string ProductName { get; set; }//Tên Nguyên vật liệu
    }
}
