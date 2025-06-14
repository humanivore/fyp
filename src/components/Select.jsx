import React from 'react';
import Options from './Options';

const Select = (props) => (
  <div className='select'>
    <Options metadata={props.location.data}/>
  </div>
)

export default Select;