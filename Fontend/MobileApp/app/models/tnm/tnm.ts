import { Instance, SnapshotOut, types } from "mobx-state-tree"

const AuthModel = types.model("Auth").props({
  userName: types.maybe(types.string),
  password: types.maybe(types.string),
})

const UserInfoModel = types.model("UserInfo").props({
  userId: types.maybe(types.string),
  employeeId: types.maybe(types.string),
  accessToken: types.maybe(types.string),
  userAvatar: types.maybe(types.string),
  email: types.maybe(types.string),
  firstName: types.maybe(types.string),
  lastName: types.maybe(types.string),
})

/**
 * Model description here for TypeScript hints.
 */
export const TnmModel = types
  .model("Tnm")
  .props({
    auth: types.optional(types.maybe(AuthModel), {
      userName: "",
      password: "",
    }),
    userInfo: types.optional(types.maybe(UserInfoModel), {
      userId: "",
      employeeId: "",
      accessToken: "",
      userAvatar: "",
      email: "",
      firstName: "",
      lastName: "",
    }),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setAuth(value) {
      if (value?.userName != null) {
        self.auth.userName = value?.userName
      }
      if (value?.password != null) {
        self.auth.password = value?.password
      }
    },
    setUserInfo(value) {
      if (value?.userId != null) {
        self.userInfo.userId = value?.userId
      }
      if (value?.employeeId != null) {
        self.userInfo.employeeId = value?.employeeId
      }
      if (value?.accessToken != null) {
        self.userInfo.accessToken = value?.accessToken
      }
      if (value?.userAvatar != null) {
        self.userInfo.userAvatar = ""
      }
      if (value?.email != null) {
        self.userInfo.email = value?.email
      }
      if (value?.firstName != null) {
        self.userInfo.firstName = value?.firstName
      }
      if (value?.lastName != null) {
        self.userInfo.lastName = value?.lastName
      }
    },
    setUserInfoPath(type, value) {
      self.userInfo[type] = value ? value : ""
    },
    setAuthPath(type, value) {
      self.auth[type] = value ? value : ""
    },
    logout() {
      self.auth.userName = ""
      self.auth.password = ""

      self.userInfo.userId = ""
      self.userInfo.employeeId = ""
      self.userInfo.accessToken = ""
      self.userInfo.userAvatar = ""
      self.userInfo.email = ""
      self.userInfo.firstName = ""
      self.userInfo.lastName = ""
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

type TnmType = Instance<typeof TnmModel>

export interface Tnm extends TnmType {
}

type TnmSnapshotType = SnapshotOut<typeof TnmModel>

export interface TnmSnapshot extends TnmSnapshotType {
}

export const createTnmDefaultModel = () => types.optional(TnmModel, {})
