import React, { useState } from 'react'
import { Page } from './Page'
import { Button, Divider, Input, Title } from '@mantine/core'
import { login } from '../../lib/auth/auth'

export const Login = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async () => {
        await login(email, password)
    }
    return (
        <Page>
            <Title>Welcome back!</Title>
            <Divider className='my-2' />

            <Input className='w-56' value={email} onChange={(e) => setEmail(e.currentTarget.value)} placeholder='Email' />
            <Input className='w-56' value={password} onChange={(e) => setPassword(e.currentTarget.value)} placeholder='Password' />

            <Button onClick={handleSubmit}>Submit</Button>
        </Page>
    )
}