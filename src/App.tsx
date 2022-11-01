import React, { ChangeEventHandler, useState } from 'react';
import logo from './logo.svg';
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
      if (result.data.archived_snapshots.closest.url != undefined) {
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
    .catch(()=> {
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
              <h1>One of our pigs is sniffing your website...</h1>
              <img src={require('./Assets/pig_eating_md_clr.gif')}></img>
            </div>
          </div> :
          <div className='container text-center vh-100 p-5 d-flex align-items-center justify-content-center'>
            <div>
              <h1 className='display-2' style={{ textShadow: `${isThemeDark ? 'yellow' : 'black'} 0px 5px 8px` }}>Truffle!</h1>
              <p>Dig your favorite websites...</p>
              <form onSubmit={getWebsite}>
                <input value={searchQuery} onChange={searchChangeHandler}></input>
                <button onClick={getWebsite}>Dig!</button>
              </form>
              <input className="my-1" type="date" value={dateQuery} onChange={dateChangeHandler} />
              <p className='mt-2 mb-0'>©2022 B-Llage Digital Media</p>
              <small>This project is possible thanks to the <a href='https://archive.org/web/'>Wayback Machine</a> and the <a href='https://archive.org/'>Internet Archive</a>.</small>
              <p></p>
              <button onClick={() => { setIsThemeDark(!isThemeDark) }}>☼</button>
            </div>
          </div>
      }
    </div>
  );
}

export default App;
