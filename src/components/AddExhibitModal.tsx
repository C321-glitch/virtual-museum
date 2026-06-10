import { useState } from 'react'

interface AddExhibitModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (
    nameRu: string,
    nameEn: string,
    descriptionRu: string,
    descriptionEn: string,
    photoFile: File | null,
    modelFile: File | null
    ) => Promise<void>
    uploading: boolean
}

export default function AddExhibitModal({
    isOpen,
    onClose,
    onAdd,
    uploading
}: AddExhibitModalProps) {
    const [nameRu, setNameRu] = useState('')
    const [nameEn, setNameEn] = useState('')
    const [descriptionRu, setDescriptionRu] = useState('')
    const [descriptionEn, setDescriptionEn] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedModel, setSelectedModel] = useState<File | null>(null)

    const handleSubmit = async () => {
    await onAdd(nameRu, nameEn, descriptionRu, descriptionEn, selectedFile, selectedModel)
    if (!uploading) {
        setNameRu('')
        setNameEn('')
        setDescriptionRu('')
        setDescriptionEn('')
        setSelectedFile(null)
        setSelectedModel(null)
    }
    }
    
    if (!isOpen) return null
    

    return (
    <div className="fixed flex items-center justify-center">
        <div className="bg-[#FFFFFF] rounded-[20px] p-[32px] w-[500px] max-w-[90%] ">
            <div className="font-russo text-[24px] mb-[24px] text-center">Добавить новый экспонат</div>
            <div className="mb-[16px]">
                <label className="block font-jost mb-[8px] font-bold">Название на русском</label>
                <input
                type="text"
                value={nameRu}
                onChange={(e) => setNameRu(e.target.value)}
                className="w-full p-[8px] border border-[#4C4C4C] rounded-[8px]"
                placeholder="Введите название на русском"/>
            </div>
            <div className="mb-[16px]">
                <label className="block font-jost mb-[8px] font-bold">Название на английском</label>
                <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full p-[8px] border border-[#4C4C4C] rounded-[8px]"
                placeholder="Введите название на английском"/>
            </div>
            <div className="mb-[16px]">
                <label className="block font-jost mb-[8px] font-bold">Описание на русском</label>
                <textarea
                value={descriptionRu}
                onChange={(e) => setDescriptionRu(e.target.value)}
                className="w-full p-[8px] border border-[#4C4C4C] min-h-[80px] rounded-[8px]"
                placeholder="Введите описание на русском"/>
            </div>
            <div className="mb-[16px]">
                <label className="block font-jost mb-[8px] font-bold">Описание на английском</label>
                <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                className="w-full p-[8px] border border-[#4C4C4C] min-h-[80px] rounded-[8px]"
                placeholder="Введите описание на английском"/>
            </div>
            <div className="mb-[16px]">
                <label className="block font-jost mb-[8px] font-bold">Фото экспоната</label>
                <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full p-[8px] border border-[#4C4C4C] rounded-[8px] text-black"/>
            </div>
            <div className="mb-[24px]">
                <label className="block font-jost mb-[8px] font-bold">3D модель экспоната</label>
                <input
                type="file"
                accept=".glb,.gltf"
                onChange={(e) => setSelectedModel(e.target.files?.[0] || null)}
                className="w-full p-[8px] border border-[#4C4C4C] rounded-[8px] text-black"/>
                <small className="text-gray-500 text-xs">Формат: GLB</small>
            </div>
            <div className="flex gap-3">
                <button
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1 bg-[#0EB703] text-[#FFFFFF] py-[8px] rounded-[8px] disabled:opacity-50 hover:cursor-pointer">
                {uploading ? 'Добавление...' : 'Добавить экспонат'}
                </button>
                <button
                onClick={onClose}
                className="flex-1 bg-[#B1B1B1] text-[#FFFFFF] py-[8px] rounded-[8px] hover:cursor-pointer">
                Отмена
                </button>
            </div>
        </div>
    </div>
    )
}