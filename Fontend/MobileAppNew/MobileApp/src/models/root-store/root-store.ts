import {Instance, SnapshotOut, types} from 'mobx-state-tree';
// import { CharacterStoreModel } from "../character-store/character-store"
import {KinyoshaModel} from '../moves/moves';

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model('RootStore').props({
  // characterStore: types.optional(CharacterStoreModel, {} as any),
  kinyoshaModel: types.optional(KinyoshaModel, {} as any),
});

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
