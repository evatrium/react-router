import React, {useState, useEffect, useMemo, forwardRef, useRef, useCallback} from 'react';
import {getParams, stringifyParams, url, isObj, isFunc, isString, propsChanged} from '@iosio/util';

export {getParams, stringifyParams, url}

export const usePrevious = (value) => {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref;
};

export const parsePath = (path) => {
    const [stringBeforeHash, hash] = path.split('#');
    const [pathname, query] = stringBeforeHash.split('?');
    return {
        pathname: pathname || '',
        query: query || '',
        params: query ? getParams(`?${query}`) : {},
        hash: hash || '',
        path: path
    };
};

export const buildPath = (path, query, hash) => {
    if (query) path += `?${isObj(query) ? stringifyParams(query) : query}`;
    if (hash) path += `#${hash}`;
    return path;
};

const getCurrentState = () => ({
    pathname: window.location.pathname,
    query: window.location.search.slice(1),
    params: getParams(),
    hash: window.location.hash.slice(1),
    path: window.location.href.replace(window.location.origin, '')
});

const savedSetStates = [];
const syncState = (state = getCurrentState()) => {
    for (const setState of savedSetStates) setState(state);
};

const onPopSyncState = () => syncState();

export const navigate = (newPath, replace) => {
    let path = '/', nextState = parsePath(path), currentState = getCurrentState(),
        str = isString(newPath), obj = isObj(newPath), func = isFunc(newPath);
    if (str) {
        path = newPath;
        nextState = parsePath(path);
    } else if (obj || func) {
        let update = (func ? newPath(currentState) : newPath) || {};
        let {pathname = '', query = '', params, hash = ''} = update;
        query = isObj(params) ? stringifyParams(params) : query;
        path = buildPath(pathname, query, hash);
        nextState = {pathname, query, hash, params: params || {}, path};
    }
    if (currentState.path !== path) {
        window.history[`${replace ? 'replace' : 'push'}State`](null, '', path);
        syncState(nextState);
    }
};

export const useLocation = () => {

    let [state, setState] = useState(getCurrentState);

    useEffect(() => {
        savedSetStates.push(setState);
        if (savedSetStates.length === 1) {
            window.addEventListener('popstate', onPopSyncState);
        }
        return () => {
            savedSetStates.splice(savedSetStates.indexOf(setState), 1);
            if (savedSetStates.length === 0) {
                window.removeEventListener('popstate', onPopSyncState);
            }
        };
    }, []);

    return [state, navigate];
};

function routeFromLink(node) {
    // only valid elements
    if (!node || !node.getAttribute) return;
    let href = node.getAttribute('href'), target = node.getAttribute('target');
    // ignore links with targets and non-path URLs
    if (!href || (target && !target.match(/^_?self$/i))) return;  // || !href.match(/^\//g)
    return navigate(href);
}

export function handleLinkClick(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button !== 0) return;
    routeFromLink(e.currentTarget || e.target || this);
    return prevent(e);
}

function prevent(e) {
    if (!e) return false;
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (e.stopPropagation) e.stopPropagation();
    e.preventDefault();
}

function delegateLinkHandler(e) {
    // ignore events the browser takes care of already:
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button !== 0) return;
    let t = e.target;
    do {
        if (String(t.nodeName).toUpperCase() === 'A' && t.getAttribute('href')) {
            if (t.hasAttribute('data-native') || t.hasAttribute('native')) return;
            // if link is handled by the router, prevent browser defaults
            if (routeFromLink(t)) return prevent(e);
        }
    } while ((t = t.parentNode));
}

let eventListenersInitialized = false;

function initEventListeners() {
    if (eventListenersInitialized) return;
    eventListenersInitialized = true;
    if (isFunc(addEventListener)) {
        addEventListener('click', delegateLinkHandler);
        return () => removeEventListener('click', delegateLinkHandler);
    }
}


const EMPTY_OBJECT = {};
const EmptyRout = () => null;
const _getPathForPathMap = pathname => pathname;
const _getRoute = (path, pathMap) => isFunc(pathMap[path]) ? pathMap[path] : pathMap[path]?.Route;
const _getTitle = (path, pathMap) => pathMap[path]?.title || '';
const _getBasePath = path => `/${path.split('/')[1]}`;

const _determineRoute =
    ({
         nested, pathMap, getPathForPathMap,
         pathname, lastPathname, lastUrl, fallbackPath,
         navigate, getRoute, getTitle, NotFound
     } = {}) => {

        if (!nested && !pathMap[getPathForPathMap(pathname)]) {
            let replaceHistoryWith;
            if ((pathname !== lastPathname) && pathMap[getPathForPathMap(lastPathname)]) {
                replaceHistoryWith = lastUrl;
                pathname = lastPathname;
            } else {
                pathname = fallbackPath;
                replaceHistoryWith = fallbackPath;
            }
            navigate(replaceHistoryWith, true);
        }

        const Route = getRoute(getPathForPathMap(pathname), pathMap) || NotFound;
        const title = getTitle(getPathForPathMap(pathname), pathMap) || '';

        return {Route, title}
    };

export const useRouter =
    ({
         pathMap = EMPTY_OBJECT,
         routeOnBasePath,
         getPathForPathMap = routeOnBasePath ? _getBasePath : _getPathForPathMap,
         nested,
         getRoute = _getRoute,
         getTitle = _getTitle,
         NotFound = EmptyRout,
         fallbackPath = '/',
         determineRoute = _determineRoute
     } = {}) => {

        useEffect(initEventListeners, []);

        let [state, navigate] = useLocation();
        let {pathname, path} = state;

        const {current: lastUrl} = usePrevious(path);
        const {current: lastPathname} = usePrevious(pathname);


        const {Route, title} = useMemo(() => determineRoute({
            nested, pathMap, getPathForPathMap, pathname, lastPathname,
            lastUrl, fallbackPath, navigate, getRoute, getTitle, NotFound
        }), [pathname, pathMap]);


        useMemo(() => {
            title && (window.document.title = title);
        }, [title]);

        return {Route, state, lastUrl, lastPathname, title, navigate}
    }

export const useHrefLink = ({to, toParams} = {}) => {
    const href = useMemo(() => {
        toParams = (isFunc(toParams) ? toParams(getParams()) : toParams) || '';
        return url`${to}${toParams}`
    }, [to, toParams]);

    return {href, onClick: handleLinkClick}
}

export const useIsLinkActive = (href, {activate = 'pathname', isActive} = {}) => {

    const [activatePathname, activateQuery, activateHash, exact, basePath] = useMemo(() => {
        if (activate === 'pathname') return [true];
        const parts = activate.split(',').map(x => x.trim());
        const exactPathname = parts.includes('exactPathname');
        const basePath = parts.includes('basePath');
        return [
            parts.includes('pathname') || exactPathname || basePath,
            parts.includes('query') || parts.includes('params'),
            parts.includes('hash'),
            exactPathname,
            basePath
        ];
    }, [activate]);

    const [state] = useLocation();

    const dif = `${activatePathname ? state.pathname : ''}` +
        `${activateQuery ? state.query : ''}` +
        `${activateHash ? state.hash : ''}`

    return useMemo(() => {
        const hrefParts = parsePath(href);
        if (isFunc(isActive)) return isActive(state, hrefParts);
        const {pathname, params, hash} = hrefParts
        let pathMatch;
        if (activatePathname) {
            const p = basePath ? `/${state.pathname.split('/')[1]}` : state.pathname;
            if (exact || pathname === '/') pathMatch = pathname === p
            else pathMatch = pathname.startsWith(p) && p.startsWith(pathname);
        }

        return [
            activatePathname && pathMatch,
            activateQuery && !propsChanged(params, state.params),
            activateHash && (hash === state.hash)
        ].some(Boolean);

    }, [href, dif]);
}

export const Linkage = forwardRef(({to, toParams, onClick, ...rest}, ref) => {
    const {href, onClick: linkClick} = useHrefLink({to, toParams});
    const handleClick = useCallback((e) => {
        onClick && onClick(e)
        linkClick(e);
    }, [onClick]);
    return (
        <a ref={ref} href={href} onClick={handleClick} {...rest} />
    )
});

export const ActiveLinkage = forwardRef(
    ({
         to, toParams,
         isActive, activate, activatedClassName = 'active',
         className, onClick,
         ...rest
     }, ref) => {
        const {href, onClick: linkClick} = useHrefLink({to, toParams});
        const isActivated = useIsLinkActive(href, {activate, isActive});
        const handleClick = useCallback((e) => {
            onClick && onClick(e)
            linkClick(e);
        }, [onClick]);
        return (
            <a ref={ref} href={href} onClick={handleClick}
               className={`${isActivated ? activatedClassName : ''}${className || ''}`}
               {...rest}
            />
        )
    });