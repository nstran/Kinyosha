import { ApisauceInstance, create } from "apisauce"
import { ApiConfig, DEFAULT_API_CONFIG } from "./api-config"
import { UserApi } from "./user-api"
import { Storage } from "../storage"
import "intl"
import "intl/locale-data/jsonp/en"

/**
 * Manages all requests to the API.
 */
export class UnitOfWorkService {
  private _userApi: UserApi
  private apisauce: ApisauceInstance
  private _storage: Storage
  /**
   * Configurable options.
   */
  private config: ApiConfig = DEFAULT_API_CONFIG

  /**
   * Creates the api.
   *
   */
  constructor() {
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  get storage(): Storage {
    if (this._storage == null) {
      return (this._storage = new Storage())
    }
    return this._storage
  }

  get user(): UserApi {
    if (this._userApi == null) {
      return (this._userApi = new UserApi(this.apisauce))
    }
    return this._userApi
  }

  padTo2Digits(num) {
    return num.toString().padStart(2, "0")
  }

  numberToTimeString = (number) => {
    let gio = Math.floor(number % 24)
    let ngay = Math.floor(number / 24)
    let phut = Math.floor((number - ngay * 24 - gio) * 60)
    return ngay + " ngày " + gio + " giờ " + phut + " phút"
  }

  formatDate = (date, type = null) => {
    date = new Date(date)
    if (Platform.OS === "ios") {

    } else {
      date.setHours(date.getHours() - 7)
    }
    if (type == "dd/MM/YYYY hh:mm") {
      return `${this.padTo2Digits(date.getDate())}/${this.padTo2Digits(date.getMonth() + 1)}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
    }
    return [
      this.padTo2Digits(date.getDate()),
      this.padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join("/")
  }

  formatNumber = (value, lamTron = false) => {
    if (isNaN(value)) {
      return 0
    }
    if (lamTron) {
      value = Math.round(value)
    }
    let number = new Intl.NumberFormat("en-US", {
      style: "decimal",
    }).format(value)
    if (number) {
      return number
      // return number.replace(/[.,]/g, function(x) {
      // return x == "," ? "." : ","
      // })
    }
    return 0
  }

  fixAvatar(avatar: any) {
    try {
      if (Platform.OS === "ios") {
        avatar = avatar.split("\\").join("/")
      }
      avatar = `${API_URL}:${PORT}/images/${avatar}`
      return avatar
    } catch (e) {
      return null
    }
  }

  getSoTienChu = (number) => {
    if (number && (number % 1 === 0)) {
      let count = 0, i = 0, num = number, _result = ""
      let tmp
      let locate = []
      let unitOfnum = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"]
      locate[5] = Math.floor(num / 1000000000000000)
      if (isNaN(locate[5]))
        locate[5] = "0"
      num = num - parseFloat(locate[5].toString()) * 1000000000000000
      locate[4] = Math.floor(num / 1000000000000)
      if (isNaN(locate[4]))
        locate[4] = "0"
      num = num - parseFloat(locate[4].toString()) * 1000000000000
      locate[3] = Math.floor(num / 1000000000)
      if (isNaN(locate[3]))
        locate[3] = "0"
      num = num - parseFloat(locate[3].toString()) * 1000000000
      locate[2] = Math.floor(num / 1000000)
      if (isNaN(locate[2]))
        locate[2] = "0"
      locate[1] = Math.floor((num % 1000000) / 1000)
      if (isNaN(locate[1]))
        locate[1] = "0"
      locate[0] = Math.floor(num % 1000)
      if (isNaN(locate[0]))
        locate[0] = "0"
      if (locate[5] > 0) {
        count = 5
      } else if (locate[4] > 0) {
        count = 4
      } else if (locate[3] > 0) {
        count = 3
      } else if (locate[2] > 0) {
        count = 2
      } else if (locate[1] > 0) {
        count = 1
      } else {
        count = 0
      }
      for (i = count; i >= 0; i--) {
        tmp = this.threeDigitsToLetter(locate[i])
        _result += " " + tmp.trim()
        if (locate[i] > 0) _result += " " + unitOfnum[i]
      }
      _result = _result.substring(1, 2).toUpperCase() + _result.substring(2)
      if (_result !== "") {
        return _result.trim() + " đồng"
      } else {
        return ""
      }
    } else if (number === 0) {
      return "Không đồng"
    }
    return number
  }

  threeDigitsToLetter = (num) => {
    let letterOfnum = [" không ", " một ", " hai ", " ba ", " bốn ", " năm ", " sáu ", " bảy ", " tám ", " chín "]
    let tram, chuc, donvi, _result = ""
    tram = Math.floor(num / 100)
    chuc = Math.floor(num % 100 / 10)
    donvi = num % 10
    if (tram == 0 && chuc == 0 && donvi == 0) return ""
    if (tram != 0) {
      _result += letterOfnum[tram] + "trăm "
      if ((chuc == 0) && (donvi != 0)) _result += "linh"
    }
    if ((chuc != 0) && (chuc != 1)) {
      _result += letterOfnum[chuc] + "mươi "
      if ((chuc == 0) && (donvi != 0)) _result = _result + "linh"
    }
    if (chuc == 1) _result += "mười"
    switch (donvi) {
      case 1:
        if ((chuc != 0) && (chuc != 1)) {
          _result += "mốt"
        } else {
          _result += letterOfnum[donvi]
        }
        break
      case 5:
        if (chuc == 0) {
          _result += letterOfnum[donvi]
        } else {
          _result += " lăm"
        }
        break
      default:
        if (donvi != 0) {
          _result += letterOfnum[donvi]
        }
        break
    }
    return _result
  }

}
