import * as React from 'react'
import { useFileReader, useAudio } from './hooks'
import Fader from 'components/Fader'
import Box from 'styles/Box'

interface IProps {
  gain: string
}

const Deck: React.FC<IProps> = props => {
  const [setFIle] = useFileReader(null)
  const [
    setAudioBuffer,
    handlePlay,
    handlePause,
    canPlay,
    playing,
    lowVal,
    midVal,
    hiVal,
    playbackRate,
    setLowVal,
    setMidVal,
    setHiVal,
    handleBPMChange
  ] = useAudio(props.gain)

  const handleClick = () => {
    if (playing) {
      handlePause()
    } else {
      handlePlay()
    }
  }

  return (
    <Box>
      <div>
        <input type='file' accept='audio/*' onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          if (event.target && event.target.files && event.target.files.length) {
            setFIle(event.target.files[0]).then(buffer => setAudioBuffer(buffer))
          }
        }} />

        <button onClick={handleClick} disabled={!canPlay}>
          {playing ? '■' : '▶︎'}
        </button>
      </div>

      <Fader val={lowVal} min={'-40'} max={'40'} handleGain={setLowVal} label={'LOW'} />

      <Fader val={midVal} min={'-40'} max={'40'} handleGain={setMidVal} label={'MID'} />

      <Fader val={hiVal} min={'-40'} max={'40'} handleGain={setHiVal} label={'HI'} />

      <Fader val={playbackRate} min={'0.05'} max={'2'} handleGain={handleBPMChange} label={'BPM'} />
    </Box>
  )
}

export default Deck