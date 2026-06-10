import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Header from './Header'   // путь уточните под ваш проект
import Footer from './Footer'   // путь уточните под ваш проект

interface Collection {
    collection_id: string
    name: string
}

interface Exhibits {
    collection_id: string
    exhibit_id: string
    name: string
}


export default function Collections() {
    const { id } = useParams<{ id: string }>()
    const [collections, setCollections] = useState<Collection | null>(null)
    const [exhibits, setExhibits] = useState<Exhibits[]>([])
    const [language, setLanguage] = useState<'ru' | 'en'>(() => {
        const saved = localStorage.getItem('app_language');
        return saved === 'en' ? 'en' : 'ru';
});
    const translations = {
    ru: {
        loading: 'Загрузка экспонатов...',
        noPhoto: 'Нет фото',
    },
    en: {
        loading: 'Loading exhibits...',
        noPhoto: 'There is no photo',
    }
    };

    const t = translations[language];

    const changeLanguage = (lang: 'ru' | 'en') => {
        setLanguage(lang);
        localStorage.setItem('app_language', lang);
    };

    useEffect(() => {
        if (!id) return
        const loadData = async () => {
            setCollections(null)
            setExhibits([])
            try {
                const { data: collectionData, error: collectionError } = await supabase
                    .from('collections')
                    .select('name')
                    .eq('collection_id', id)
                    .eq('lang', language)
                    .single()

                if (collectionError) {
                    console.error('Ошибка загрузки коллекции:', collectionError)
                    setCollections(null)
                } else {
                    setCollections(collectionData as Collection)
                }

                const { data: exhibitsData, error: exhibitsError } = await supabase
                    .from('exhibits')
                    .select('collection_id, exhibit_id, name')
                    .eq('collection_id', id)
                    .eq('lang', language)

                if (exhibitsError) {
                    console.error('Ошибка загрузки экспонатов:', exhibitsError)
                    setExhibits([])
                } else {
                    setExhibits(exhibitsData || [])
                }
            } catch (error) {
                console.error('Ошибка при загрузке:', error)
            }
        }
        loadData()
    }, [id, language])

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
                    <span className="text-[20px] font-russo">{t.noPhoto}</span>
                </div>
            )}
        </div>
    )
}

    return (
        <>
            {/* Шапка с переключателем языка */}
        <Header currentLanguage={language} onLanguageChange={changeLanguage} />

            {/* Основной контент с отступом сверху, чтобы не перекрывался фиксированной шапкой */}
            <div className="pt-[90px]">
                <div
                    className="font-russo text-[72px] text-[#FFFFFF] leading-[87px] mb-[100px] text-center collection_title mt-[50px] text-white"
                >
                    {collections?.name}
                </div>
                <div className="flex flex-col gap-[50px] w-full mb-[200px]">
                    {exhibits.length === 0 ? (
                        <div className="text-[#FFFFFF] front-jost text-center text-[20px]">
                            {t.loading}
                        </div>
                    ) : (
                        Array.from({ length: Math.ceil(exhibits.length / 2) }, (_, rowIndex) => (
                            <div key={rowIndex} className="flex justify-around w-full">
                                {exhibits.slice(rowIndex * 2, rowIndex * 2 + 2).map((exhibit) => (
                                    <Link
                                        key={exhibit.exhibit_id}
                                        to={`/exhibit/${exhibit.exhibit_id}`}
                                        className="flex flex-col items-center transform transition-all duration-300 hover:scale-105 no-underline text-white"
                                    >
                                        <ExhibitImage
                                            exhibit_id={exhibit.exhibit_id}
                                            name={exhibit.name}
                                        />
                                        <div className="font-jost text-[#FFFFFF] text-[64px] leading-[87px] w-[500px] min-h-[87px] text-center mt-[16px] break-normal text-white">
                                            {exhibit.name}
                                        </div>
                                    </Link>
                                ))}
                                {exhibits.slice(rowIndex * 2, rowIndex * 2 + 2).length === 1 && (
                                    <div className="w-[593px]"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Футер */}
            <Footer currentLanguage={language} />
        </>
    )
}