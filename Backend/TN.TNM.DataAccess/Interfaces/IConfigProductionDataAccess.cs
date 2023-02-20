using System;
using TN.TNM.DataAccess.Messages.Parameters.Asset;
using TN.TNM.DataAccess.Messages.Parameters.ConfigProduction;
using TN.TNM.DataAccess.Messages.Parameters.Contact;
using TN.TNM.DataAccess.Messages.Parameters.Contract;
using TN.TNM.DataAccess.Messages.Parameters.Employee;
using TN.TNM.DataAccess.Messages.Results.Asset;
using TN.TNM.DataAccess.Messages.Results.ConfigProduction;
using TN.TNM.DataAccess.Messages.Results.Contact;
using TN.TNM.DataAccess.Messages.Results.Employee;

namespace TN.TNM.DataAccess.Interfaces
{
    public interface IConfigProductionDataAccess
    {
        /// <summary>
        /// Get all ConfigProduction
        /// </summary>
        /// <param name="parameter"></param>
        /// Code: Mã quy trình
        /// ProductCode: Mã sản phẩm thành phẩm
        /// ProductName: Tên sản phẩm thành phẩm
        /// Availability: true - Quy trình hiệu lực; false - Quy trình không hiệu lực
        /// <returns>Result</returns>
        /// The list ConfigProduction
        GetAllConfigProductionResult GetAllConfigProduction(GetAllConfigProductionParameter parameter);
        /// <summary>
        /// Save ConfigProduction
        /// </summary>
        /// <param name="parameter"></param>
        /// ConfigProduction
        /// <returns>Result</returns>
        /// ConfigProduction
        SaveConfigProductionResult SaveConfigProduction(SaveConfigProductionParameter parameter);
        /// <summary>
        /// Delete ConfigProduction
        /// </summary>
        /// <param name="parameter"></param>
        /// ConfigProduction
        /// <returns>Result</returns>
        /// ConfigProduction
        DeleteConfigProductionResult DeleteConfigProduction(DeleteConfigProductionParameter parameter);
        /// <summary>
        /// Save ConfigStageForPerson
        /// </summary>
        /// <param name="parameter"></param>
        /// ConfigStageId: Mã công đoạn
        /// List PersonInChargeId: Danh sách người phụ trách
        /// PersonVerifierId: Người xác nhận
        /// <returns>Result</returns>
        /// ConfigProduction
        SaveConfigStageForPersonResult SaveConfigStageForPerson(SaveConfigStageForPersonParameter parameter);
        /// <summary>
        /// Get ConfigProduction By Id
        /// </summary>
        /// <param name="parameter"></param>
        /// ConfigProductionId: Id quy trình
        /// <returns>Result</returns>
        /// The ConfigProductionModel
        GetConfigProductionByIdResult GetConfigProductionById(GetConfigProductionByIdParameter parameter);
    }
}
