import Header from './Header'
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom';
import Footer from './Footer'

interface Collections {
    collection_id: string
    name: string
}

export default function MainHome() {
    const [collections, setCollections] = useState<Collections[]>([])
    const [loading, setLoading] = useState(true)
    const [isMobile, setIsMobile] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const currentCollection = collections[currentIndex];

    const [language, setLanguage] = useState<'ru' | 'en'>(() => {
        const saved = localStorage.getItem('app_language');
        return saved === 'en' ? 'en' : 'ru';});
    const changeLanguage = (lang: 'ru' | 'en') => {
        setLanguage(lang);
        localStorage.setItem('app_language', lang);
    };

    
    const translations = {
    ru: {
        loading: 'Загрузка коллекций...',
        heroTitle: 'Виртуальный музей',
        heroSubtitle: 'Погрузитесь в виртуальный мир "Музея истории УГНТУ"',
        startBtn: 'Начать',
        museumTitle: '"Музей истории УГНТУ"',
        museumDesc: 'В начале образовательный центр был комнатой в первом корпусе УГНТУ. Но со временем он перерос в отдельное здание, где хранится история университета и знания о нефтегазовой отрасли.',
        digitalCollections: 'Цифровые коллекции',
        collectionsDesc: 'Уникальные экспонаты, оцифрованные для внимательного изучения в мельчайших подробностях – рассматривайте, приближайте, открывайте для себя новое.',
    },
    en: {
        loading: 'Loading collections...',
        heroTitle: 'Virtual Museum',
        heroSubtitle: 'Immerse yourself in the virtual world of the "Museum of History of USPTU"',
        startBtn: 'Start',
        museumTitle: '"Museum of History of USPTU"',
        museumDesc: 'Initially, the educational center was a room in the first building of USPTU. But over time it grew into a separate building that houses the history of the university and knowledge about the oil and gas industry.',
        digitalCollections: 'Digital Collections',
        collectionsDesc: 'Unique exhibits digitized for careful study in the smallest details – view, zoom, discover new things.',
    }
    };

    const t = translations[language];

    useEffect(() => {
        setLoading(true);
        supabase
        .from('collections')
        .select('collection_id, name')
        .eq('lang', language)
        .then(({ data }) => {
        setCollections(data || [])
        setLoading(false)})
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [language])

    const getPreviewUrl = (collection_id: string) => {
        const { data } = supabase.storage
        .from('previews')
        .getPublicUrl(`${collection_id}.jpg`)
        return data.publicUrl
    }

    const PreviewImage = ({ collection_id, name }: { collection_id: string; name: string }) => {
        const [hasError, setHasError] = useState(false)
        const url = getPreviewUrl(collection_id)
        return (
            <>
            <img
                src={url}
                alt={name}
                className="w-[31.875rem] h-[37.5rem] object-contain transition-all duration-500 group-hover:scale-110"
                onError={() => setHasError(true)}
                style={{ display: hasError ? 'none' : 'block' }}/>
            </>
        )
    }

    const handlePrev = () => {
          setDirection(-1);
          setCurrentIndex((prev) => (prev === 0 ? collections.length - 1 : prev - 1));
    };

    const handleNext = () => {
          setDirection(1);
          setCurrentIndex((prev) => (prev === collections.length - 1 ? 0 : prev + 1));
    };

    const variants = {
          enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
          }),
          center: {
            x: 0,
            opacity: 1
          },
          exit: (direction: number) => ({
            x: direction > 0 ? -300 : 300,
            opacity: 0
          })
    };

    return (
    <>
        <Header currentLanguage={language} onLanguageChange={changeLanguage} />

        <div id='startweb' className='min-h-screen w-full flex justify-center px-12 hero-section bg-cover bg-center bg-no-repeat' 
        style={{ backgroundImage: "url('/logomuseum.png')" }}>
            <div className='w-full h-[31.25rem] bg-[#7FC2E8]/71 sticky top-[5.625rem] flex flex-col justify-center items-center main_info'>
                <p className='text-[6.25rem] font-russo font-[400] leading-[5.625rem] mt-[1.4375rem] mb-[5rem]'>
                    {t.heroTitle}
                </p>
                <p className='text-[2.75rem] leading-[3.75rem] font-jost font-[500] text-center mt-[0px] mb-[1.25rem] w-[37.5rem]'>
                    {t.heroSubtitle}
                </p>
                <a href={isMobile ? "/scanner" : "#tocollections"} className="inline-block no-underline">
                    <button
                        className='bg-[#FFB36B] font-jost font-[500] text-[2.375rem] rounded-[1.25rem] w-[14.375rem] h-[3.75rem] 
                        flex items-center justify-center px-0 transition-all border-none hover:cursor-pointer mb-0'>
                        {t.startBtn}
                    </button>
                </a>
            </div>
        </div>

        <div id='toinfo' className='w-full flex flex-col items-center mt-[12.5rem] museum_info'>
            <div className='w-full max-w-[1600px] mx-auto px-8'>
                <div className='flex justify-end mb-12'>
                <motion.p
                    initial={{ x: -200, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.2, margin: "-100px 0px -100px 0px" }}
                    transition={{ duration: 0.8 }}
                    className='text-[6.25rem] font-russo font-[400] leading-[5.625rem] text-right w-[62.5rem]'>
                    {t.museumTitle}
                </motion.p>
                </div>
                <div className='flex justify-center items-start gap-[10rem] flex-wrap'>
                    <div className='w-[46.875rem] max-w-full'>
                        <img src="/museumphoto.png" className="w-full h-auto object-cover" alt="museum" />
                    </div>

                    <motion.p
                        initial={{ x: -200, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.2, margin: "-100px 0px -100px 0px" }}
                        transition={{ duration: 0.8 }}
                        className='text-[2.75rem] font-jost font-[500] leading-[3.75rem] mt-[3.9375rem] mb-0 text-right flex-1 min-w-[37.5rem]'>
                            {t.museumDesc}
                    </motion.p>
                </div>
            </div>
        </div>

        <div id='tocollections' className='w-full flex flex-col items-center mt-[12.5rem] collection_info'>
            <div className='w-full max-w-[2000px] mx-auto px-8'>
                <div className='flex justify-start mb-12'>
                    <motion.p
                        initial={{ x: 200, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8 }}
                        className='text-[6.25rem] font-russo font-[400] leading-[5.625rem] mt-[0px] mb-[0px] text-left'>
                        {t.digitalCollections}
                    </motion.p>
                </div>
                <div className='flex justify-center items-center gap-[10rem] flex-wrap mt-20'>
                    <div className='flex flex-col ml-[1.875rem] w-[50rem]'>
                        <motion.p
                            initial={{ x: 200, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className='text-[2.75rem] font-jost font-[500] leading-[3.75rem] mt-[3.9375rem] mb-[0px] text-left'>
                        {t.collectionsDesc}
                        </motion.p>
                    </div>
                    
                    <div className='flex items-center justify-center list_collection gap-[1.25rem] overflow-visible'>
                        {loading ? (
                            <div className="text-white font-jost text-[24px] text-center py-20">
                                {t.loading}
                            </div>
                        ) : (
                        <>
                        <button 
                            onClick={handlePrev}
                            className="text-white no-underline hover:text-white cursor-pointer bg-transparent border-none"
                            style={{ transform: 'translateY(-3.75rem)' }}>
                            <span className="material-icons text-[7.5rem]">chevron_left</span>
                        </button>
                        <Link 
                            key={currentCollection?.collection_id}
                            to={`/collection/${currentCollection?.collection_id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className='flex flex-col items-center justify-center overflow-hidden' style={{ width: '31.8125rem' }}>
                                <motion.div
                                    key={currentCollection?.collection_id || currentIndex}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.5 }}
                                    style={{ width: '31.8125rem' }}>
                                    <div className='w-[31.875rem] h-[37.5rem] flex items-center justify-center bg-gray-50 mt-100'>
                                        {currentCollection && (
                                            <PreviewImage 
                                                collection_id={currentCollection.collection_id} 
                                                name={currentCollection.name} />
                                        )}
                                    </div>
                                    <div className='min-h-[12.5rem] flex items-top justify-center w-full'>
                                        <motion.p 
                                            key={`title-${currentCollection?.collection_id || currentIndex}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.2 }}
                                            className='text-[2.75rem] font-jost font-[500] leading-[3.75rem] m-[0px] mt-[1.25rem] text-center break-normal w-full'
                                            style={{ maxWidth: '100%' }}>
                                            {currentCollection?.name}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            </div>
                        </Link>
                        <button 
                            onClick={handleNext}
                            className="text-white no-underline hover:text-white cursor-pointer bg-transparent border-none"
                            style={{ transform: 'translateY(-3.75rem)' }}>
                            <span className="material-icons text-[7.5rem]">chevron_right</span>
                        </button>
                         </>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <Footer currentLanguage={language} />
          </>
    );
}