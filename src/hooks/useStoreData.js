import { useState, useEffect } from 'react'
import { subscribe, getForms, getSubmissions, getWallet } from '../store/useStore.js'

export function useStoreData() {
  const [forms, setForms] = useState(getForms)
  const [submissions, setSubmissions] = useState(getSubmissions)
  const [wallet, setWallet] = useState(getWallet)

  useEffect(() => {
    return subscribe(() => {
      setForms([...getForms()])
      setSubmissions([...getSubmissions()])
      setWallet({ ...getWallet() })
    })
  }, [])

  return { forms, submissions, wallet }
}
