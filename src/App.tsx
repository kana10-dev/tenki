import { useState, useEffect, useRef } from 'react';

interface Forecast {
  telop: string;
  image: { url: string };
}

interface WeatherData {
  title: string;
  forecasts: Forecast[];
}

interface City {
  name: string;
  code: string;
}

const CITIES: City[] = [
  { name: '札幌', code: '016010' },
  { name: '仙台', code: '040010' },
  { name: '東京', code: '130010' },
  { name: '横浜', code: '140010' },
  { name: '長野', code: '200010' },
  { name: '静岡', code: '220010' },
  { name: '名古屋', code: '230010' },
  { name: '京都', code: '260010' },
  { name: '大阪', code: '270000' },
  { name: '神戸', code: '280010' },
  { name: '岡山', code: '330010' },
  { name: '広島', code: '340010' },
  { name: '高松', code: '370000' },
  { name: '福岡', code: '400010' },
  { name: '熊本', code: '430010' },
  { name: '鹿児島', code: '460010' },
  { name: '那覇', code: '471010' },
];

const DEFAULT_BG = 'bg-sky-400';

function getBackgroundClass(telop: string): string {
  if (telop.includes('雪')) return 'bg-gradient-to-b from-blue-100 to-white';
  if (telop.includes('雨')) return 'bg-gradient-to-b from-blue-600 to-blue-400';
  if (telop.includes('曇')) return 'bg-gradient-to-b from-gray-400 to-gray-300';
  if (telop.includes('晴')) return 'bg-gradient-to-b from-yellow-300 to-orange-200';
  return DEFAULT_BG;
}

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [cityCode, setCityCode] = useState('130010');
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const suggestions = isFocused && query ? CITIES.filter(c => c.name.startsWith(query)) : [];

  useEffect(() => {
    fetchInfo(cityCode);
  }, [cityCode]);

  function fetchInfo(code: string) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setWeather(null);
    fetch(`https://weather.tsukumijima.net/api/forecast?city=${code}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(e => { if (e.name !== 'AbortError') console.log("エラー発生:", e); });
  }

  function handleSelect(city: City) {
    setQuery('');
    setCityCode(city.code);
  }

  const forecast = weather?.forecasts[0];
  const bgClass = forecast ? getBackgroundClass(forecast.telop) : DEFAULT_BG;

  return (
    <div className={`min-h-screen ${bgClass} transition-all duration-500 flex flex-col items-center justify-center gap-6 font-noto`}>
      <div className='relative w-72'>
        <input
          type='text'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder='都市名を入力...'
          className='w-full px-4 py-2 rounded-full shadow-md outline-none text-gray-700 bg-[#fff]'
        />
        {suggestions.length > 0 && (
          <ul className='absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg overflow-hidden z-10'>
            {suggestions.map(city => (
              <li
                key={city.code}
                onMouseDown={() => handleSelect(city)}
                className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
              >
                {city.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {forecast ? (
        <div className='text-center bg-white mx-auto w-fit p-20 rounded'>
          <h1 className='text-4xl font-bold text-shadow-lg'>{weather!.title}</h1>
          <img className='w-64 h-64 mx-auto' src={forecast.image.url} alt="" />
          <p className='text-xs text-[#c0c0c0] mb-5'>{forecast.telop}</p>
          <button
            className='border-2 p-2 bg-[#f5f5f5] hover:bg-[#a9a9a9] hover:scale-110 transition-all duration-300 rounded active:translate-y-1'
            onClick={() => fetchInfo(cityCode)}
          >
            再読み込み
          </button>
        </div>
      ) : (
        <p className='text-white'>読み込み中...</p>
      )}
    </div>
  );
}

export default App;
