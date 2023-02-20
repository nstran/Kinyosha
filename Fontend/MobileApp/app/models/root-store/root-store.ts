import { Instance, SnapshotOut, types } from "mobx-state-tree"
// import { CharacterStoreModel } from "../character-store/character-store"
import { TnmModel } from "../tnm/tnm"

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model("RootStore").props({
  // characterStore: types.optional(CharacterStoreModel, {} as any),
  tnmStore: types.optional(TnmModel, {} as any),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {
}

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {
}
