import { ApisauceInstance, ApiResponse } from "apisauce";
import { Alert } from "react-native";
import { Storage, StorageKey } from "../storage/index";

export class UserApi {
  private _apisauce: ApisauceInstance;
  private _storage = new Storage();
  constructor(apisauce: ApisauceInstance) {
    this._apisauce = apisauce;
  }

  async login(payload: any): Promise<any> {
    try {
      const response = await this._apisauce.post('/auth', payload, { headers: { Origin: 'http://103.138.113.52:66'}} );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  async signUp(payload: any): Promise<any> {
    try {
      const response = await this._apisauce.post(`/default/sign-up`, payload);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async SendEmailToChangePass(payload: any): Promise<any> {
    try {
      const response = await this._apisauce.post(
        `/default/check-email-change-password`,
        payload
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async changePasswork(payload: any): Promise<any> {
    try {
      const response = await this._apisauce.post(
        `/default/change-password`,
        payload
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async getCategoryByCode(payload: any): Promise<any> {
    const response = await this._apisauce.post(
      `/default/get-category-by-code`,
      payload
    );
    return response.data;
  }

  async getDataHomePageByCode(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/default/get-data-homepage`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async getAllJobByCode(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/default/get-all-job`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }
  async getDetalJobByID(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/default/view-job-detail`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }
  async getAllNewsByCode(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/default/get-list-news`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }
  async HandleApplyJob(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(`/default/apply-job`, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  // async getDetailDashboard(payload: any): Promise<any> {
  //   const accessToken = await this._storage.getItem(StorageKey.JWT_TOKEN);
  //   const response = await this._apisauce.post(`/asset/getDataAssetDetail`, payload,
  //     { headers: { "Authorization": `Bearer ${accessToken}` } })
  //   return response.data
  // }

  async getListNotification(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/default/get-list-notification`,
      payload,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  }

  async updateStatusNotification(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/default/update-status-noti`,
      payload,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  }

  async getProductionProductByUserId(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)  
    const response = await this._apisauce.post(`/process/getProductionProductByUserId`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
    //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async getProductionProcessDetailByIdAndUserId(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)  
    const response = await this._apisauce.post(`/process/getProductionProcessDetailByIdAndUserId`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
    //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async getAllCategory(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)  
    const response = await this._apisauce.post(`/category/getAllCategory`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
   //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async searchWareHouse(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)   
    const response = await this._apisauce.post(`/warehouse/searchWareHouse`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
    //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async getListWareHouse(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)   
    const response = await this._apisauce.post(`/warehouse/getListWareHouse`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
    //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async getProductInputByProductionProcessStageId(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)     
    const response = await this._apisauce.post(`/process/getProductInputByProductionProcessStageId`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
    //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async getProductionProcessStageById(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)     
    const response = await this._apisauce.post(`/process/getProductionProcessStageById`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
   //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async confirmProductInputByProductionProcessStageId(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)  
    const response = await this._apisauce.post(`/process/confirmProductInputByProductionProcessStageId`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
   //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async confirmProductionProcessStageById(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)  
    const response = await this._apisauce.post(`/process/confirmProductionProcessStageById`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
   //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async saveStatusProductionProcessDetailById(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)   
    const response = await this._apisauce.post(`/process/saveStatusProductionProcessDetailById`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
   //{ headers: { Origin: tenantHost }  })
    return response.data
  }

  async saveProductionProcessErrorStage(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)  
    const response = await this._apisauce.post(`/process/saveProductionProcessErrorStage`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
   //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async importNG(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)    
    const response = await this._apisauce.post(`/process/importNG`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
   //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async saveProductionProcessStage(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)    
    const response = await this._apisauce.post(`/process/saveProductionProcessStage`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
   //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async getTimeSheetDaily(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)   
    const response = await this._apisauce.post(`/process/getTimeSheetDaily`, payload,
    { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
    //{ headers: { Origin: tenantHost }  })
    return response.data
  }
  async saveTimeSheetDaily(payload: any): Promise<any> {
    const tenantHost =  await this._storage.getItem(StorageKey.TENANTHOST)
    const accessToken = await this._storage.getItem(StorageKey.TOKEN)    
    const response = await this._apisauce.post(`/process/saveTimeSheetDaily`, payload,
   { headers: { Authorization: `Bearer ${accessToken}`, Origin: tenantHost }  })
   //{ headers: { Origin: tenantHost }  })
    return response.data
  }
}
