import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import ModelViewer from '../components/ModelViewer'
import EditExhibitModal from '../components/EditExhibitModal'

interface Exhibit {
  exhibit_id: string
  name: string
  description: string
}

export default function AdminExhibit() {
  const { id } = useParams<{ id: string }>()
  const [exhibit, setExhibit] = useState<Exhibit | null>(null)
  const [loading, setLoading] = useState(true)
  const [modelError, setModelError] = useState(false)
  const [checkingModel, setCheckingModel] = useState(false)
  const navigate = useNavigate()

  // Состояния для модального окна редактирования
  const [showEditModal, setShowEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editExhibitData, setEditExhibitData] = useState<{
    id: string
    nameRu: string
    nameEn: string
    descriptionRu: string
    descriptionEn: string
  } | null>(null)

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

  const loadEnglishData = useCallback(async (exhibitId: string) => {
    const { data, error } = await supabase
      .from('exhibits')
      .select('name, description')
      .eq('exhibit_id', exhibitId)
      .eq('lang', 'en')
      .maybeSingle()
    if (error) {
      console.error('Ошибка загрузки английской версии:', error)
      return { nameEn: '', descriptionEn: '' }
    }
    return {
      nameEn: data?.name || '',
      descriptionEn: data?.description || ''
    }
  }, [])

    const uploadImage = async (exhibit_id: string, file: File) => {
        const path = `${exhibit_id}.png`
        const { error } = await supabase.storage
        .from('previews')
        .upload(path, file, { upsert: true, cacheControl: '3600' })
        if (error) {
        console.error('Ошибка загрузки фото:', error)
        return false
        }
        return true
    }
    const uploadModel = async (exhibit_id: string, file: File) => {
        const path = `${exhibit_id}.glb`
        const { error } = await supabase.storage
        .from('models')
        .upload(path, file, { upsert: true, cacheControl: '3600' })
        if (error) {
            console.error('Ошибка загрузки модели:', error)
            return false
        }
        return true
    }

    const handleEditClick = async () => {
        if (!id || !exhibit) return
        const { nameEn, descriptionEn } = await loadEnglishData(id)
        setEditExhibitData({
        id: id,
        nameRu: exhibit.name,
        nameEn: nameEn,
        descriptionRu: exhibit.description || '',
        descriptionEn: descriptionEn
        })
        setShowEditModal(true)
    }


    const handleSaveExhibit = async (newNameRu: string, newNameEn: string, newDescriptionRu: string, 
        newDescriptionEn: string, newPhotoFile: File | null, newModelFile: File | null) => {
        if (!editExhibitData) return
        setSaving(true)
        try {
        await supabase
            .from('exhibits')
            .update({ name: newNameRu, description: newDescriptionRu })
            .eq('exhibit_id', editExhibitData.id)
            .eq('lang', 'ru')
        await supabase
            .from('exhibits')
            .update({ name: newNameEn, description: newDescriptionEn })
            .eq('exhibit_id', editExhibitData.id)
            .eq('lang', 'en')
        if (newPhotoFile) {
            const success = await uploadImage(editExhibitData.id, newPhotoFile)
            if (!success) throw new Error('Не удалось загрузить фото')
        }
        if (newModelFile) {
            const success = await uploadModel(editExhibitData.id, newModelFile)
            if (!success) throw new Error('Не удалось загрузить модель')
        }
        alert('Экспонат успешно обновлён')
        const { data, error } = await supabase
            .from('exhibits')
            .select('name, description')
            .eq('exhibit_id', editExhibitData.id)
            .single()
        if (!error && data) {
            setExhibit(data as Exhibit)
        }
        setShowEditModal(false)
        } catch (error) {
        console.error(error)
        alert('Ошибка при обновлении экспоната')
        } finally {
        setSaving(false)
        }
    }   

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
          .eq('lang', 'ru')
          .single()

        if (error) {
          console.error('Ошибка загрузки:', error)
          setExhibit(null)
        } else {
          setExhibit(data as Exhibit)
          const modelExists = await checkModelExists(id)
          setModelError(!modelExists)
        }
      } catch (error) {
        console.error('Ошибка при загрузке:', error)
        setExhibit(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, checkModelExists])

  if (loading || checkingModel) {
    return (
      <div className="stone_info_screen min-h-screen stone_index flex flex-col justify-center items-center">
        <div className="load_text font-russo text-center text-[100px] text-white">
          Загрузка...
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
          justify-center px-0 transition-all border-none hover:cursor-pointer no-underline text-white">
          На главную
        </Link>
      </div>
    )
  }

  const modelUrl = modelError 
    ? null 
    : `https://iskqocnpwrqnagthprpq.supabase.co/storage/v1/object/public/models/${id}.glb?alt=media`

  return (
    <div className="min-h-screen stone_index flex flex-col justify-between pt-8 mt-[20px]">
      <div className="flex flex-col items-center">
        <div className='w-full h-[90px] grid grid-cols-[1fr_auto_1fr] items-center mt-[20px]'>
          <div></div>
          <div 
            className="font-russo text-[72px] leading-[87px] text-center collection_title"
            style={{ color: 'white' }}>
            {exhibit.name}
          </div>
          <div className="flex gap-[20px] justify-end">
            <button
              onClick={handleEditClick}
              className='bg-[#FFB36B] font-jost font-[500] text-[24px] rounded-[20px] w-[250px] h-[50px] 
              flex items-center justify-center px-0 transition-all border-none hover:cursor-pointer'
              style={{ color: 'white' }}>
              Редактировать
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

        <div className="flex justify-around w-full max-w-[1920px] mt-[50px]">
          <div className="flex flex-col items-center">
            <div className="w-[593px] h-[360px] flex items-center justify-center rounded-lg">
              {modelError || !modelUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="text-[36px] font-alegreya text-center p-[16px]">
                    Модель находится в разработке
                  </div>
                </div>
              ) : (
                <ModelViewer modelUrl={modelUrl} />
              )}
            </div>
          </div>
          <div className="font-jost text-[36px] leading-[52px] w-[587px] font-semibold">
            {exhibit.description && (
              <div className="mb-[16px]" style={{ color: 'white' }}>{exhibit.description}</div>
            )}
          </div>
        </div>
      </div>

      {editExhibitData && (
        <EditExhibitModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveExhibit}
        initialNameRu={editExhibitData.nameRu}
        initialNameEn={editExhibitData.nameEn}
        initialDescriptionRu={editExhibitData.descriptionRu}
        initialDescriptionEn={editExhibitData.descriptionEn}
         saving={saving}
        />
      )}
    </div>
  )
}