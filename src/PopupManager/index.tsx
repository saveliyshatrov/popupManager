import { useState, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
export type Popup = {
    name: string;
    Component: React.ReactNode;
    zIndex?: number;
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

    const push = (values: Popup[]) => {
        if (!values.length) return;
        const names = [];
        values.forEach(value => {
            names.push(value.name);
            value.zIndex = value.zIndex || lastZIndex;
            if(value.zIndex === lastZIndex) {
                setLastZIndex(prev => prev + 1);
            }
            setPopups(prev => ({
                ...prev,
                [value.name]: value,
            }))
        })
        setStack(prev => [...(prev || []), names]);
        setPopupsCount(prev => prev + values.length);
    }
    const pushToCurrent = (values: Popup[]) => {
        values.forEach(value => {
            value.zIndex = value.zIndex || lastZIndex;
            if(value.zIndex === lastZIndex) {
                setLastZIndex(prev => prev + 1);
            }
            setPopups((prev) => ({
                ...prev,
                [value.name]: value,
            }));
            setStack(prev => {
                const [prevFirst, ...otherPrev] = prev;
                const newFirst = [...(prevFirst || []), value.name];
                return [newFirst, ...otherPrev];
            });
            setPopupsCount(prev => prev + 1);
        })
    }
    const closePopup = (options:{name?: string} | undefined) => () => {
        const {name} = options || {};
        setPopupsCount(prev => prev - 1);
        setLastZIndex(prev => prev - 1);
        if (name) {
            setStack(prev => {
                if (!prev.length) return [];
                prev[0] = prev[0].filter(popupName => popupName !== name);
                return prev.filter(subStack => subStack.length > 0);
            })
            setPopups(prev => {
                delete prev[name];
                return prev;
            })
        } else {
            setPopups(prev => {
                if (stack && stack[0].length) {
                    stack[0].forEach(name => {
                        delete prev[name];
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

export const PopupCreator = ({withOverlay}: {withOverlay?: boolean}) => {
    const {popups, stack, closePopup} = useContext(PopupContext);
    if(!(stack[0] || []).length) return null;
    const popupsList = (stack[0]).map(name => popups[name]).map(({Component, name, props}) => <Component key={name} name={name} {...props}/>);
    const handleClick = () => {
        closePopup({name: stack[0][0]})();
    }
    const portalProps = {
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
    return createPortal(<div {...portalProps}>{popupsList}</div>, document.body)
}