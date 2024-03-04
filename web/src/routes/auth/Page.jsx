import { Center } from '@mantine/core'
import React from 'react'

export const Page = ({ children }) => {
    return (
        <Center className='h-screen bg-indigo-400'>
            <div className='flex flex-col space-y-4 shadow-lg px-8 py-4 justify-center items-center bg-white rounded-md'>
                {children}
            </div>
        </Center>
    )
}
