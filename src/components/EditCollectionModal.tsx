import { useState } from 'react'

interface EditCollectionModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (newNameRu: string, newNameEn: string, newFile: File | null) => Promise<void>
    initialNameRu: string
    initialNameEn: string
    saving: boolean
}

export default function EditCollectionModal({
    isOpen,
    onClose,
    onSave,
    initialNameRu,
    initialNameEn,
    saving,
}: EditCollectionModalProps) {
    const [nameRu, setNameRu] = useState(initialNameRu)
    const [nameEn, setNameEn] = useState(initialNameEn)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleSave = async () => {
    await onSave(nameRu, nameEn, selectedFile)
    }

    if (!isOpen) return null

    return (
    <div
    style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,}}
        onClick={onClose}>
        <div className="flex items-start justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#FFFFFF] rounded-[20px] p-[32px] w-[400px] max-w-[90%]">
                <div className="font-russo text-[24px] mb-[24px] text-center">Редактировать коллекцию</div>
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
                <div className="mb-[24px]">
                    <label className="block font-jost mb-[8px] font-bold">Фото коллекции</label>
                    <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full p-[8px] border border-[#4C4C4C] rounded-[8px] text-black"/>
                </div>
                <div className="flex gap-[12px]">
                    <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-[#0EB703] text-[#FFFFFF] py-[8px] rounded-[8px] disabled:opacity-50 hover:cursor-pointer">
                    {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                    onClick={onClose}
                    className="flex-1 bg-[#B1B1B1] text-[#FFFFFF] py-[8px] rounded-[8px] hover:cursor-pointer">
                    Отмена
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
}