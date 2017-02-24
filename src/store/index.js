// @flow
import DataStore from './DataStore'
import ModalStore from './ModalStore'
import PreferenceStore from './PreferenceStore'
import UIState from './UIState'

export const preferenceStore = new PreferenceStore()
export const uiState = new UIState()
export const dataStore = new DataStore(preferenceStore, uiState)
export const modalStore = new ModalStore()
