import { Link } from 'react-router-dom'
import Footer from '../components/layout/Footer.tsx'


export default function Home() {  return (
    <div className="home">
      <h1>Welcome to the Home Page</h1>
      <p>This is the home page of our application.</p>
      <Link to="/about">Go to About Page</Link>
      <Footer />
    </div>
    
  )
}