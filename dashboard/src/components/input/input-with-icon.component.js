import React from 'react'
import {
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const InputWithIcon = ({ className, icon, inputType, inputName, placeholder, onChange, onBlur, value, errorsInput, touchedInput }) => (
  <>
    <CInputGroup className={className}>
      <CInputGroupPrepend>
        <CInputGroupText>
          <CIcon name={icon} />
        </CInputGroupText>
      </CInputGroupPrepend>
      <CInput
        type={inputType}
        name={inputName}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        value={value} />
    </CInputGroup>

    {errorsInput && touchedInput ? <div className="error-message">{errorsInput}</div> : null}
  </>
)

export default InputWithIcon