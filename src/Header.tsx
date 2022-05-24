import { Button, ButtonGroup } from '@chakra-ui/button'
import { Input } from '@chakra-ui/input'
import { Heading } from '@chakra-ui/layout'
import { FormControl, FormLabel } from '@chakra-ui/react'
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
      <FormControl>
        <FormLabel>שם הצומת</FormLabel>
        <Input
          size='lg'
          placeholder='שם הצומת'
          value={junctionTitle}
          onChange={(event) => dispatch(setJunctionTitle(event.target.value))}
        />
      </FormControl>
    )
  } else if (junctionTitle) {
    return (
      <Heading as='h1' textAlign='center'>
        {junctionTitle}
      </Heading>
    )
  } else {
    return null
  }
}
