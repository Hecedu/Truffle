import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css"
import axios from 'axios';

function App() {
  const [isThemeDark, setIsThemeDark] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [companyQuery, setCompanyQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [suggestions, setSuggestions] = useState<{ name: string, domain: string, logo?: string }[]>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
  const [dateParts, setDateParts] = useState({ day: '21', month: '06', year: '2000' })

  const months = [
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Feb' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' },
    { value: '05', label: 'May' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Aug' },
    { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' },
  ]
  const days = Array.from({ length: 31 }, (_, idx) => String(idx + 1).padStart(2, '0'))
  const minYear = 1990
  const maxYear = new Date().getFullYear()
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, idx) => String(minYear + idx))

  async function getWebsite(event?: React.FormEvent, domainOverride?: string) {
    if (event) event.preventDefault()
    setIsSearching(true)

    const formattedDateQuery = `${dateParts.year}${dateParts.month}${dateParts.day}`
    const domainToUse = domainOverride || selectedDomain || suggestions[0]?.domain

    if (!domainToUse) {
      setIsSearching(false)
      setError('Pick a company to continue')
      return
    }

    await axios.get(`https://archive.org/wayback/available?url=https://${domainToUse}&timestamp=${formattedDateQuery}`)
      .then((result) => {
        const closest = result?.data?.archived_snapshots?.closest
        const url = closest?.url as string | undefined

        if (url) {
          const position = 41
          const output = url.substring(0, position) + "if_" + url.substring(position);
          window.location.href = output;
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
  const onDarkThemeButton = () => {
    //save the theme in local storage
    localStorage.setItem('isThemeDark', JSON.stringify(!isThemeDark));
    setIsThemeDark(!isThemeDark);
  }
  const companyChangeHandler = async (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setCompanyQuery(value);
    setSelectedDomain('');
    setError('');

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingCompanies(true);
    try {
      const response = await axios.get(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(value)}`)
      setSuggestions(response.data || []);
    } catch (_) {
      setSuggestions([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  }
  const onSuggestionClick = (domain: string) => {
    setSelectedDomain(domain);
    setError('');
    getWebsite(undefined, domain);
  }
  const dateChangeHandler = (key: 'day' | 'month' | 'year') => (e: React.FormEvent<HTMLSelectElement>) => {
    const value = e.currentTarget?.value
    if (!value) return
    setDateParts((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
  const handleShow = (event: PageTransitionEvent) => {
    if (event.persisted) setIsSearching(false);
  };
  window.addEventListener('pageshow', handleShow);
  return () => window.removeEventListener('pageshow', handleShow);
}, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('isThemeDark');
    if (storedTheme) {
      setIsThemeDark(JSON.parse(storedTheme));
    } else {
      localStorage.setItem('isThemeDark', JSON.stringify(isThemeDark));
    }
    setIsSearching(false);
  }, [isThemeDark]);


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
                <input value={companyQuery} onChange={companyChangeHandler} placeholder={"Name or Domain"}></input>
                <button type='submit' className='mx-2'>Dig!</button>
              </form>
              <div className='my-2'>
                {isLoadingCompanies && <small>Finding companies...</small>}
                <div
                  className='d-flex flex-wrap justify-content-center gap-2 mx-auto'
                  style={{ maxWidth: '520px' }}
                >
                  {suggestions.map((company) => (
                    <button
                      key={company.domain}
                      type='button'
                      
                      onClick={() => onSuggestionClick(company.domain)}
                    >
                      {company.name} ({company.domain})
                    </button>
                  ))}
                </div>
              </div>
              <div className='d-flex justify-content-center gap-2 my-2'>
                <select value={dateParts.month} onChange={dateChangeHandler('month')} aria-label='Select month'>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                <select value={dateParts.day} onChange={dateChangeHandler('day')} aria-label='Select day'>
                  {days.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select value={dateParts.year} onChange={dateChangeHandler('year')} aria-label='Select year'>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <p><small style={{color: "green"}}>Note: Pick your company to auto-fill its domain before digging.</small></p>
              <button onClick={()=>{onDarkThemeButton()}}>☼</button>
              {
                error ? <p style={{ color: 'red' }}>{error}</p> : <></>
              }
              <hr></hr>
              <div className='d-flex'>
                <div>
                  <img className='img-fluid' src={require('./Assets/bllage.gif')} alt="B Llage logo continuously spinning"/>
                </div>
                <div className='text-start'>
                  <p className='mt-2 mb-0'>©2026 B-Llage Digital Media</p>
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
