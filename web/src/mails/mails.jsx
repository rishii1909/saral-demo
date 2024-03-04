import { useState, useEffect } from 'react'
import { Page } from '../routes/auth/Page'
import { fetchMails } from './utils'

export const Mails = () => {
  const [mails, setMails] = useState([])
  const [gtUID, setGtUID] = useState()
  const [ltUID, setltUID] = useState()

  useEffect(() => {

    const getMails = async () => {
      const mails = await fetchMails()
      setMails(mails)
    }

    getMails()



  }, [])


  return (
    <Page>
      {mails.length}
    </Page>
  )
}
