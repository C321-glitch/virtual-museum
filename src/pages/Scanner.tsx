import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Header from './Header';
import Footer from './Footer';

export const Scanner = () => {
  const [error, setError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'ru' | 'en'>(() => {
    const saved = localStorage.getItem('app_language');
    return saved === 'en' ? 'en' : 'ru';
  });

    const translations = {
        ru: {
        QRScan: 'Отсканируйте QR-код экспоната',
        home: 'Главная',
        noperm: 'Не удалось запустить камеру. Проверьте разрешения',
        invalidQR: 'Неверный QR-код. Экспонат не найден в базе данных.',
        checking: 'Проверка...',
        },
        en: {
        QRScan: 'Scan the QR code of the exhibit',
        home: 'Home',
        noperm: 'Failed to start the camera. Check the permissions',
        invalidQR: 'Invalid QR code. Exhibit not found in the database.',
        checking: 'Checking...',
        },
    };

    const t = translations[language];
    const changeLanguage = (lang: 'ru' | 'en') => {
        setLanguage(lang);
        localStorage.setItem('app_language', lang);
    };

    const checkExhibitExists = useCallback(async (exhibitId: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase
        .from('exhibits')
        .select('exhibit_id')
        .eq('exhibit_id', exhibitId)
        .limit(1);

        if (error) {
        console.error('Ошибка Supabase:', error);
        return false;
        }
        return data && data.length > 0;
    } catch (err) {
        console.error('Ошибка при проверке экспоната:', err);
        return false;
    }
    }, []);

    const handleScan = useCallback(async (decodedText: string) => {
    if (isProcessing) return;

    const cleaned = decodedText.trim();
    if (!cleaned) return;

    setIsProcessing(true);
    setScanError(null);
    setError(null);

    try {
        const exists = await checkExhibitExists(cleaned);
        if (exists) {
        navigate(`/exhibit/${cleaned}`);
        } else {
        setScanError(t.invalidQR);
        }
    } catch (err) {
        console.error(err);
        setScanError(t.invalidQR);
    } finally {
        setIsProcessing(false);
    }
    }, [isProcessing, navigate, t, checkExhibitExists]);

    useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    const startScanner = async () => {
        try {
        await scanner.start(
            { facingMode: { exact: 'environment' } },
            {
            fps: 30,
            qrbox: { width: 300, height: 300 },
            aspectRatio: 1.0,
            },
            (decodedText) => {
            console.log('Распознано:', decodedText);
            handleScan(decodedText);
            },
            (errMsg) => {
            console.debug(errMsg);
            }
        );
        setError(null);
        } catch (err) {
        console.error(err);
        setError(t.noperm);
        }
    };

    startScanner();

    return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.warn);
        }
    };
    }, [navigate, t, handleScan]);

  return (
    <>
      <Header currentLanguage={language} onLanguageChange={changeLanguage} />
      <div className="min-h-screen stone_index flex flex-col items-center justify-start p-4 sm:p-5 md:p-6 pt-[90px]">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 w-full max-w-md flex-grow grid grid-rows-[auto,1fr,auto] gap-6">
          <div className="text-[#FFFFFF] font-russo text-center w-full">
            <div className="text-[clamp(2.25rem,8vw,4.5rem)] leading-[clamp(2.75rem,10vw,5.4375rem)]">
              {t.QRScan}
            </div>
          </div>
          <div
            id="qr-reader"
            className="w-full aspect-square flex flex-col rounded-xl overflow-hidden border-[#FFB36B] shadow-lg bg-black self-center"
          />
          <div className="flex flex-col items-center gap-4">
            {error && (
              <div className="p-3 text-[#FFFFFF] rounded-lg text-center font-jost text-sm sm:text-base bg-red-500/80">
                {error}
              </div>
            )}
            {scanError && (
              <div className="p-3 text-[#FFFFFF] rounded-lg text-center font-jost text-sm sm:text-base bg-red-500/80">
                {scanError}
              </div>
            )}
            {isProcessing && (
              <div className="p-3 text-[#FFFFFF] rounded-lg text-center font-jost text-sm sm:text-base bg-blue-500/80">
                {t.checking}
              </div>
            )}
            <button
              onClick={() => navigate(-1)}
              className="bg-[#FFB36B] text-[#FFFFFF] font-jost font-[500] text-[1.75rem] sm:text-[2.375rem] rounded-[1rem] sm:rounded-[1.25rem] w-[10rem] sm:w-[14.375rem] h-[3.125rem] sm:h-[3.75rem] flex items-center justify-center transition-all border-none hover:cursor-pointer"
            >
              {t.home}
            </button>
          </div>
        </div>
        <style>
          {`
            #qr-reader select, 
            #qr-reader option,
            .qr-reader__select {
              display: none !important;
            }
            #qr-reader video {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          `}
        </style>
      </div>
      <Footer currentLanguage={language} />
    </>
  );
};