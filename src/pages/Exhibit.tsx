import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ModelViewer from '../components/ModelViewer'
import Header from './Header'   // путь уточните под ваш проект
import Footer from './Footer'   // путь уточните под ваш проект

interface Exhibit {
    exhibit_id: string
    name: string
    description: string
}

export default function Exhibit() {
    const { id } = useParams<{ id: string }>()
    const [exhibit, setExhibit] = useState<Exhibit | null>(null)
    const [loading, setLoading] = useState(true)
    const [modelError, setModelError] = useState(false)
    const [checkingModel, setCheckingModel] = useState(false)
    const [language, setLanguage] = useState<'ru' | 'en'>(() => {
        const saved = localStorage.getItem('app_language');
        return saved === 'en' ? 'en' : 'ru';
});

    const changeLanguage = (lang: 'ru' | 'en') => {
        setLanguage(lang);
        localStorage.setItem('app_language', lang);
    };
    const translations = {
    ru: {
        loading: 'Загрузка 3D-модели...',
        noModel: 'Модель находится в разработке',
        home: 'На главную',
    },
    en: {
        loading: 'Loading a 3D model...',
        noModel: 'The model is under development',
        home: 'Home',
    }
    };

    const t = translations[language];


    const checkModelExists = useCallback(async (modelId: string) => {
        if (!modelId) return false
        try {
            setCheckingModel(true)
            const modelUrl = `https://iskqocnpwrqnagthprpq.supabase.co/storage/v1/object/public/models/${modelId}.glb`
            
            const response = await fetch(modelUrl, { method: 'HEAD' })
            return response.ok
        } catch (error) {
            console.error('Ошибка при проверке модели:', error)
            return false
        } finally {
            setCheckingModel(false)
        }
    }, [])

    useEffect(() => {
        if (!id) {
            setLoading(false)
            return
        }
        const loadData = async () => {
            try {
            const { data, error } = await supabase
                .from('exhibits')
                .select('name, description')
                .eq('exhibit_id', id)
                .eq('lang', language)
                .single()

            if (error) {
                console.error('Ошибка загрузки:', error)
                setExhibit(null)
            } else {
                setExhibit(data as Exhibit)

                const modelExists = await checkModelExists(id)
                if (!modelExists) {
                setModelError(true)
                }
            }
            } catch (error) {
            console.error('Ошибка при загрузке:', error)
            setExhibit(null)
            } finally {
            setLoading(false)
            }
        }
        loadData()
    }, [id, checkModelExists, language])


    if (loading || checkingModel) {
        return (
            <div className="stone_info_screen min-h-screen stone_index flex flex-col justify-center items-center">
            <div className="text-[#FFFFFF] text-center text-[20px]">
                {t.loading}
            </div>
            </div>
        )
    }
    if (!exhibit) {
        return (
            <div className="stone_info_screen min-h-screen stone_index flex flex-col justify-center items-center">
            <Link 
                to="/" 
                className="bg-[#FFB36B] font-jost font-[500] text-[36px] leading-[52px] rounded-[20px] w-[292px] h-[65px] flex items-center 
                justify-center px-0 transition-all border-none hover:cursor-pointer no-underline text-white" style={{ color: 'white' }}>
                {t.home}
            </Link>
            </div>
        )
    }

    const modelUrl = modelError 
    ? null 
    : `https://iskqocnpwrqnagthprpq.supabase.co/storage/v1/object/public/models/${id}.glb?alt=media`

    return (
        <>
        <Header currentLanguage={language} onLanguageChange={changeLanguage} />
        <div className="min-h-screen stone_index flex flex-col justify-between pt-[90px]">
            <div className="flex flex-col items-center">
            <div className="text-white font-russo text-[72px] leading-[87px] mb-[100px] text-center" style={{ color: 'white' }}>
                {exhibit.name}
            </div>

            <div className="flex justify-around w-full max-w-[1920px]">
                <div className="flex flex-col items-center">
                <div className="w-[593px] h-[360px] flex items-center justify-center rounded-lg">
                {modelError || !modelUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="text-[36px] font-alegreya text-center p-[16px]">
                        {t.noModel}
                    </div>
                    </div>
                ) : (
                    <ModelViewer 
                    modelUrl={modelUrl}
                    />
                )}
                </div>
                </div>
                <div className="font-jost text-[36px] leading-[52px] w-[587px] font-semibold">
                {exhibit.description && (
                <div className="mb-[16px]  text-[#FFFFFF]">{exhibit.description}</div>
                )}
                </div>
            </div>
            </div>
            
            <div className="flex justify-center pb-[100px] mt-16">
            <Link 
                to="/" 
                className="bg-[#FFB36B] text-[#FFFFFF] font-jost font-[500] text-[36px] leading-[52px] rounded-[20px] w-[292px] h-[65px] flex items-center justify-center px-0 
                transition-all border-none hover:cursor-pointer no-underline">
                {t.home}
            </Link>
            </div>
        </div>
        <Footer currentLanguage={language} />
    </>
    )
}