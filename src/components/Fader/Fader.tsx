import * as React from 'react'

interface IProps {
  val: string,
  min: string,
  max: string,
  step?: string,
  label: string,
  handleGain(args: string): void
}

const Fader: React.FC<IProps> = (props: IProps) =>
  <>
    <p>{props.label}</p>

    <span>{props.min}</span>

    <input
      type='range'
      min={props.min}
      max={props.max}
      step={props.step || '1'}
      value={props.val}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        props.handleGain(event.target.value)
      }
    />

    <span>{props.max}</span>
  </>

export default Fader