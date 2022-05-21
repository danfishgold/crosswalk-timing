import { crosswalkKey, selectCrosswalkIds } from '../reducer'
import { useSelector } from '../store'
import { sectionWidthCss } from '../styleUtils'

export default function SimulationDisclaimer() {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const walkTimes = useSelector((state) => state.walkTimes)

  const times = crosswalkIds
    .map(
      (id, index) => `${walkTimes[crosswalkKey(id)]} שניות במעבר ${index + 1}`,
    )
    .join(', ')

  if (!times) {
    return null
  }

  return (
    <div css={[{ fontSize: '0.8rem', marginTop: '30px' }, sectionWidthCss]}>
      *בהנחה של משך החציה הבא לכל מעבר חציה: {times}
    </div>
  )
}
