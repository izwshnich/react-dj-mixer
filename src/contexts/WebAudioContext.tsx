import * as React from 'react'
import { useMemo } from 'react'

interface IProps {
  children: React.ReactNode,
}

interface IStore {
  audioContext: AudioContext,
}

export const WebAudioContext = React.createContext({} as IStore)
export const WebAudioProvider: React.FC<IProps> = (props: IProps) => {
  const audioContext = useMemo(() => new ((window as any).AudioContext || (window as any).webkitAudioContext)(), [])

  const store: IStore = {
    audioContext,
  }

  return (
    <WebAudioContext.Provider value={store}>
      {props.children}
    </WebAudioContext.Provider>
  )
}