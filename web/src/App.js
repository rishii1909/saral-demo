import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Login } from './routes/auth/login';
import { AuthProvider } from './lib/auth/authContext';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Mails } from './mails/mails';


function App() {
  return (

    <AuthProvider>
      <MantineProvider>
        <Router>
          <Routes>
            <Route path='' element={<Login />} />
            <Route path='/mails' element={<Mails />} />
          </Routes>
        </Router>
      </MantineProvider>
    </AuthProvider>
  )
}

export default App;
