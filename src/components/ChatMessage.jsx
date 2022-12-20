import React from 'react';

export default function ChatMessage(props) {
  let {time, name, m_string} = props.message
  return (
    <div className='ml-1'>
        <p>{`${time} - [${name}]: `}</p>
        <p>{`${m_string}`}</p>
    </div>
  )
}
