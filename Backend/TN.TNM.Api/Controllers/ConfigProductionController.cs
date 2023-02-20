using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Xml;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.ConfigProduction;
using TN.TNM.DataAccess.Messages.Parameters.Contact;
using TN.TNM.DataAccess.Messages.Results.ConfigProduction;
using TN.TNM.DataAccess.Messages.Results.Contact;

namespace TN.TNM.Api.Controllers
{
    public class ConfigProductionController : Controller
    {
        private readonly IConfigProductionDataAccess _iConfigProductionDataAccess;
        public ConfigProductionController(IConfigProductionDataAccess iConfigProductionDataAccess)
        {
            this._iConfigProductionDataAccess = iConfigProductionDataAccess;
        }

        /// <summary>
        /// Get all ConfigProduction (Lấy danh sách cấu hình quy trình sản xuất)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/config/getAllConfigProduction")]
        [Authorize(Policy = "Member")]
        public GetAllConfigProductionResult GetAllConfigProduction([FromBody] GetAllConfigProductionParameter request)
        {
            return this._iConfigProductionDataAccess.GetAllConfigProduction(request);
        }
        /// <summary>
        /// Get ConfigProduction By Id (Lấy danh sách cấu hình quy trình sản xuất theo Id)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/config/getConfigProductionById")]
        [Authorize(Policy = "Member")]
        public GetConfigProductionByIdResult GetConfigProductionById([FromBody] GetConfigProductionByIdParameter request)
        {
            return this._iConfigProductionDataAccess.GetConfigProductionById(request);
        }
        /// <summary>
        /// Save ConfigProduction (Lưu cấu hình quy trình sản xuất)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/config/saveConfigProduction")]
        [Authorize(Policy = "Member")]
        public SaveConfigProductionResult SaveConfigProduction([FromBody] SaveConfigProductionParameter request)
        {
            return this._iConfigProductionDataAccess.SaveConfigProduction(request);
        }
        /// <summary>
        /// Delete ConfigProduction (Xóa cấu hình quy trình sản xuất)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/config/deleteConfigProduction")]
        [Authorize(Policy = "Member")]
        public DeleteConfigProductionResult DeleteConfigProduction([FromBody] DeleteConfigProductionParameter request)
        {
            return this._iConfigProductionDataAccess.DeleteConfigProduction(request);
        }
        /// <summary>
        /// Save ConfigStageForPerson (Lưu thay đổi danh sách người phụ trách và người xác nhận)
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/config/saveConfigStageForPerson")]
        [Authorize(Policy = "Member")]
        public SaveConfigStageForPersonResult SaveConfigStageForPerson([FromBody] SaveConfigStageForPersonParameter request)
        {
            return this._iConfigProductionDataAccess.SaveConfigStageForPerson(request);
        }
    }
}
