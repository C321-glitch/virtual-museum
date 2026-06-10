interface FooterProps {
  currentLanguage: 'ru' | 'en'
}

export default function Footer({ currentLanguage }: FooterProps) {
  const translations = {
    ru: {
      contacts: 'Контакты:',
      address: 'Адрес: город Уфа улица Кольцевая дом 3/1',
      telephone: 'Тел.: (347) 243-12-50; 5-990, 2-261 (вн.)',
      social: 'Социальные сети:',
      officialSite: 'Официальный сайт',
      vk: 'ВКонтакте',
      feedback: 'Обратная связь:',
    },

    en: {
      contacts: 'Contacts:',
      address: 'Address: 3/1 Koltsovaya Street, Ufa',
      telephone: 'Phone: (347) 243-12-50; 5-990, 2-261 (ext.)',
      social: 'Social media:',
      officialSite: 'Official site',
      vk: 'VKontakte',
      feedback: 'Feedback:',
    },
  }

  const t = translations[currentLanguage]

  return (
    <div id='footer_contacts' className='w-full h-[320px] bg-[#FFB36B] flex justify-between items-start footer mt-[150px]'>
      <div className='mt-[50px] ml-[35px] w-[300px]'>
        <div className='text-[#FFFFFF] text-[30px] font-jost text-left'>
          {t.contacts}
        </div>
        <div className='text-[#FFFFFF] text-[30px] font-jost text-left'>
          {t.address}
        </div>
        <div className='text-[#FFFFFF] text-[30px] font-jost text-left'>
          {t.telephone}
        </div>
      </div>
      <div className='flex flex-col items-center justify-center mt-[50px]'>
        <div className="text-[#FFFFFF] text-[30px] font-jost text-center">{t.social}</div>
        <div className="flex flex-col">
          <a href="https://rusoil.net/" target="_blank" rel="noopener noreferrer" className="text-[#FFFFFF] font-jost no-underline text-[30px] text-center">{t.officialSite}</a>
          <a href="https://vk.com/muzeiugntu" target="_blank" rel="noopener noreferrer" className="text-[#FFFFFF] font-jost no-underline text-[30px] text-center">{t.vk}</a>
        </div>
      </div>
      <div className='flex flex-col items-end mt-[50px] mr-[35px]'>
        <div className="text-[#FFFFFF] text-[30px] font-jost text-right">{t.feedback}</div>
        <div className="mt-[16px] flex flex-col">
          <a href="mailto:info@example.com" target="_blank" rel="noopener noreferrer" className="text-[#FFFFFF] font-jost no-underline text-[30px]">info@example.com</a>
        </div>
      </div>
    </div>
  )
}

