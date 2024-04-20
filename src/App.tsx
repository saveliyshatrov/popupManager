import { useState, createContext, useContext, useCallback } from 'react'

import {Popup, PopupContext, InjectPopupContextProps, usePopups, PopupCreator} from './PopupManager';
import './App.css'

const PopupTest = ({name, text}: InjectPopupContextProps<{text: string}>) => {
  const {closePopup} = useContext(PopupContext);
  return <div onClick={closePopup({name})} style={{boxSizing: 'border-box', padding: 5, border: '1px solid white', marginTop: 5, marginLeft: 5, borderRadius: 5}}>{text}, {name}</div>
}

function App() {
  const popupsContext = usePopups({});
  const [counter, setCounter] = useState(0)
  const handleClick = () => {
    popupsContext.push([{
      name: `name-${counter}`,
      Component: PopupTest,
      props: {
        text: 'IM SINGLE'
      }
    }])
    setCounter(prev => prev + 1);
  };
  const handleClickMultiple = () => {
    popupsContext.push([
      {
        name: `name-${counter}1`,
        Component: PopupTest,
        props: {
          text: 'My name FIRST'
        }
      },
      {
        name: `name-${counter}2`,
        Component: PopupTest,
        props: {
          text: 'My name SECOND'
        }
      },
      {
        name: `name-${counter}3`,
        Component: PopupTest,
        props: {
          text: 'My name THIRD'
        }
      }
    ]);
    setCounter(prev => prev + 3);
  };
  const handleInject = () => {
    popupsContext.pushToCurrent([{
      name: `name-${counter}`,
      Component: PopupTest,
      props: {
        text: 'IM ADDED'
      }
    }])
    setCounter(prev => prev + 1);
  }
  const handleInjectMultiple = () => {
    popupsContext.pushToCurrent([
      {
        name: `name-0${counter}`,
        Component: PopupTest,
        props: {
          text: 'IM ADDED MULTIPLE 1'
        }
      },
      {
        name: `name-1${counter}`,
        Component: PopupTest,
        props: {
          text: 'IM ADDED MULTIPLE 2'
        }
      }
    ])
    setCounter(prev => prev + 1);
  }
  return (
    <>
      <PopupContext.Provider value={popupsContext}>
        <div style={{display: 'flex', flexDirection: 'row', gap: 5, flexWrap: 'wrap', justifyContent: 'center'}}>
          <button onClick={handleClick}>Создать один попап</button>
          <button onClick={handleClickMultiple}>Создать несколько попапов</button>
          <button onClick={handleInject}>Добавить попап в стопку</button>
          <button onClick={handleInjectMultiple}>Добавить 2 попапа в стопку</button>
          <button onClick={popupsContext.closePopup()}>Убить всю стопку</button>
        </div>
        <PopupCreator/>
      </PopupContext.Provider>
    </>
  )
}

export default App
