import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import axios from 'axios'
import './index.css'

function Container() {
  const [token, setToken] = useState('')
  useEffect(()=>{
    if (token==='') {
      if (import.meta.env.MODE === 'development') {
      const username = import.meta.env.VITE_REACT_APP_USER
      const password = import.meta.env.VITE_REACT_APP_PASSWORD
      axios.defaults.auth = {
        username,
        password,
      }
      console.log('DEV MODE - set default username and password ',axios.defaults.auth)
      setToken('dev mode')
    } else {
      axios.get('/api/x_1122545_react_0/react_app/get_token')
        .then( r =>{
          axios.defaults.headers['X-userToken'] = r.data.result.sessionToken
          console.log('PROD MODE - recieved ServiceNow token: ',r.data.result.sessionToken)
          setToken(r.data.result.token)
        })
    }
  }
},[])
    return (
      <>
      {token!=='' && <App/>}
      </>
    )
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Container />
    </StrictMode>,
  )
