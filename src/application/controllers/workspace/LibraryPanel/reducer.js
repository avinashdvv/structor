/*
 * Copyright 2015 Alexander Pustovalov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {forOwn, isObject} from 'lodash';
import * as actions from './actions.js';
import {recentGroupKey} from './constants';

const initialState = {
    componentsTree: {},
    componentsList: [],
    groupsList: [],
    defaultVariantMap: {},
    componentInPreview: undefined,
    variantsInPreview: [],
    expandedGroupKeys: {},
    recentlyUsed: [],
};

export default (state = initialState, action = {}) => {

    const {type, payload} = action;

    if(type === actions.SET_COMPONENTS){
        const {componentsTree} = payload;
        let componentsList = [];
        let groupsList = [];
        forOwn(componentsTree, (group, groupName) => {
            if (isObject(group)) {
                groupsList.push(groupName);
                forOwn(group, (componentTypeValue, componentName) => {
                    componentsList.push(componentName);
                });
            }
        });
        return Object.assign({}, state, {
            componentsTree: componentsTree,
            componentsList: componentsList,
            groupsList: groupsList
        });
    }

    if(type === actions.PREVIEW_COMPONENT){
        const {componentName, variants} = payload;
        let defaultVariantMap = state.defaultVariantMap;
        let defaultVariant = defaultVariantMap[componentName];
        if(!defaultVariant || !defaultVariant.key){
            if(variants && variants.length > 0){
                defaultVariantMap[componentName] = { key: variants[0] };
            }
        }
        return Object.assign({}, state, {
            componentInPreview: componentName,
            variantsInPreview: variants,
            defaultVariantMap: defaultVariantMap
        });
    }

    if(type === actions.HIDE_PREVIEW){
        return Object.assign({}, state, {
            componentInPreview: undefined
        });
    }

    if(type === actions.SET_DEFAULT_VARIANT) {
        let defaultVariantMap = state.defaultVariantMap;
        defaultVariantMap[payload.componentName] = { key: payload.variant };
        return Object.assign({}, state, {
            defaultVariantMap: defaultVariantMap
        });
    }

    if(type === actions.TOGGLE_PANEL_GROUP) {
        let newExpandedGroupKeys = Object.assign({}, state.expandedGroupKeys);
        newExpandedGroupKeys[payload] = !newExpandedGroupKeys[payload];
        return Object.assign({}, state, {
            expandedGroupKeys: newExpandedGroupKeys
        });
    }

    if(type === actions.ADD_RECENTLY_USED) {
        let newState = Object.assign({}, state);
        let newRecentlyUsed = [].concat(state.recentlyUsed);
        if(newRecentlyUsed.length === 0) {
            let newExpandedGroupKeys = Object.assign({}, state.expandedGroupKeys);
            newExpandedGroupKeys[recentGroupKey] = true;
            newState.expandedGroupKeys = newExpandedGroupKeys;
        }
        const found = newRecentlyUsed.find(i => payload === i);
        if(!found){
            newRecentlyUsed.splice(0, 0, payload);
        }
        if(newRecentlyUsed.length > 10){
            newRecentlyUsed = newRecentlyUsed.slice(0, 10);
        }
        newState.recentlyUsed = newRecentlyUsed;
        return newState;
    }

    return state;
}

