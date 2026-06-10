import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom';
import AddCollectionModal from '../components/AddCollectionModal'
import EditCollectionModal from '../components/EditCollectionModal'

interface Collections {
    collection_id: string
    nameRu: string     // русское название
    nameEn: string     // английское название
}

export default function AdminPanel() {
    const navigate = useNavigate()
    const [collections, setCollections] = useState<Collections[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [adding, setAdding] = useState(false)

    const [showEditModal, setShowEditModal] = useState(false)
    const [editingData, setEditingData] = useState<{ id: string; nameRu: string; nameEn: string } | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true'
    if (!isAuthenticated) {
        navigate('/admin/login')
    } else {
        loadCollections()
    }
    }, [navigate])
    
    const loadCollections = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase
          .from('collections')
          .select('collection_id, name, lang');
        if (error) throw error;

        const map = new Map<string, { collection_id: string; nameRu: string; nameEn: string }>();
        data?.forEach((item) => {
          const existing = map.get(item.collection_id);
          if (!existing) {
            map.set(item.collection_id, {
            collection_id: item.collection_id,
            nameRu: item.lang === 'ru' ? item.name : '',
            nameEn: item.lang === 'en' ? item.name : '',
            });
          } else {
            if (item.lang === 'ru') existing.nameRu = item.name;
            if (item.lang === 'en') existing.nameEn = item.name;
          }
        });
        setCollections(Array.from(map.values()));
    } catch (error) {
        console.error('Ошибка загрузки коллекций:', error);
        alert('Ошибка загрузки данных');
    } finally {
        setLoading(false);
    }
    }

    const getPreviewUrl = (collection_id: string) => {
        const { data } = supabase.storage
            .from('previews')
            .getPublicUrl(`${collection_id}.jpg`)
        return data.publicUrl
    }

    const uploadFile = async (collection_id: string, file: File) => {
        const path = `${collection_id}.jpg`
        try {
        const { data, error } = await supabase.storage
            .from('previews')
            .upload(path, file, {
                upsert: true,
                cacheControl: '3600'
            })
        if (error) {
            console.error('Ошибка:', error)
            alert(`Ошибка: ${error.message}`)
            return false
        }
        console.log('Успех:', data)
        return true
        } catch (error) {
            console.error('Ошибка:', error)
            return false
        }
    }

    const generateCollectionId = (englishName: string) => {
        const firstFive = englishName.slice(0, 5).toLowerCase()
        return `${firstFive}_id`
    }

    
    const handleAddCollection = async (nameRu: string, nameEn: string, file: File | null) => {
        if (!nameRu.trim() || !nameEn.trim()) {
            alert('Пожалуйста, введите название на русском и английском')
            return
        }
        setAdding(true)
        try {
            const collectionId = generateCollectionId(nameEn)
            const { data: existingRu } = await supabase
            .from('collections')
            .select('id')
            .eq('collection_id', collectionId)
            .eq('lang', 'ru')
            .maybeSingle()
            const { data: existingEn } = await supabase
            .from('collections')
            .select('id')
            .eq('collection_id', collectionId)
            .eq('lang', 'en')
            .maybeSingle()
            let photoUploaded = false
            if (file) {
                try {
                    photoUploaded = await uploadFile(collectionId, file)
                    if (photoUploaded) {
                        alert('Фото успешно загружено!')
                    } else {
                        alert('Не удалось загрузить фото, но коллекция будет добавлена без него.')
                    }
                } catch (uploadError) {
                    console.error('Ошибка загрузки фото:', uploadError)
                    alert('Ошибка при загрузке фото. Коллекция будет добавлена без фото.')
                }
            } else {
                alert('Фото не выбрано. Коллекция будет добавлена без фото.')
            }
            if (!existingRu) {
                const { error: errorRu } = await supabase
                    .from('collections')
                    .insert([{
                    collection_id: collectionId,
                    name: nameRu,
                    lang: 'ru'
                    }])
                if (errorRu) throw errorRu
            }
            if (!existingEn) {
                const { error: errorEn } = await supabase
                    .from('collections')
                    .insert([{
                    collection_id: collectionId,
                    name: nameEn,
                    lang: 'en'
                    }])
                if (errorEn) throw errorEn
            }
            alert('Коллекция успешно добавлена!')
            setShowAddModal(false)
            await loadCollections()
        } catch (error) {
            console.error('Ошибка при добавлении коллекции:', error)
            alert('Произошла ошибка при добавлении коллекции')
        } finally {
            setAdding(false)
        }
    }

    const handleEditClick = async (collection: Collections) => {
        const { data } = await supabase
            .from('collections')
            .select('name')
            .eq('collection_id', collection.collection_id)
            .eq('lang', 'en')
            .single()
        setEditingData({
            id: collection.collection_id,
            nameRu: collection.nameRu,
            nameEn: data?.name || '',
        })
        setShowEditModal(true)
    }

    const handleSaveEdit = async (newNameRu: string, newNameEn: string, newFile: File | null) => {
        if (!editingData) return
        setSaving(true)
        try {await supabase
            .from('collections')
            .update({ name: newNameRu })
            .eq('collection_id', editingData.id)
            .eq('lang', 'ru')
            await supabase
            .from('collections')
            .update({ name: newNameEn })
            .eq('collection_id', editingData.id)
            .eq('lang', 'en')
            if (newFile) {
                await uploadFile(editingData.id, newFile)
            }
            await loadCollections()
            setShowEditModal(false)
        } finally { setSaving(false) }
    }

    const handleDeleteCollection = async (collection_id: string, collectionName: string) => {
        if (window.confirm(`Вы уверены, что хотите удалить коллекцию "${collectionName}"?`)) {
            try {
                const { error: storageError } = await supabase.storage
                .from('previews')
                .remove([`${collection_id}.jpg`])

            if (storageError) {
                console.error('Ошибка удаления фото:', storageError)
            }
            const { error: deleteError } = await supabase
                .from('collections')
                .delete()
                .eq('collection_id', collection_id)

            if (deleteError) {
                console.error('Ошибка удаления коллекции:', deleteError)
                alert('Ошибка удаления коллекции: ' + deleteError.message)
                return
            }
            alert('Коллекция успешно удалена!')
            await loadCollections()
            } catch (error) {
            console.error('Ошибка при удалении:', error)
            alert('Произошла ошибка при удалении коллекции')
            }
        }
    }

    const PreviewImage = ({ collection_id, name }: { collection_id: string; name: string }) => {
    const [hasError, setHasError] = useState(false)
    const url = getPreviewUrl(collection_id)

    return (
        <>
          {!hasError && (
            <img
            src={url}
            alt={name}
            className="w-[510px] h-[600px] object-contain transition-all duration-500 group-hover:scale-110"
            onError={() => setHasError(true)}
            />
          )}
          {hasError && (
            <div className="w-[510px] h-[600px] flex items-center justify-center bg-gray-200">
            <span className="font-russo text-white-500">Нет фото</span>
            </div>
          )}
        </>
    )
    }

    return (
        <div>
            <div style={{ position: 'relative' }}>
                <div className="w-full h-[90px] flex justify-between items-center mt-[20px]">
                <div 
                    className='font-russo text-[72px] leading-[87px] text-center collection_title'
                    style={{ color: 'white' }}>
                    Админ-панель
                </div>
                <div className="flex gap-[20px]">
                    <button
                    onClick={() => setShowAddModal(true)}
                    className='bg-[#FFB36B] font-jost font-[500] text-[24px] rounded-[20px] w-[250px] h-[50px] 
                    flex items-center justify-center px-0 transition-all border-none hover:cursor-pointer'
                    style={{ color: 'white' }}>
                    Добавить коллекцию
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

                <div className='grid grid-cols-3 gap-5 justify-items-center mt-[50px]'>
                {collections.map((collection) => (
                    <div key={collection.collection_id} className='flex flex-col items-center mb-[20px]'>
                        <Link 
                            key={collection.collection_id}
                            to={`/admin/collection/${collection.collection_id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className='flex flex-col items-center justify-center overflow-hidden' style={{ width: '509px' }}>
                                <div className='w-[509px]'>
                                    <div className='w-[510px] h-[600px] flex items-center justify-center bg-gray-50'>
                                        <PreviewImage 
                                            collection_id={collection.collection_id} 
                                            name={collection.nameRu} />
                                    </div>
                                    <div className='min-h-[200px] flex items-top justify-center'>
                                        <p 
                                            className='text-[44px] font-jost font-[500] leading-[60px] m-0 mt-5 text-center break-normal'
                                            style={{ maxWidth: '509px' }}>
                                            {collection.nameRu}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <div className="flex justify-center gap-[10px]"> 
                        <button
                            onClick={() => handleEditClick(collection) }
                            className='bg-[#FFB36B] font-jost font-[500] text-[32px] rounded-[20px] w-[230px] h-[50px] 
                            flex items-center justify-center px-0 transition-all border-none hover:cursor-pointer'
                            style={{ color: 'white' }}>
                            Редактировать
                            </button>
                            <button
                            onClick={() => handleDeleteCollection(collection.collection_id, collection.nameRu)}
                            className='bg-[#FFB36B] font-jost font-[500] text-[32px] rounded-[20px] w-[200px] h-[50px] 
                            flex items-center justify-center px-0 transition-all border-none hover:cursor-pointer'
                            style={{ color: 'white' }}>
                            Удалить
                            </button>
                        </div>
                    </div>
                ))}
                
                </div>
                <AddCollectionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddCollection}
                uploading={adding}
                />

                {editingData && (
                <EditCollectionModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveEdit}
                    initialNameRu={editingData.nameRu}
                    initialNameEn={editingData.nameEn}
                    saving={saving}
                />
                )}
            </div>
        </div>
    )
}