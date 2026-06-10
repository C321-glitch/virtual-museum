import { Link } from 'react-router-dom'

interface HeaderProps {
  currentLanguage: 'ru' | 'en'
  onLanguageChange: (lang: 'ru' | 'en') => void
}

export default function Header({ currentLanguage, onLanguageChange }: HeaderProps) {
  const nextLanguage = currentLanguage === 'ru' ? 'en' : 'ru'
  const buttonText = currentLanguage === 'ru' ? 'EN' : 'RU'
  const translations = {
    ru: {
      home: 'Главная',
      exhibits: 'Список экспонатов',
      contacts: 'Контакты'
    },
    en: {
      home: 'Home',
      exhibits: 'List of exhibits',
      contacts: 'Contacts'
    }
  }
  const t = translations[currentLanguage]
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-[90px] bg-[#ffffffb5]">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex">
          <Link
            to="/"
            className="text-2xl text-[#000000] font-jost text-[2rem] bg-transparent border-none cursor-pointer text-black 
            hover:opacity-70 transition-opacity no-underline mr-[100px]">
            {t.home}
          </Link>
          <Link
            to="/allexhibits"
            className="text-2xl text-[#000000] font-jost text-[2rem] bg-transparent border-none cursor-pointer text-black 
            hover:opacity-70 transition-opacity no-underline">
            {t.exhibits}
          </Link>
        </div>
        <button
          onClick={() => onLanguageChange(nextLanguage)}
          className="text-2xl font-jost text-[2rem] bg-transparent border-none cursor-pointer text-black hover:opacity-70 transition-opacity">
          {buttonText}
        </button>
      </div>
    </header>
  )
}

