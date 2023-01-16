import { useSelector } from '../store'
import { JunctionSvg } from './JunctionSvg'

export default function JunctionSection() {
  const inEditMode = useSelector((state) => state.inEditMode)

  return <JunctionSvg inEditMode={inEditMode} />
}
