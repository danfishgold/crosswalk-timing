import styled from '@emotion/styled'
import { sectionWidthCss } from '../styleUtils'

const JunctionSvgAndCompanionWrapper = styled.div([
  sectionWidthCss,
  {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: '40px',
  },
])

export default JunctionSvgAndCompanionWrapper
