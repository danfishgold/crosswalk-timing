export default function SimulationLegend() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto auto auto',
        gap: '20px',
      }}
    >
      <span />
      <span style={{ gridColumn: 'span 3', textAlign: 'center' }}>
        משך חציית הצומת
      </span>
      <span>מסלול</span>
      <span>מינימלי</span>
      <span>מקסימלי</span>
      <span>ממוצע</span>
      <span>{[1, 2, 3].map((index) => index + 1).join(' → ')}</span>
    </div>
  )
}
