import './App.css'
import Users from './components/users'
import Verify from './components/verify'

function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isVerify = path.startsWith('/verify/');
  return (
    <div className="App">
      {isVerify ? <Verify /> : <Users />}
    </div>
  )
}

export default App
