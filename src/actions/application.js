import { call, put, select, takeLatest, takeEvery } from 'redux-saga/effects';
import {
  showLoading,
  hideLoading,
  resetLoading,
} from 'react-redux-loading-bar';
import api from '../utils/api/api';
import { MESSAGE_SEVERITY_ERROR } from '../constants/messages';

export const OPEN_DRAWER = 'OPEN_DRAWER';
export const openDrawer = () => ({
  type: OPEN_DRAWER,
});

export const CLOSE_DRAWER = 'CLOSE_DRAWER';
export const closeDrawer = () => ({
  type: CLOSE_DRAWER,
});

export const SET_MESSAGE = 'SET_MESSAGE';

/**
 *
 * @param {string} message - the message content
 * @param {string} severity - the severity level of the message, one of the levels
 *  listed at constants/messages.js
 * @returns {{type: string, payload: {message: *, messageInterface: *, messageSeverity: *}}}
 */
export const setMessage = (message, messageSeverity) => ({
  type: SET_MESSAGE,
  payload: {
    message,
    messageSeverity,
  },
});

export const CLEAR_MESSAGE = 'CLEAR_MESSAGE';
export const clearMessage = key => ({
  type: CLEAR_MESSAGE,
  payload: {
    key,
  },
});

export const CLEAR_ALL_MESSAGES = 'CLEAR_MESSAGES';
export const clearAllMessages = () => ({
  type: CLEAR_ALL_MESSAGES,
  payload: {},
});

export const MENU_REQUESTED = 'MENU_REQUESTED';
export const requestMenu = () => ({
  type: MENU_REQUESTED,
  payload: {},
});

export const MENU_LOADED = 'MENU_LOADED';
function* loadMenu() {
  try {
    yield put(resetLoading());
    yield put(showLoading());
    const menuLinks = yield call(api, 'menu');

    yield put({
      type: MENU_LOADED,
      payload: {
        menuLinks,
      },
    });
  } catch (error) {
    if (process.env.REACT_APP_DRUPAL_BASE_URL.includes('localhost')) {
      yield put(
        setMessage(
          'Unable to access data from Drupal. Did you set REACT_APP_DRUPAL_BASE_URL to localhost instead of 127.0.0.1?',
          MESSAGE_SEVERITY_ERROR,
        ),
      );
    }
    yield put(setMessage(error.toString(), MESSAGE_SEVERITY_ERROR));
  } finally {
    yield put(hideLoading());
  }
}

/**
 * Gets all available content types.
 */
export const CONTENT_TYPES_REQUESTED = 'CONTENT_TYPES_REQUESTED';
export const requestContentTypes = () => ({
  type: CONTENT_TYPES_REQUESTED,
  payload: {},
});

export const CONTENT_TYPES_LOADED = 'CONTENT_TYPES_LOADED';
function* loadContentTypes() {
  try {
    const contentTypes = yield call(api, 'contentTypes');
    yield put({
      type: CONTENT_TYPES_LOADED,
      payload: {
        contentTypes,
      },
    });
  } catch (error) {
    yield put(setMessage(error.toString(), MESSAGE_SEVERITY_ERROR));
  } finally {
    yield put(hideLoading());
  }
}

/**
 * Gets all available action types.
 */
export const ACTIONS_REQUESTED = 'ACTIONS_REQUESTED';
export const requestActions = () => ({
  type: ACTIONS_REQUESTED,
  payload: {},
});

export const getActionsCache = state => state.application.actions;
export const ACTIONS_LOADED = 'ACTIONS_LOADED';
function* loadActions() {
  try {
    let actions = { data: yield select(getActionsCache) };
    if (!Object.keys(actions.data).length) {
      actions = yield call(api, 'actions');
    }
    yield put({
      type: ACTIONS_LOADED,
      payload: {
        actions,
      },
    });
  } catch (error) {
    yield put(setMessage(error.toString(), MESSAGE_SEVERITY_ERROR));
  }
}

export default function* watchRequestedMenu() {
  yield takeLatest(MENU_REQUESTED, loadMenu);
  yield takeLatest(CONTENT_TYPES_REQUESTED, loadContentTypes);
  yield takeEvery(ACTIONS_REQUESTED, loadActions);
}
