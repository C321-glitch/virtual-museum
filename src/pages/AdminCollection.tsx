import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import AddExhibitModal from '../components/AddExhibitModal'

// interface Collection {
//     collection_id: string
//     nameRu: string
//     nameEn: string
// }

interface Exhibits {
    collection_id: string
    exhibit_id: string
    nameRu: string     // русское название
    nameEn: string     // английское название
    descriptionRu: string
    descriptionEn: string
}

export default function AdminCollection() {
    const { id } = useParams<{ id: string }>()
    const [loading, setLoading] = useState(true)
    const [exhibits, setExhibits] = useState<Exhibits[]>([])
    const [collectionName, setCollectionName] = useState<string>('')
    const navigate = useNavigate()
    
    const [showAddModal, setShowAddModal] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true'
        if (!isAuthenticated) {
            navigate('/admin/login')
            return
        }
        if (!id) return
        
        const loadCollectionName = async () => {
            const { data, error } = await supabase
                .from('collections')
                .select('name')
                .eq('collection_id', id)
                .eq('lang', 'ru')
                .single()

            if (!error && data) {
                setCollectionName(data.name)
            }
        }

        loadCollectionName()
        loadExhibits()
    }, [navigate, id])

    const loadExhibits = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
            .from('exhibits')
            .select('exhibit_id, name, description, lang, collection_id')
            .eq('collection_id', id)
            if (error) throw error

                const map = new Map<string, Exhibits>()
                data?.forEach((item) => {
                    const existing = map.get(item.exhibit_id)
                    if (!existing) {
                        map.set(item.exhibit_id, {
                            collection_id: item.collection_id,
                            exhibit_id: item.exhibit_id,
                            nameRu: item.lang === 'ru' ? item.name : '',
                            nameEn: item.lang === 'en' ? item.name : '',
                            descriptionRu: item.lang === 'ru' ? item.description || '' : '',
                            descriptionEn: item.lang === 'en' ? item.description || '' : '',
                        })
                    } else {
                        if (item.lang === 'ru') {
                            existing.nameRu = item.name
                            existing.descriptionRu = item.description || ''
                        }
                        if (item.lang === 'en') {
                            existing.nameEn = item.name
                            existing.descriptionEn = item.description || ''
                        }
                    }
                })
                setExhibits(Array.from(map.values()))
            } catch (error) {
                console.error('Ошибка загрузки экспонатов:', error)
                alert('Ошибка загрузки данных')
            } finally {
                setLoading(false)
            }
    }

    const getExhibitImageUrl = (exhibit_id: string) => {
          const { data } = supabase.storage
            .from('previews')
            .getPublicUrl(`${exhibit_id}.png`)
          return data.publicUrl
    }

    const generateExhibitId = (englishName: string) => {
          const firstFive = englishName.slice(0, 5).toLowerCase()
          return `${firstFive}_id`
    }

    const uploadImage = async (exhibit_id: string, file: File) => {
          const path = `${exhibit_id}.png`
          
          try {
            const { error } = await supabase.storage
                .from('previews')
                .upload(path, file, {
                    upsert: true,
                    cacheControl: '3600'
                })

            if (error) {
                console.error('Ошибка загрузки фото:', error)
                alert(`Ошибка загрузки фото: ${error.message}`)
                return false
            }
            
            console.log('Фото успешно загружено')
            return true
          } catch (error) {
            console.error('Ошибка:', error)
            return false
          }
    }

    const uploadModel = async (exhibit_id: string, file: File) => {
          const path = `${exhibit_id}.glb`
          try {
            const { error } = await supabase.storage
                .from('models')
                .upload(path, file, {
                    upsert: true,
                    cacheControl: '3600'
                })
            if (error) {
                console.error('Ошибка загрузки модели:', error)
                alert(`Ошибка загрузки модели: ${error.message}`)
                return false
            }
            console.log('Модель успешно загружена')
            return true
          } catch (error) {
            console.error('Ошибка:', error)
            return false
          }
    }

    const handleAddExhibit = async (nameRu: string, nameEn: string, descriptionRu: string, descriptionEn: string, photoFile: File | null, modelFile: File | null) => {
        if (!nameRu.trim() || !nameEn.trim()) {
            alert('Пожалуйста, введите название на русском и английском')
            return
          }

          const exhibitId = generateExhibitId(nameEn)
          setUploading(true)

          try {
        // Проверка существования записей
          const { data: existingRu } = await supabase
            .from('exhibits')
            .select('id')
            .eq('exhibit_id', exhibitId)
            .eq('lang', 'ru')
            .maybeSingle()

          const { data: existingEn } = await supabase
            .from('exhibits')
            .select('id')
            .eq('exhibit_id', exhibitId)
            .eq('lang', 'en')
            .maybeSingle()

        // Загрузка фото и модели
        let photoUploaded = false
        if (photoFile) {
            try {
                photoUploaded = await uploadImage(exhibitId, photoFile)
                if (photoUploaded) {
                alert('Фото успешно загружено!')
                }
            } catch (uploadError) {
                console.error('Ошибка загрузки фото:', uploadError)
                alert('Ошибка при загрузке фото. Экспонат будет добавлен без него.')
            }
            } else {
            alert('Фото не выбрано. Экспонат будет добавлена без фото.')
            }

          if (!modelFile) throw new Error('Не выбрана 3D модель')
          const modelSuccess = await uploadModel(exhibitId, modelFile)
          if (!modelSuccess) throw new Error('Ошибка загрузки модели')
        let ModelUploaded = false
        if (modelFile) {
            try {
                ModelUploaded = await uploadImage(exhibitId, modelFile)
                if (ModelUploaded) {
                alert('3D модель успешно загружена!')
                }
            } catch (uploadError) {
                console.error('Ошибка загрузки 3D модели:', uploadError)
                alert('Ошибка при загрузке 3D модели. Экспонат будет добавлен без нее.')
            }
            } else {
            alert('3D модель не выбрана.')
            }

          alert('Файлы успешно загружены!')

        // Добавление записей в БД
          if (!existingRu) {
            const { error: errorRu } = await supabase.from('exhibits').insert([
            {
                collection_id: id,
                exhibit_id: exhibitId,
                name: nameRu,
                description: descriptionRu || 'Описание отсутствует',
                lang: 'ru'
            }
            ])
            if (errorRu) throw errorRu
          }

          if (!existingEn) {
            const { error: errorEn } = await supabase.from('exhibits').insert([
            {
                collection_id: id,
                exhibit_id: exhibitId,
                name: nameEn,
                description: descriptionEn || 'Description missing',
                lang: 'en'
            }
            ])
            if (errorEn) throw errorEn
          }

          alert('Экспонат успешно добавлен!')
          setShowAddModal(false)
          await loadExhibits()
        } catch (error) {
          console.error('Ошибка при добавлении экспоната:', error)
          alert('Произошла ошибка при добавлении экспоната')
          } finally {
          setUploading(false)
          }
    }

    const handleDeleteExhibit = async (exhibit_id: string, exhibitName: string) => {
        if (window.confirm(`Вы уверены, что хотите удалить экспонат "${exhibitName}"?`)) {
            try {
                // удаление фото
                const { error: storageErrorPng } = await supabase.storage
                    .from('previews')
                    .remove([`${exhibit_id}.png`])
                
                const { error: storageErrorJpg } = await supabase.storage
                    .from('previews')
                    .remove([`${exhibit_id}.jpg`])

                if (storageErrorPng && storageErrorJpg) {
                    console.error('Ошибка удаления фото:', storageErrorPng)
                }

                // удаление 3D модели
                const { error: modelError } = await supabase.storage
                    .from('models')
                    .remove([`${exhibit_id}.glb`])

                if (modelError) {
                    console.error('Ошибка удаления модели:', modelError)
                }

                // удаление записей
                const { error: deleteError } = await supabase
                    .from('exhibits')
                    .delete()
                    .eq('exhibit_id', exhibit_id)

                if (deleteError) {
                    console.error('Ошибка удаления экспоната:', deleteError)
                    alert('Ошибка удаления экспоната: ' + deleteError.message)
                    return
                }

            alert('Экспонат успешно удален!')
            await loadExhibits()
            } catch (error) {
            console.error('Ошибка при удалении:', error)
            alert('Произошла ошибка при удалении экспоната')
            }
    }
    }

    const ExhibitImage = ({ exhibit_id, name }: { exhibit_id: string; name: string }) => {
          const [hasError, setHasError] = useState(false)
          const url = getExhibitImageUrl(exhibit_id)

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
                        <span className="font-russo text-white-500">Нет фото</span>
                    </div>
                )}
            </div>
          )
    }

    return (
          <>
            <div className='w-full h-[90px] flex justify-between items-center mt-[50px]'>
                <div 
                    className="font-russo text-[72px] leading-[87px] text-center collection_title"
                    style={{ color: 'white' }}>
                    {collectionName}
                </div>
                <div className="flex gap-[20px]">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className='bg-[#FFB36B] font-jost font-[500] text-[24px] rounded-[20px] w-[250px] h-[50px] 
                        flex items-center justify-center px-0 transition-all border-none hover:cursor-pointer'
                        style={{ color: 'white' }}>
                        Добавить экспонат
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem('admin_authenticated')
                            navigate('/')
                        }}
                        className='bg-[#FFB36B] font-jost font-[500] text-[32px] rounded-[20px] w-[200px] h-[50px] 
                        flex items-center justify-center px-0 transition-all border-none hover:cursor-pointer'
                        style={{ color: 'white' }}>
                        Выйти
                    </button>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center">
                    <div className="text-center">
                    <div className="font-russo text-[72px] leading-[87px] mb-[20px]"
                    style={{ color: 'white' }}>Загрузка данных...</div>
                    </div>
                </div>
            )}

            <div className='grid grid-cols-2 gap-5 justify-items-center mt-[50px]'>
            {exhibits.map((exhibit) => (
                <div key={exhibit.exhibit_id} className='flex flex-col items-center mb-[20px]'>
                    <Link 
                        key={exhibit.exhibit_id}
                        to={`/admin/exhibit/${exhibit.exhibit_id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className='flex flex-col items-center justify-center overflow-hidden' style={{ width: '509px' }}>
                            <div className='w-[509px]'>
                                <div className='w-[510px] h-[600px] flex items-center justify-center bg-gray-50'>
                                    <ExhibitImage 
                                        exhibit_id={exhibit.exhibit_id} 
                                        name={exhibit.nameRu} />
                                </div>
                                <div className='min-h-[200px] flex items-top justify-center'>
                                    <p 
                                        className='text-[44px] font-jost font-[500] leading-[60px] m-0 mt-5 text-center break-normal'
                                        style={{ maxWidth: '509px' }}>
                                        {exhibit.nameRu}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <div className="flex justify-center gap-[10px]"> 
                        <button
                        onClick={() => handleDeleteExhibit(exhibit.exhibit_id, exhibit.nameRu)}
                        className='bg-[#FFB36B] font-jost font-[500] text-[32px] rounded-[20px] w-[200px] h-[50px] 
                        flex items-center justify-center px-0 transition-all border-none hover:cursor-pointer'
                        style={{ color: 'white' }}>
                        Удалить
                        </button>
                    </div>
                </div>
            ))}
            
            <AddExhibitModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddExhibit}
            uploading={uploading}/>
            </div>
          </>
    )
}