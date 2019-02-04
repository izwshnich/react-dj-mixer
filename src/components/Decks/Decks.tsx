import * as React from 'react'
import { useState } from 'react'
import { WebAudioProvider } from 'contexts/WebAudioContext'
import Deck from 'components/Deck'
import Fader from 'components/Fader'
import Flex from 'styles/Flex'
import Box from 'styles/Box'

function useMasterGain() {
  const [masterGain, setMasterGain] = useState('0')
  const leftGain = `${Math.cos(parseFloat(masterGain) * 0.5 * Math.PI)}`
  const rightGain = `${Math.cos((1.0 - parseFloat(masterGain)) * 0.5 * Math.PI)}`

  const handleMasterGain = (val: string) => {
    setMasterGain(val)
  }

  return [masterGain, leftGain, rightGain, handleMasterGain] as [
    string,
    string,
    string,
    (args: string) => void
  ]
}

const Decks = () => {
  const [masterGain, leftGain, rightGain, handleMasterGain] = useMasterGain()

  return (
    <WebAudioProvider>
      <Flex>
        <Deck gain={leftGain} />
        <Deck gain={rightGain} />
      </Flex>

      <Box>
        <Fader val={masterGain} min={'0'} max={'1'} step={'0.01'} handleGain={handleMasterGain} label={'CROSSFADER'} />
      </Box>
    </WebAudioProvider>
  )
}

export default Decks