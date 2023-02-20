import { ApiResponse, ApisauceInstance } from "apisauce"
import { Storage, StorageKey } from "../storage"
import { Origin } from "./api-config"

/**
 * Manages all requests to the API.
 */
export class UserApi {
  private _apisauce: ApisauceInstance
  private _storage = new Storage()

  // private _auth = new Auth()

  /**
   * Creates the api.
   *
   * @param apisauce
   */
  constructor(apisauce: ApisauceInstance) {
    this._apisauce = apisauce
  }

  async getUserInfo(): Promise<any> {
    let root = await this._storage.getItem("root")
    const accessToken = root?.tnmStore?.userInfo?.accessToken
    const userId = root?.tnmStore?.userInfo?.userId
    return {
      accessToken,
      userId,
    }
  }

  async getUserEmployeeId(): Promise<any> {
    let root = await this._storage.getItem("root")
    const accessToken = root?.tnmStore?.userInfo?.accessToken
    const employeeId = root?.tnmStore?.userInfo?.employeeId
    const userId = root?.tnmStore?.userInfo?.userId
    return {
      accessToken,
      employeeId,
      userId,
    }
  }

  /**
   * Sets up the API.  This will be called during the bootup
   * sequence and will happen before the first React component
   * is mounted.
   *
   * Be as quick as possible in here.
   */

  async login(payload: any): Promise<any> {
    return await this._apisauce.post(`/auth`, payload, {
      headers: {
        Origin,
        // "Referer": "http://tnmtest.tringhiatech.vn:8080",
      },
    })
  }

  async getCheckUserName(payload: any): Promise<any> {
    return await this._apisauce.post(`/auth/getCheckUserName`, payload, {
      headers: {
        Origin,
      },
    })
  }

  async sendEmailForgotPass(payload: any): Promise<any> {
    return await this._apisauce.post(`/email/sendEmailForgotPass`, payload, {
      headers: {
        Origin,
      },
    })
  }

  async getUserProfile(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/auth/getUserProfile`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async editUserProfile(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/auth/editUserProfile`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async changePassword(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/auth/changePassword`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async employeeRequestSearch(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/employeeRequest/search`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async getDataSearchEmployeeRequest(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/employeeRequest/getDataSearchEmployeeRequest`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async getOrganizationByEmployeeId(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/organization/getOrganizationByEmployeeId`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async searchPotentialCustomer(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/customer/searchPotentialCustomer`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async getDataDashboardPotentialCustomer(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/customer/getDataDashboardPotentialCustomer`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async getDataDashboardHome(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/order/getDataDashboardHome`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }


  async addPhoneToken(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/employee/addPhoneToken`, payload,
      { headers: { "Authorization": `Bearer ${userInfo.accessToken}` } })
    return response
  }

  async getAllCategoryByCategoryTypeCode(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/category/getAllCategoryByCategoryTypeCode`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async getEmployeeApprove(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/employee/getEmployeeApprove`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }


  async getAllEmployee(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/employee/getAllEmployee`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async create(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/employeeRequest/create`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async getEmployeeRequestById(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/employeeRequest/getEmployeeRequestById`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async nextWorkflowStep(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/workflow/nextWorkflowStep`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async editEmployeeRequestById(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/employeeRequest/editEmployeeRequestById`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async sendEmailPersonApprove(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/email/sendEmailPersonApprove`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async getDataCreatePotentialCustomer(payload: any): Promise<any> {
    const userInfo = await this.getUserEmployeeId()
    payload.userId = userInfo.userId
    payload.EmployeeId = userInfo.employeeId
    const response: ApiResponse<any> = await this._apisauce.post(`/customer/getDataCreatePotentialCustomer`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  // async checkDuplicateInforCustomer(payload: any): Promise<any> {
  //   const userInfo = await this.getUserEmployeeId()
  //   payload.userId = userInfo.userId
  //   const response: ApiResponse<any> = await this._apisauce.post(`/customer/checkDuplicateInforCustomer`, payload,
  //     {
  //       headers: {
  //         "Authorization": `Bearer ${userInfo.accessToken}`,
  //         Origin,
  //       },
  //     })
  //   return response
  // }

  async createCustomer(payload: any): Promise<any> {
    const userInfo = await this.getUserEmployeeId()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/customer/createCustomer`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async searchQuote(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/quote/searchQuote`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async getMasterDataCreateQuote(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/quote/getMasterDataCreateQuote`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async getMasterDataCreateCost(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/quote/getMasterDataCreateCost`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async searchOrder(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/order/searchOrder`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async getMasterDataOrderDetail(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/order/getMasterDataOrderDetail`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

  async getMasterDataOrderCreate(payload: any): Promise<any> {
    const userInfo = await this.getUserInfo()
    payload.userId = userInfo.userId
    const response: ApiResponse<any> = await this._apisauce.post(`/order/getMasterDataOrderCreate`, payload,
      {
        headers: {
          "Authorization": `Bearer ${userInfo.accessToken}`,
          Origin,
        },
      })
    return response
  }

}
