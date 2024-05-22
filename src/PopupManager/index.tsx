import { useState, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
export type Popup = {
    name?: string;
    Component: React.ReactNode;
    zIndex?: number;
    useOverlay?: boolean;
    closeWithOtherOverlayed?: boolean;
}

export type InjectPopupContextProps<T> = T & {
    name: string;
}

export const PopupContext = createContext({});

export const usePopups = ({initialZIndex}: {initialZIndex?: number}) => {
    const [lastZIndex, setLastZIndex] = useState(initialZIndex || 1400);
    const [popups, setPopups] = useState({});
    const [stack, setStack] = useState([]);
    const [popupsCount, setPopupsCount] = useState(0);

    const getPopupName = (value: Popup) => {
        return value.name ? value.name : `${value.Component.name}-${popupsCount}`;
    }

    const push = (values: Popup[]) => {
        const createdIdNames = [];
        values.forEach(value => {
            setPopupsCount(prev => prev + 1);
            const name = getPopupName(value);
            createdIdNames.push(name);
            value.zIndex = value.zIndex || lastZIndex;
            if(value.zIndex === lastZIndex) {
                setLastZIndex(prev => prev + 1);
            }
            setPopups(prev => ({
                ...prev,
                [name]: {
                    ...value,
                    name,
                },
            }))
        })
        setStack(prev => [...(prev || []), createdIdNames]);
        return createdIdNames;
    }
    const pushToCurrent = (values: Popup[]) => {
        const createdIdNames = [];
        values.forEach(value => {
            const name = getPopupName(value);
            createdIdNames.push(name);
            value.zIndex = value.zIndex || lastZIndex;
            if(value.zIndex === lastZIndex) {
                setLastZIndex(prev => prev + 1);
            }
            setPopups((prev) => ({
                ...prev,
                [name]: {
                    ...value,
                    name,
                },
            }));
            setStack(prev => {
                const [prevFirst, ...otherPrev] = prev;
                const newFirst = [...(prevFirst || []), name];
                return [newFirst, ...otherPrev];
            });
            setPopupsCount(prev => prev + 1);
        });
        return createdIdNames;
    }
    const closePopup = (options: { name?: string } | { names?: string[] } | undefined) => () => {
        const names = ((options || {}).names || [(options || {}).name]).filter(Boolean);
        setPopupsCount(prev => prev - 1);
        setLastZIndex(prev => prev - 1);
        if (names.length) {
            names.forEach(name => {
                setStack(prev => {
                    if (!prev.length) return [];
                    prev[0] = prev[0].filter(popupName => popupName !== name);
                    return prev.filter(subStack => subStack.length > 0);
                })
                setPopups(prev => {
                    const isUsedInStack = stack.reduce((acc, subStack) => subStack.includes(name) || acc, false);
                    if (!isUsedInStack) {
                        delete prev[name];
                    }
                    return prev;
                })
            })
        } else {
            setPopups(prev => {
                if (stack && stack.length && stack[0].length) {
                    stack[0].forEach(name => {
                        const isUsedInStack = stack.reduce((acc, subStack) => subStack.includes(name) || acc, false);
                        if (!isUsedInStack) {
                            delete prev[name];
                        }
                    })
                }
                return prev;
            })
            setStack(prev => {
                if (!prev.length) return [];
                const [first, ...other] = prev;
                return other;
            })
        }
    };
    return {
        push,
        pushToCurrent,
        popups,
        stack: stack || [],
        closePopup,
    }
};

export const PopupCreator = () => {
    const {popups, stack, closePopup} = useContext(PopupContext);
    if(!(stack[0] || []).length) return null;
    const popupsList = (stack[0]).map(name => popups[name]).map(({Component, name, props, zIndex}) => <div key={name} style={{zIndex}}><Component name={name} {...props}/></div>);
    const popupsWithOverlay = stack[0].filter(name => popups[name].useOverlay);
    const closeWithOtherOverlayed = popupsWithOverlay.filter(name => popups[name].closeWithOtherOverlayed);
    const withOverlay = popupsWithOverlay.length > 0;

    const handleClick = () => {
        if (closeWithOtherOverlayed.length) {
            closePopup({names: closeWithOtherOverlayed})();
            return;
        } else {
            closePopup({name: popupsWithOverlay[0]})();
        }
    }
    const portalProps = {
        style: {
            position: 'absolute',
            top: 0,
            left: 0,
        }
    }

    const overlayProps = {
        onClick: withOverlay ? handleClick : undefined,
        style: {
            position: 'absolute',
            ...(withOverlay ? {
                height: '100vh',
                width: '100vw',
            } : {}),
            top: 0,
            left: 0,
        }
    }
    return createPortal(<div {...portalProps}>
            {popupsList}
        <div {...overlayProps}/>
    </div>, document.body)
}