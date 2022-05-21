import { resetState, setJunctionTitle, toggleEditMode } from './reducer'
import { useDispatch, useSelector } from './store'
import { sectionWidthCss } from './styleUtils'

export default function Header() {
  return (
    <div css={sectionWidthCss}>
      <p>
        <strong>נוהל בטא</strong>: אם תנסו לשבור זה ישבר. אם תנסו להשתמש בזה
        בטלפון זה כנראה גם ישבר
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
    <div>
      <button onClick={() => dispatch(toggleEditMode())}>
        {inEditMode ? 'שמירה' : 'עריכה'}
      </button>
      {inEditMode && (
        <button
          onClick={() => {
            if (window.confirm('בטוח?')) {
              dispatch(resetState())
            }
          }}
        >
          טאבולה ראסה
        </button>
      )}
    </div>
  )
}

function JunctionTitle() {
  const dispatch = useDispatch()
  const inEditMode = useSelector((state) => state.inEditMode)
  const junctionTitle = useSelector((state) => state.junctionTitle)

  if (inEditMode) {
    return (
      <div>
        <label>שם הצומת</label>
        <input
          value={junctionTitle}
          onChange={(event) => dispatch(setJunctionTitle(event.target.value))}
        />
      </div>
    )
  } else if (junctionTitle) {
    return <h1 css={{ textAlign: 'center' }}>{junctionTitle}</h1>
  } else {
    return null
  }
}
