import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css"
import axios from 'axios';

function App() {
  const [isThemeDark, setIsThemeDark] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateQuery, setDateQuery] = useState('2000-06-21')

  async function getWebsite(event: React.FormEvent) {
    event.preventDefault()
    setIsSearching(true)

    var formattedDateQuery = dateQuery.replace('-', '')

    await axios.get(`https://archive.org/wayback/available?url=https://${searchQuery}&timestamp=${formattedDateQuery}`)
      .then((result) => {
        if (result.data.archived_snapshots.closest.url !== undefined) {
          var url = result.data.archived_snapshots.closest.url as string
          var position = 41
          var output = url.substring(0, position) + "if_" + url.substring(position);
          window.location.href = output
        }
        else {
          setIsSearching(false)
          setError('Sadly no captures of that website where found')
        }
      })
      .catch(() => {
        setIsSearching(false)
        setError('An Unexpected Error Ocurred')
      })
  }
  const searchChangeHandler = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchQuery(e.currentTarget.value);
  }
  const dateChangeHandler = (e: React.FormEvent<HTMLInputElement>) => {
    console.log(e.currentTarget.value)
    setDateQuery(e.currentTarget.value);
  }
  return (
    <div
      className={`App ${isThemeDark ? 'text-light' : 'text-dark'}`}
      style={{
        fontSmooth: "never",
        fontFamily: "Times New Roman",
        backgroundColor: `${isThemeDark ? 'black' : 'white'}`
      }}>
      {
        isSearching ?
          <div className='container text-center vh-100 p-5 d-flex align-items-center justify-content-center'>
            <div>
              <h5>One of our pigs is sniffing your website...</h5>
              <img src={require('./Assets/pig_eating_md_clr.gif')} alt="cartoon pig eating wheat"/>
            </div>
          </div> :
          <div className='container text-center vh-100 p-5 d-flex align-items-center justify-content-center'>
            <div>
              {
                isThemeDark ? <img src={require('./Assets/truffle_logo_light.png')} alt="truffle logo"/> : <img src={require('./Assets/truffle_logo.png')} alt="truffle logo"/>
              }
              <p>Dig the past of your favorite websites...</p>
              <form onSubmit={getWebsite}>
                <input value={searchQuery} onChange={searchChangeHandler} placeholder={"www.example.com"}></input>
                <button onClick={getWebsite}>Dig!</button>
              </form>
              <input className="my-1" type="date" min={'1990-01-01'} value={dateQuery} onChange={dateChangeHandler} />
              <p><small style={{color: "green"}}>Note: Truffle! is not a search engine. Please input domains in the www.example.com format.</small></p>
              <button onClick={() => { setIsThemeDark(!isThemeDark) }}>☼</button>
              {
                error ? <p style={{ color: 'red' }}>{error}</p> : <></>
              }
              <hr></hr>
              <div className='d-flex'>
                <div>
                  <img className='img-fluid' src={require('./Assets/bllage.gif')} alt="B Llage logo continuously spinning"/>
                </div>
                <div className='text-start'>
                  <p className='mt-2 mb-0'>©2022 B-Llage Digital Media</p>
                  <p className='m-0'><small>This project is possible thanks to the <a href='https://archive.org/web/'>Wayback Machine</a> and the <a href='https://archive.org/'>Internet Archive</a>.</small></p>
                  <p><small>See more projects by me: <a href='https://hectormagana.art'>Héctor Magaña</a></small></p>
                </div>
                <img src={require('./Assets/pigflying.gif')} alt="Pigs flying with the word 'home' attached"/>
              </div>

            </div>
          </div>
      }
    </div>
  );
}

export default App;
