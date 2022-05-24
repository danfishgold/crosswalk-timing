import { Button, ButtonGroup } from '@chakra-ui/button'
import { Input } from '@chakra-ui/input'
import { Flex } from '@chakra-ui/layout'
import { resetState, setJunctionTitle, toggleEditMode } from './reducer'
import { useDispatch, useSelector } from './store'
import { sectionWidthCss } from './styleUtils'

export default function Header() {
  return (
    <div css={sectionWidthCss}>
      <p>
        <strong>נוהל בטא</strong>: אם תנסו לשבור זה ישבר.
      </p>
      <EditModeToggle />
      <JunctionTitle />
    </div>
  )
}

function EditModeToggle() {
  const dispatch = useDispatch()
  const inEditMode = useSelector((state) => state.inEditMode)
  return (
    <ButtonGroup>
      <Button onClick={() => dispatch(toggleEditMode())}>
        {inEditMode ? 'שמירה' : 'עריכה'}
      </Button>
      {inEditMode && (
        <Button
          colorScheme='red'
          onClick={() => {
            if (window.confirm('בטוח?')) {
              dispatch(resetState())
            }
          }}
        >
          טאבולה ראסה
        </Button>
      )}
    </ButtonGroup>
  )
}

function JunctionTitle() {
  const dispatch = useDispatch()
  const inEditMode = useSelector((state) => state.inEditMode)
  const junctionTitle = useSelector((state) => state.junctionTitle)

  if (inEditMode) {
    return (
      <Flex direction='row' align='center' gap='16px'>
        <label css={{ flexShrink: 0 }}>שם הצומת</label>
        <Input
          size='lg'
          value={junctionTitle}
          onChange={(event) => dispatch(setJunctionTitle(event.target.value))}
        />
      </Flex>
    )
  } else if (junctionTitle) {
    return <h1 css={{ textAlign: 'center' }}>{junctionTitle}</h1>
  } else {
    return null
  }
}
