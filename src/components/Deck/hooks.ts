import { useMemo, useContext, useState, useEffect } from 'react'
import { Dispatch, SetStateAction } from 'react'
import { WebAudioContext } from 'contexts/WebAudioContext'

export function useFileReader(initialValue: File | null) {
  const reader = useMemo(() => new FileReader, [])

  const getDataUrl = (file: File): Promise<ArrayBuffer> => {
    return new Promise (resolve => {
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          const matches = reader.result.match(/^(.*?):(.*?);(.*?),(.*?)$/)
  
          if (matches) {
            const binary = atob(matches[4])
            const bytes = new Uint8Array(binary.length)
    
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i)
            }
    
            resolve(bytes.buffer)
          }
        }
      }
    })
  }

  const setFile = async (file = initialValue) => {
    if (file && file.size) {
      const buffer = await getDataUrl(file)

      return buffer
    }
  }

  return [setFile] as [(param: File) => Promise<ArrayBuffer>]
}

function useLowGain() {
  const { audioContext } = useContext(WebAudioContext)
  const [low] = useState(() => audioContext.createBiquadFilter() as BiquadFilterNode)
  const [lowValue, updateLowValue] = useState('0')

  useEffect(() => {
    low.type = 'lowshelf'
    low.gain.value = parseFloat(lowValue)
    low.frequency.value = 500
  }, [lowValue])

  const setLowValue = (val: string) => {
    updateLowValue(val)
  }

  return [low, lowValue, setLowValue] as [BiquadFilterNode, string, () => void]
}

function useMidGain() {
  const { audioContext } = useContext(WebAudioContext)
  const [mid] = useState(() => audioContext.createBiquadFilter() as BiquadFilterNode)
  const [midValue, updateMidValue] = useState('0')

  useEffect(() => {
    mid.type = 'peaking'
    mid.frequency.value = 1000
    mid.Q.value = Math.SQRT1_2
    mid.gain.value = parseFloat(midValue)
  }, [midValue])

  const setMidValue = (val: string) => {
    updateMidValue(val)
  }

  return [mid, midValue, setMidValue] as [BiquadFilterNode, string, () => void]
}

function useHiGain() {
  const { audioContext } = useContext(WebAudioContext)
  const [hi] = useState(() => audioContext.createBiquadFilter() as BiquadFilterNode)
  const [hiValue, updateHiValue] = useState('0')

  useEffect(() => {
    hi.type = 'lowshelf'
    hi.gain.value = parseFloat(hiValue)
    hi.frequency.value = 500
  }, [hiValue])

  const setHiValue = (val: string) => {
    updateHiValue(val)
  }

  return [hi, hiValue, setHiValue] as [BiquadFilterNode, string, () => void]
}

function useCrossFader(val: string) {
  const { audioContext } = useContext(WebAudioContext)
  const [crossfader] = useState(() => audioContext.createGain() as GainNode)

  useEffect(() => {
    crossfader.gain.value = parseFloat(val)
  }, [val])

  return [crossfader]
}

export function useAudio(val: string) {
  const { audioContext } = useContext(WebAudioContext)
  const [audioBuffer, updateAudioBuffer] = useState(null as AudioBuffer | null)
  const [canPlay, updateCanPlay] = useState(false)
  const [source, updateSource] = useState(null as AudioBufferSourceNode | null)
  const [playing, updatePlaying] = useState(false)
  const [low, lowVal, setLowVal] = useLowGain()
  const [mid, midVal, setMidVal] = useMidGain()
  const [hi, hiVal, setHiVal] = useHiGain()
  const [crossfader] = useCrossFader(val)
  const [playbackRate, updatePlaybackRate] = useState('1')

  const decoder = (buffer: ArrayBuffer): Promise<AudioBuffer> => {
    return new Promise((resolve, reject) => {
      try {
        audioContext.decodeAudioData(buffer, res => {
          if (res) resolve(res)
        })
      } catch(err) {
        reject(err)
      }
    })
  }

  const setSource = (buffer: AudioBuffer) => {
    const source = audioContext.createBufferSource()

    source.buffer = buffer
    source.loop = true
    source.playbackRate.value = parseFloat(playbackRate)
    source.connect(low)
    low.connect(mid)
    mid.connect(hi)
    hi.connect(crossfader)
    crossfader.connect(audioContext.destination)

    updateSource(source)
    updateCanPlay(true)
  }

  const setAudioBuffer = async (buffer: ArrayBuffer): Promise<void> => {
    const audioBuffer: AudioBuffer = await decoder(buffer)

    updateAudioBuffer(audioBuffer)
    setSource(audioBuffer)
  }

  const handlePlay = () => {
    if (source) {
      source.start(0)
      updatePlaying(true)
    }
  }

  const handlePause = () => {
    if (source) {
      source.stop()
      updatePlaying(false)
    }

    if (audioBuffer) {
      setSource(audioBuffer)
    }
  }

  const handleBPMChange = (val: string) => {
    updatePlaybackRate(val)
  }

  return [
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
  ] as [
    (param: ArrayBuffer) => void,
    () => void,
    () => void,
    boolean,
    boolean,
    string,
    string,
    string,
    string,
    Dispatch<SetStateAction<string>>,
    Dispatch<SetStateAction<string>>,
    Dispatch<SetStateAction<string>>,
    (param: string) => void
  ]
}