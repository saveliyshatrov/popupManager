import { useState, createContext, useContext, useCallback } from 'react'

import {Popup, PopupContext, InjectPopupContextProps, usePopups, PopupCreator} from './PopupManager';
import './App.css'

const PopupTest = ({name, text}: InjectPopupContextProps<{text: string}>) => {
  const {closePopup} = useContext(PopupContext);
  return <div onClick={closePopup({name})} style={{boxSizing: 'border-box', padding: 5, border: '1px solid white', marginTop: 5, marginLeft: 5, borderRadius: 5}}>{text}, {name}</div>
}

function App() {
  const popupsContext = usePopups({});
  const [counter, setCounter] = useState(0);
  const [popupSettings, setPopupSettings] = useState({});
  const [multiplePopupValues, setMultiplePopupValues] = useState({});
  const insertValueToPopupSettings = (props: {useOverlay?: boolean, closeWithOtherOverlayed?: boolean, name?: string}) => {
    setPopupSettings(prev => ({
      ...prev,
      ...props,
    }))
  };
  const handleClick = (custom) => () => {
    popupsContext.push([{
      Component: PopupTest,
      props: {
        text: 'I was created'
      },
      ...custom,
    }])
    setCounter(prev => prev + 1);
  };
  const handleClickMultiple = (custom) => () => {
    const {name, ...otherCustom} = custom || {};
    popupsContext.push([
      {
        name: `name-${counter}1`,
        Component: PopupTest,
        ...otherCustom,
        props: {
          text: 'I was created FIRST'
        }
      },
      {
        name: `name-${counter}2`,
        Component: PopupTest,
        ...otherCustom,
        props: {
          text: 'I was created SECOND'
        }
      },
      {
        name: `name-${counter}3`,
        Component: PopupTest,
        ...otherCustom,
        props: {
          text: 'I was created THIRD'
        }
      }
    ]);
    setCounter(prev => prev + 3);
  };
  const handleInject = (custom) => () => {
    const {name, ...otherCustom} = custom || {};
    popupsContext.pushToCurrent([{
      name: `${name || 'name'}-${counter}`,
      Component: PopupTest,
      ...otherCustom,
      props: {
        text: 'Im was added to stack'
      }
    }])
    setCounter(prev => prev + 1);
  }
  const handleInjectMultiple = (custom) => () => {
    const {name, ...otherCustom} = custom || {};
    popupsContext.pushToCurrent([
      {
        name: `name-0${counter}`,
        Component: PopupTest,
        ...otherCustom,
        props: {
          text: 'Im was added to stack #1'
        }
      },
      {
        name: `name-1${counter}`,
        Component: PopupTest,
        ...otherCustom,
        props: {
          text: 'Im was added to stack #2'
        }
      }
    ])
    setCounter(prev => prev + 1);
  }
  return (
    <>
      <PopupContext.Provider value={popupsContext}>
        <div style={{display: 'flex', padding: 5, border: '1px solid black', borderRadius: 8, flexDirection: 'column', gap: 5, marginBottom: 5}}>
          <input placeholder="Custom popup name" onChange={e => insertValueToPopupSettings({name: event.target.value})}/>
          <label><input type="checkbox" onChange={e => insertValueToPopupSettings({useOverlay: event.target.checked})}/>Использовать overlay</label>
          <label><input type="checkbox" onChange={e => insertValueToPopupSettings({closeWithOtherOverlayed: event.target.checked})}/>Закрыввать с другими по нажатию на overlay</label>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', gap: 5, flexWrap: 'wrap', justifyContent: 'center'}}>
          <button onClick={handleClick(popupSettings)}>Создать один попап</button>
          <button onClick={handleClickMultiple(popupSettings)}>Создать несколько попапов</button>
          <button onClick={handleInject(popupSettings)}>Добавить попап в стопку</button>
          <button onClick={handleInjectMultiple(popupSettings)}>Добавить 2 попапа в стопку</button>
          <button onClick={popupsContext.closePopup()}>Убить всю стопку</button>
        </div>
        <PopupCreator/>
      </PopupContext.Provider>
    </>
  )
}

export default App
