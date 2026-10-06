import {isValidElement, cloneElement} from 'react';

const hasChildren = node => node && (node.children || (node.props && node.props.children));

const getChildren = node =>
    node && node.children ? node.children : node.props && node.props.children;

const renderNodes = reactNodes => {
    if (typeof reactNodes === 'string') {
        return reactNodes;
    }
    
    return Object.keys(reactNodes).map((key, i) => {
        const child = reactNodes[key];
        const isElement = isValidElement(child);
        
        if (typeof child === 'string') {
            return child;
        }
        if (hasChildren(child)) {
            const inner = renderNodes(getChildren(child));
            return cloneElement(child, {...child.props, key: i}, inner);
        }
        if (typeof child === 'object' && !isElement) {
            return Object.keys(child).reduce((str, childKey) => `${str}${child[childKey]}`, '');
        }
        
        return child;
    });
};

const i18nMock = {
    language: 'en',
    changeLanguage: () => Promise.resolve(),
    loadNamespaces: () => Promise.resolve(),
    addResourceBundle: () => {
    },
    getResourceBundle: () => ({}),
    options: {},
};

const useMock = [
    k => k,
    {i18n: i18nMock},
];
useMock.t = k => k;
useMock.i18n = i18nMock;

export function withTranslation() {
    return Component => {
        Component.defaultProps = {...Component.defaultProps, t: k => k};
        return Component;
    };
}

export function Translation({children}) {
    return children(k => k, {i18n: i18nMock});
}

export function useTranslation() {
    return useMock;
}

export function I18nextProvider({children}) {
    return children;
}

export const initReactI18next = {
    type: '3rdParty',
    init: () => {
    },
};
