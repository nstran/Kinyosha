using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.ProductionProcess;
using TN.TNM.DataAccess.Messages.Results.ProductionProcess;

namespace TN.TNM.Api.Controllers
{
    public class ProductionProcessController : Controller
    {
        private readonly IProductionProcessDataAccess _iProductionProcessDataAccess;
        public ProductionProcessController(IProductionProcessDataAccess iProductionProcessDataAccess)
        {
            this._iProductionProcessDataAccess = iProductionProcessDataAccess;
        }
        /// <summary>
        /// CreateProductionProcessDetail Tạo lô con
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/createProductionProcessDetail")]
        [Authorize(Policy = "Member")]
        public CreateProductionProcessDetailResult CreateProductionProcessDetail([FromBody] CreateProductionProcessDetailParameter request)
        {
            return this._iProductionProcessDataAccess.CreateProductionProcessDetail(request);
        }
        /// <summary>
        /// Get all ProductionProcess (Lấy danh sách lệnh sản xuất theo diều kiện) - Màn hình(DANH SÁCH LỆNH SẢN XUẤT)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductionCode: Mã lệnh
        /// Skip: bản ghi bắt đầu
        /// Take: Số bản ghi cần lấy
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getAllProductionProcess")]
        [Authorize(Policy = "Member")]
        public GetAllProductionProcessResult GetAllProductionProcess([FromBody] GetAllProductionProcessParameter request)
        {
            return this._iProductionProcessDataAccess.GetAllProductionProcess(request);
        }
        /// <summary>
        /// GetProductionProcessById (Lấy danh sách lệnh sản xuất theo Mã lệnh) - Màn hình(DANH SÁCH LỆNH SẢN XUẤT)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// Id: Mã lệnh
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getProductionProcessById")]
        [Authorize(Policy = "Member")]
        public GetProductionProcessByIdResult GetProductionProcessById([FromBody] GetProductionProcessByIdParameter request)
        {
            return this._iProductionProcessDataAccess.GetProductionProcessById(request);
        }
        /// <summary>
        /// Save ProductionProcess (Lưu lệnh sản xuất) - Màn hình (THÔNG TIN CHI TIẾT LỆNH SẢN XUẤT)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductionProcessModel: Các thông tin đầu vào theo model
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/saveProductionProcess")]
        [Authorize(Policy = "Member")]
        public SaveProductionProcessResult SaveProductionProcess([FromBody] SaveProductionProcessParameter request)
        {
            return this._iProductionProcessDataAccess.SaveProductionProcess(request);
        }
        /// <summary>
        /// CreateLotNo (tạo lô sản xuất) - Màn hình (THÔNG TIN CHI TIẾT LỆNH SẢN XUẤT)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductionProcessId: Id lệnh sản xuất
        /// ConfigProductionId: Id cấu hình sản xuất
        /// CustomerName: Tên khách hàng
        /// ProductId: Id sản phẩm
        /// ProductNumber: số lượng sản xuất
        /// <returns></returns>
        /// ProductionProcessModel
        [HttpPost]
        [Route("api/process/createLotNo")]
        [Authorize(Policy = "Member")]
        public CreateLotNoResult CreateLotNo([FromBody] CreateLotNoParameter request)
        {
            return this._iProductionProcessDataAccess.CreateLotNo(request);
        }        
        /// <summary>
        /// Delete ProductionProcess (Xóa lệnh sản xuất) - Màn hình (DANH SÁCH LỆNH SẢN XUẤT)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductionProcessId: Mã lệnh sản xuất
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/deleteProductionProcess")]
        [Authorize(Policy = "Member")]
        public DeleteProductionProcessResult DeleteProductionProcess([FromBody] DeleteProductionProcessParameter request)
        {
            return this._iProductionProcessDataAccess.DeleteProductionProcess(request);
        }
        /// <summary>
        /// DeleteProductionProcessDetailById (Xóa lo sản xuất) - Màn hình (DANH SÁCH LỆNH SẢN XUẤT)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductionProcessDetailId: Mã lo sản xuất
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/deleteProductionProcessDetailById")]
        [Authorize(Policy = "Member")]
        public DeleteProductionProcessDetailByIdResult DeleteProductionProcessDetailById([FromBody] DeleteProductionProcessDetailByIdParameter request)
        {
            return this._iProductionProcessDataAccess.DeleteProductionProcessDetailById(request);
        }
        /// <summary>
        /// Get ConfigProduction By ProductId (Lấy danh sách quy trình theo sản phẩm) Màn hình (THÔNG TIN CHI TIẾT LỆNH SẢN XUẤT)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductId mã sản phẩm
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getConfigProductionByProductId")]
        [Authorize(Policy = "Member")]
        public GetConfigProductionByProductIdResult GetConfigProductionByProductId([FromBody] GetConfigProductionByProductIdParameter request)
        {
            return this._iProductionProcessDataAccess.GetConfigProductionByProductId(request);
        }

        /// <summary>
        /// Get ConfigurationProduct By ProductId (Lấy định mức nguyên vật liệu theo sản phẩm) Màn hình (THÔNG TIN CHI TIẾT LỆNH SẢN XUẤT)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductId: Mã sản phẩm
        /// StartDate: Ngày bắt đầu cấu hình
        /// EndDate: Ngày kết thúc cấu hình
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getConfigurationProductByProductId")]
        [Authorize(Policy = "Member")]
        public GetConfigurationProductByProductIdResult GetConfigurationProductByProductId([FromBody] GetConfigurationProductByProductIdParameter request)
        {
            return this._iProductionProcessDataAccess.GetConfigurationProductByProductId(request);
        }

        /// <summary>
        /// Get ProductionProcessDetail By ProductId (Lấy danh sách Lo sản xuất theo sản phẩm) - THEO DÕI SẢN XUẤT
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductId: Mã sản phẩm
        /// StatusId: trạng thái sản xuất
        /// StartDate: Ngày bắt đầu
        /// EndDate: Ngày kết thúc
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getProductionProcessDetailByProductId")]
        [Authorize(Policy = "Member")]
        public GetProductionProcessDetailByProductIdResult GetProductionProcessDetailByProductId([FromBody] GetProductionProcessDetailByProductIdParameter request)
        {
            return this._iProductionProcessDataAccess.GetProductionProcessDetailByProductId(request);
        }
        /// <summary>
        /// Get TimeSheetDaily (Lấy danh sách báo cáo hàng ngày theo ngày) - Báo cáo hàng ngày
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// TimeSheetDate: Ngày báo cáo
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getTimeSheetDaily")]
        [Authorize(Policy = "Member")]
        public GetTimeSheetDailyResult GetTimeSheetDaily([FromBody] GetTimeSheetDailyParameter request)
        {
            return this._iProductionProcessDataAccess.GetTimeSheetDaily(request);
        }
        /// <summary>
        /// Get TimeSheetDailyMonth (Lấy danh sách báo cáo theo tháng) - Báo cáo hàng ngày
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// TimeSheetDate: Tháng báo cáo
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getTimeSheetDailyMonth")]
        [Authorize(Policy = "Member")]
        public GetTimeSheetDailyMonthResult GetTimeSheetDailyMonth([FromBody] GetTimeSheetDailyMonthParameter request)
        {
            return this._iProductionProcessDataAccess.GetTimeSheetDailyMonth(request);
        }
        /// <summary>
        /// Save TimeSheetDaily (Lưu báo cáo hàng ngày theo ngày) - Báo cáo hàng ngày
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// TimeSheetDailyModel: báo cáo ngày
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/saveTimeSheetDaily")]
        [Authorize(Policy = "Member")]
        public SaveTimeSheetDailyResult SaveTimeSheetDaily([FromBody] SaveTimeSheetDailyParameter request)
        {
            return this._iProductionProcessDataAccess.SaveTimeSheetDaily(request);
        }
        /// <summary>
        /// Save Status ProductionProcessDetail By Id (Cập nhật trạng thái lô sản xuất) - THEO DÕI SẢN XUẤT
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// Id: Mã lô sản xuất
        /// StatusId: Trạng thái
        /// StartDate?:!=null cập nhật cho ngày bắt đầu
        /// EndDate?:!=null cập nhật cho ngày kết thúc
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/saveStatusProductionProcessDetailById")]
        [Authorize(Policy = "Member")]
        public SaveStatusProductionProcessDetailByIdResult SaveStatusProductionProcessDetailById([FromBody] SaveStatusProductionProcessDetailByIdParameter request)
        {
            return this._iProductionProcessDataAccess.SaveStatusProductionProcessDetailById(request);
        }
        /// <summary>
        /// Get ProductionProcessDetail By Id (Lấy thông tin lô theo mã lô) - THÔNG TIN LÔ
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// Id: Mã lô sản xuất
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getProductionProcessDetailById")]
        [Authorize(Policy = "Member")]
        public GetProductionProcessDetailByIdResult GetProductionProcessDetailById([FromBody] GetProductionProcessDetailByIdParameter request)
        {
            return this._iProductionProcessDataAccess.GetProductionProcessDetailById(request);
        }
        /// <summary>
        /// Get ProductionProcessDetail By Id and UserId (Ipad) - THÔNG TIN LÔ
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// Id: Mã lô sản xuất
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getProductionProcessDetailByIdAndUserId")]
        [Authorize(Policy = "Member")]
        public GetProductionProcessDetailByIdAndUserIdResult GetProductionProcessDetailByIdAndUserId([FromBody] GetProductionProcessDetailByIdAndUserIdParameter request)
        {
            return this._iProductionProcessDataAccess.GetProductionProcessDetailByIdAndUserId(request);
        }
        /// <summary>
        /// GetProductionProductByUserId (Danh sách sản phẩm đang sản xuất) - Ipad
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// UserId: user đăng nhập
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getProductionProductByUserId")]
        [Authorize(Policy = "Member")]
        public GetProductionProductByUserIdResult GetProductionProductByUserId([FromBody] GetProductionProductByUserIdParameter request)
        {
            return this._iProductionProcessDataAccess.GetProductionProductByUserId(request);
        }

        /// <summary>
        /// GetProductionProcessStageById (CHi tiết công đoạn) - Ipad
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// Id: Id công đoạn
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getProductionProcessStageById")]
        [Authorize(Policy = "Member")]
        public GetProductionProcessStageByIdResult GetProductionProcessStageById([FromBody] GetProductionProcessStageByIdParameter request)
        {
            return this._iProductionProcessDataAccess.GetProductionProcessStageById(request);
        }
        /// <summary>
        /// SaveProductionProcessErrorStage (Lưu danh sách hạng mục lỗi)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// List ProductionProcessErrorStageModel: Danh sách hạng mục lỗi cần cập nhật
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/saveProductionProcessErrorStage")]
        [Authorize(Policy = "Member")]
        public SaveProductionProcessErrorStageResult SaveProductionProcessErrorStage([FromBody] SaveProductionProcessErrorStageParameter request)
        {
            return this._iProductionProcessDataAccess.SaveProductionProcessErrorStage(request);
        }
        /// <summary>
        /// SaveProductionProcessStage (Lưu chi tiết công đoạn)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductionProcessStageModel: Model công đoạn sản xuất
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/saveProductionProcessStage")]
        [Authorize(Policy = "Member")]
        public SaveProductionProcessStageResult SaveProductionProcessStage([FromBody] SaveProductionProcessStageParameter request)
        {
            return this._iProductionProcessDataAccess.SaveProductionProcessStage(request);
        }
        /// <summary>
        /// GetProductInputByProductionProcessStageId (Danh sách nguyên vật liệu đầu vào công đoạn)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductionProcessStageId: Id công đoạn sản xuất
        /// WarehouseId: Id kho xuất
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/getProductInputByProductionProcessStageId")]
        [Authorize(Policy = "Member")]
        public GetProductInputByProductionProcessStageIdResult GetProductInputByProductionProcessStageId([FromBody] GetProductInputByProductionProcessStageIdParameter request)
        {
            return this._iProductionProcessDataAccess.GetProductInputByProductionProcessStageId(request);
        }
        /// <summary>
        /// ConfirmProductInputByProductionProcessStageId (Xác nhận danh sách nguyên vật liệu đầu vào công đoạn)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// List ProductionProcessStageProductInputModel: Danh sách nguyên vật liệu đầu vào công đoạn
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/confirmProductInputByProductionProcessStageId")]
        [Authorize(Policy = "Member")]
        public ConfirmProductInputByProductionProcessStageIdResult ConfirmProductInputByProductionProcessStageId([FromBody] ConfirmProductInputByProductionProcessStageIdParameter request)
        {
            return this._iProductionProcessDataAccess.ConfirmProductInputByProductionProcessStageId(request);
        }
        /// <summary>
        /// ImportNG - Nhập kho NG
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductionProcessStageId: Id công đoạn sản xuất
        /// AmountReuse: Số lượng tái sử dụng
        /// NumberCancel: Số lượng hủy
        /// WarehouseId: Kho nhập
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/importNG")]
        [Authorize(Policy = "Member")]
        public ImportNGResult ImportNG([FromBody] ImportNGParameter request)
        {
            return this._iProductionProcessDataAccess.ImportNG(request);
        }
        /// <summary>
        /// ConfirmProductionProcessStageById - Thay đổi trạng thái công đoạn
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// ProductionProcessStageId: Id công đoạn sản xuất
        /// StatusId: Id trạng thái
        /// <returns></returns>
        [HttpPost]
        [Route("api/process/confirmProductionProcessStageById")]
        [Authorize(Policy = "Member")]
        public ConfirmProductionProcessStageByIdResult ConfirmProductionProcessStageById([FromBody] ConfirmProductionProcessStageByIdParameter request)
        {
            return this._iProductionProcessDataAccess.ConfirmProductionProcessStageById(request);
        }
        /// <summary>
        /// CancelProductionProcessDetailById - Hủy lô
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessDetailId: Id Lô
        /// StatusId: Id trạng thái
        /// TPWarehouseId: Id kho thành phẩm
        /// QuantityReuse: số lượng tái thành phẩm
        /// QuantityCancel: số lượng hủy
        /// NVLWarehouseId: Id kho nguyên vật liệu
        /// ProductInputModels: danh sách nguyên vật liệu chưa sử dụng
        /// <returns>Result</returns>
        [HttpPost]
        [Route("api/process/cancelProductionProcessDetailById")]
        [Authorize(Policy = "Member")]
        public CancelProductionProcessDetailByIdResult CancelProductionProcessDetailById([FromBody] CancelProductionProcessDetailByIdParameter request)
        {
            return this._iProductionProcessDataAccess.CancelProductionProcessDetailById(request);
        }
        /// <summary>
        /// GetMain - Lấy dữ liệu trang chủ
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns>Result</returns>
        [HttpPost]
        [Route("api/process/getMain")]
        [Authorize(Policy = "Member")]
        public GetMainResult GetMain([FromBody] GetMainParameter request)
        {
            return this._iProductionProcessDataAccess.GetMain(request);
        }
        /// <summary>
        /// ProductionReport - Báo cáo sản xuất
        /// </summary>
        /// <param name="parameter"></param>
        /// StartDate:
        /// EndDate:
        /// <returns>Result</returns>
        [HttpPost]
        [Route("api/process/productionReport")]
        [Authorize(Policy = "Member")]
        public ProductionReportResult ProductionReport([FromBody] ProductionReportParameter request)
        {
            return this._iProductionProcessDataAccess.ProductionReport(request);
        }
        /// <summary>
        /// GetProductionProcessDetailErrorById - BẢNG KIỂM TRA HÀNG LỖI
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessDetailId:
        /// <returns>Result</returns>
        [HttpPost]
        [Route("api/process/getProductionProcessDetailErrorById")]
        [Authorize(Policy = "Member")]
        public GetProductionProcessDetailErrorByIdResult GetProductionProcessDetailErrorById([FromBody] GetProductionProcessDetailErrorByIdParameter request)
        {
            return this._iProductionProcessDataAccess.GetProductionProcessDetailErrorById(request);
        }
        /// <summary>
        /// GetReportSpecificationById - BẢNG KIỂM TRA QC
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessDetailId:
        /// <returns>Result</returns>
        [HttpPost]
        [Route("api/process/getReportSpecificationById")]
        [Authorize(Policy = "Member")]
        public GetReportSpecificationByIdResult GetReportSpecificationById([FromBody] GetReportSpecificationByIdParameter request)
        {
            return this._iProductionProcessDataAccess.GetReportSpecificationById(request);
        }
    }
}
