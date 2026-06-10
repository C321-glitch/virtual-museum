import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

interface Exhibits {
    collection_id: string
    exhibit_id: string
    name: string
}

const ExhibitImage = ({ exhibit_id, name }: { exhibit_id: string; name: string }) => {
    const [hasError, setHasError] = useState(false)
    const { data } = supabase.storage
        .from('previews')
        .getPublicUrl(`${exhibit_id}.png`)
    const url = data.publicUrl

    return (
        <div className="w-[593px] h-[360px] flex items-center justify-center bg-gray-50">
            {!hasError ? (
                <img
                    src={url}
                    alt={name}
                    className="w-full h-full object-contain"
                    onError={() => setHasError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-[20px] font-russo">Нет фото</span>
                </div>
            )}
        </div>
    )
}

export default function AllExhibits() {
    const [exhibits, setExhibits] = useState<Exhibits[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [language, setLanguage] = useState<'ru' | 'en'>(() => {
        const saved = localStorage.getItem('app_language');
        return saved === 'en' ? 'en' : 'ru';
    });

    const translations = {
        ru: {
            loading: 'Загрузка экспонатов...',
            title: 'Список экспонатов',
            search: 'Поиск по названию',
            noexhibits: 'Экспонаты не найдены',
            nosearch: 'Ничего не найдено по вашему запросу',
        },
        en: {
            loading: 'Loading exhibits...',
            title: 'List of exhibits',
            search: 'Name search',
            noexhibits: 'The exhibits were not found',
            nosearch: 'Nothing was found for your query',
        }
    };

    const t = translations[language];

    const changeLanguage = (lang: 'ru' | 'en') => {
        setLanguage(lang);
        localStorage.setItem('app_language', lang);
    };

    const filteredExhibits = useMemo(() => {
        if (!searchQuery.trim()) return exhibits
        const lowerQuery = searchQuery.toLowerCase()
        return exhibits.filter(exhibit =>
            exhibit.name.toLowerCase().includes(lowerQuery)
        )
    }, [exhibits, searchQuery])

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            setError(null)
            try {
                const { data: exhibitsData, error: exhibitsError } = await supabase
                    .from('exhibits')
                    .select('collection_id, exhibit_id, name')
                    .eq('lang', language)
                if (exhibitsError) {
                    console.error('Ошибка загрузки экспонатов:', exhibitsError)
                    setError('Не удалось загрузить экспонаты')
                    setExhibits([])
                } else {
                    setExhibits(exhibitsData || [])
                }
            } catch (err) {
                console.error('Ошибка при загрузке:', err)
                setError('Произошла непредвиденная ошибка')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [language])

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header currentLanguage={language} onLanguageChange={changeLanguage} />
                <div className="flex-grow pt-[90px] text-center text-[20px] mt-[50px] text-[#FFFFFF] font-jost">
                    {t.loading}
                </div>
                <Footer currentLanguage={language} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header currentLanguage={language} onLanguageChange={changeLanguage} />
                <div className="flex-grow pt-[90px] text-center text-[20px] mt-[50px]">
                    {error}
                </div>
                <Footer currentLanguage={language} />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header currentLanguage={language} onLanguageChange={changeLanguage} />
            <div className="flex-grow pt-[90px]">
                <div className="font-russo text-[#FFFFFF] text-[72px] leading-[87px] mb-[50px] text-center mt-[50px]">
                    {t.title}
                </div>

                {/* Поле поиска */}
                <div className="flex justify-center items-center mb-[50px] px-4">
                    <input
                        type="text"
                        placeholder={t.search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full max-w-[600px] px-6 py-3 text-[18px] font-jost bg-white/10 backdrop-blur-sm border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    />
                </div>

                {filteredExhibits.length === 0 ? (
                    <div className="text-[#FFFFFF] font-jost text-center text-[20px] mt-[50px]">
                        {exhibits.length === 0 ? t.noexhibits : t.nosearch}
                    </div>
                ) : (
                    <div className="flex flex-col gap-[50px] w-full mb-[200px]">
                        {Array.from({ length: Math.ceil(filteredExhibits.length / 2) }, (_, rowIndex) => (
                            <div key={rowIndex} className="flex justify-around w-full">
                                {filteredExhibits.slice(rowIndex * 2, rowIndex * 2 + 2).map((exhibit) => (
                                    <Link
                                        key={exhibit.exhibit_id}
                                        to={`/exhibit/${exhibit.exhibit_id}`}
                                        className="flex flex-col items-center transform transition-all duration-300 hover:scale-105 no-underline text-[#FFFFFF]"
                                    >
                                        <ExhibitImage exhibit_id={exhibit.exhibit_id} name={exhibit.name} />
                                        <div className="font-jost text-[#FFFFFF] text-[64px] leading-[87px] w-[500px] min-h-[87px] text-center mt-[16px] break-normal">
                                            {exhibit.name}
                                        </div>
                                    </Link>
                                ))}
                                {filteredExhibits.slice(rowIndex * 2, rowIndex * 2 + 2).length === 1 && (
                                    <div className="w-[593px]"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer currentLanguage={language} />
        </div>
    )
}