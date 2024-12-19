import React, { useState } from 'react'

import TimeEngine from './time-engine'
import TimeRule from './time-rule'

const Rule: React.FC = () => {
  const [switchTimeEngine, setSwitchTimeEngine] = useState(true)

  const handleSwitchTimeEngine = () => {
    setSwitchTimeEngine(!switchTimeEngine)
  }

  return (
    <>
      {switchTimeEngine ? (
        <TimeEngine switchTimeEngine={handleSwitchTimeEngine} />
      ) : (
        <TimeRule switchTimeEngine={handleSwitchTimeEngine} />
      )}
    </>
  )
}

export default Rule
